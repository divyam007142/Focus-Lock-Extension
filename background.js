// Background service worker for FocusLock

let timerInterval = null;
let focusTabId = null;
let savedTabs = [];

// Initialize extension
chrome.runtime.onInstalled.addListener(async () => {
  console.log('FocusLock installed');
  
  // Initialize default settings
  const result = await chrome.storage.sync.get('settings');
  if (!result.settings) {
    await chrome.storage.sync.set({
      settings: {
        focusDuration: 25,
        shortBreakDuration: 5,
        longBreakDuration: 15,
        sessionsUntilLongBreak: 4,
        autoStartBreaks: false,
        autoStartFocus: false,
        soundEnabled: true,
        notificationsEnabled: true,
        strictMode: true,
        username: '',
        soundscapeEnabled: false,
        selectedSoundscape: 'none',
        blacklist: [
          'facebook.com',
          'twitter.com',
          'instagram.com',
          'youtube.com',
          'reddit.com',
          'tiktok.com',
          'netflix.com',
          'twitch.tv',
          'discord.com',
          'snapchat.com'
        ],
        whitelist: []
      }
    });
  }
  
  // Initialize timer state
  await chrome.storage.local.set({
    timerState: {
      mode: 'focus',
      state: 'idle',
      timeRemaining: 25 * 60,
      sessionsCompleted: 0,
      lastUpdate: Date.now(),
      currentFocusTopic: '',
      currentFocusSubject: ''
    }
  });
});

// Handle messages from other parts of the extension
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'START_TIMER') {
    startTimer(message.focusTopic, message.focusSubject).then(() => sendResponse({ success: true }));
    return true;
  } else if (message.type === 'PAUSE_TIMER') {
    pauseTimer();
    sendResponse({ success: true });
  } else if (message.type === 'RESET_TIMER') {
    resetTimer();
    sendResponse({ success: true });
  } else if (message.type === 'END_SESSION') {
    endSession().then(() => sendResponse({ success: true }));
    return true;
  } else if (message.type === 'SWITCH_MODE') {
    switchMode(message.mode);
    sendResponse({ success: true });
  } else if (message.type === 'GET_TIMER_STATE') {
    getTimerState().then(state => sendResponse(state));
    return true;
  } else if (message.type === 'CHECK_URL') {
    checkUrlAndBlock(message.url).then(result => sendResponse(result));
    return true;
  } else if (message.type === 'TAB_SWITCH_WARNING') {
    // Notify all tabs about tab switch during focus
    handleTabSwitchWarning();
    sendResponse({ success: true });
  }
});

// Handle tab switch warning
function handleTabSwitchWarning() {
  chrome.runtime.sendMessage({ type: 'PLAY_WARNING_SOUND' }).catch(() => {});
}

// Start the timer
async function startTimer(focusTopic = '', focusSubject = '') {
  const timerState = await getTimerState();
  
  // Save current tabs if starting focus mode
  if (timerState.mode === 'focus' && timerState.state !== 'running') {
    await saveCurrentTabs();
  }
  
  timerState.state = 'running';
  timerState.lastUpdate = Date.now();
  timerState.currentFocusTopic = focusTopic || timerState.currentFocusTopic;
  timerState.currentFocusSubject = focusSubject || timerState.currentFocusSubject;
  await saveTimerState(timerState);
  
  // Start interval
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(updateTimer, 1000);
  
  // Open or switch to focus page
  await openFocusPage();
  
  // Broadcast state change
  broadcastTimerState();
}

// Save current tabs before focus session
async function saveCurrentTabs() {
  const tabs = await chrome.tabs.query({ currentWindow: true });
  savedTabs = tabs
    .filter(tab => !tab.url.includes('focus.html') && !tab.url.startsWith('chrome://'))
    .map(tab => ({ url: tab.url, title: tab.title }));
  
  await chrome.storage.local.set({ savedTabs });
  console.log('Saved tabs:', savedTabs.length);
}

// Restore tabs after session ends
async function restoreTabsAfterSession() {
  const result = await chrome.storage.local.get('savedTabs');
  const tabsToRestore = result.savedTabs || [];
  
  if (tabsToRestore.length > 0) {
    // Close focus page if it exists
    if (focusTabId) {
      try {
        await chrome.tabs.remove(focusTabId);
      } catch (e) {
        console.log('Focus tab already closed');
      }
      focusTabId = null;
    }
    
    // Restore saved tabs
    for (const tabInfo of tabsToRestore) {
      try {
        await chrome.tabs.create({ url: tabInfo.url, active: false });
      } catch (e) {
        console.error('Error restoring tab:', e);
      }
    }
    
    // Clear saved tabs
    await chrome.storage.local.set({ savedTabs: [] });
    savedTabs = [];
    console.log('Restored tabs:', tabsToRestore.length);
  }
}

// Open or switch to focus page
async function openFocusPage() {
  const focusUrl = chrome.runtime.getURL('focus.html');
  
  // Check if focus page is already open
  const tabs = await chrome.tabs.query({ url: focusUrl });
  
  if (tabs.length > 0) {
    // Focus page exists, switch to it
    focusTabId = tabs[0].id;
    await chrome.tabs.update(focusTabId, { active: true });
    await chrome.windows.update(tabs[0].windowId, { focused: true });
  } else {
    // Create new focus page
    const tab = await chrome.tabs.create({ url: focusUrl, active: true });
    focusTabId = tab.id;
  }
}

// Pause the timer
async function pauseTimer() {
  const timerState = await getTimerState();
  timerState.state = 'paused';
  await saveTimerState(timerState);
  
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  
  broadcastTimerState();
}

// End session manually
async function endSession() {
  const timerState = await getTimerState();
  const settings = await getSettings();
  
  // Stop timer
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  
  // If in focus mode, complete the session
  if (timerState.mode === 'focus') {
    timerState.sessionsCompleted++;
  }
  
  // Restore tabs
  await restoreTabsAfterSession();
  
  // Reset to idle state
  timerState.state = 'idle';
  timerState.timeRemaining = settings.focusDuration * 60;
  timerState.mode = 'focus';
  timerState.lastUpdate = Date.now();
  await saveTimerState(timerState);
  
  broadcastTimerState();
}

// Reset the timer
async function resetTimer() {
  const settings = await getSettings();
  const timerState = await getTimerState();
  
  const durations = {
    focus: settings.focusDuration * 60,
    shortBreak: settings.shortBreakDuration * 60,
    longBreak: settings.longBreakDuration * 60
  };
  
  timerState.timeRemaining = durations[timerState.mode];
  timerState.state = 'idle';
  timerState.lastUpdate = Date.now();
  await saveTimerState(timerState);
  
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  
  broadcastTimerState();
}

// Switch timer mode
async function switchMode(mode) {
  const settings = await getSettings();
  const timerState = await getTimerState();
  
  const durations = {
    focus: settings.focusDuration * 60,
    shortBreak: settings.shortBreakDuration * 60,
    longBreak: settings.longBreakDuration * 60
  };
  
  timerState.mode = mode;
  timerState.timeRemaining = durations[mode];
  timerState.state = 'idle';
  timerState.lastUpdate = Date.now();
  await saveTimerState(timerState);
  
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  
  broadcastTimerState();
}

// Update timer every second
async function updateTimer() {
  const timerState = await getTimerState();
  
  if (timerState.state !== 'running') {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    return;
  }
  
  timerState.timeRemaining--;
  timerState.lastUpdate = Date.now();
  
  if (timerState.timeRemaining <= 0) {
    await handleTimerComplete(timerState);
  } else {
    await saveTimerState(timerState);
    broadcastTimerState();
  }
}

// Handle timer completion
async function handleTimerComplete(timerState) {
  const settings = await getSettings();
  
  // Play notification sound and show alert
  if (settings.notificationsEnabled) {
    const messages = {
      focus: 'Focus session complete! Time for a break.',
      shortBreak: 'Break is over! Ready to focus?',
      longBreak: 'Long break complete! Ready for another session?'
    };
    
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon-128.png',
      title: 'FocusLock',
      message: messages[timerState.mode],
      priority: 2
    });
  }
  
  // Update session count and switch mode
  if (timerState.mode === 'focus') {
    timerState.sessionsCompleted++;
    
    // Decide next mode
    if (timerState.sessionsCompleted % settings.sessionsUntilLongBreak === 0) {
      timerState.mode = 'longBreak';
      timerState.timeRemaining = settings.longBreakDuration * 60;
    } else {
      timerState.mode = 'shortBreak';
      timerState.timeRemaining = settings.shortBreakDuration * 60;
    }
    
    if (settings.autoStartBreaks) {
      timerState.state = 'running';
      // Stay on focus page, just switch mode
      await openFocusPage();
    } else {
      timerState.state = 'idle';
      // Restore tabs and close focus page
      await restoreTabsAfterSession();
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
    }
  } else {
    // Break is over, switch to focus
    timerState.mode = 'focus';
    timerState.timeRemaining = settings.focusDuration * 60;
    
    if (settings.autoStartFocus) {
      timerState.state = 'running';
      await openFocusPage();
    } else {
      timerState.state = 'idle';
      // Restore tabs and close focus page
      await restoreTabsAfterSession();
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
    }
  }
  
  timerState.lastUpdate = Date.now();
  await saveTimerState(timerState);
  broadcastTimerState();
}

// Broadcast timer state to all open extension pages
function broadcastTimerState() {
  chrome.runtime.sendMessage({ type: 'TIMER_UPDATE' }).catch(() => {
    // Ignore errors if no receivers
  });
}

// Check if URL should be blocked
async function checkUrlAndBlock(url) {
  const settings = await getSettings();
  const timerState = await getTimerState();
  
  // Only block during focus mode
  if (timerState.mode !== 'focus' || timerState.state !== 'running') {
    return { blocked: false };
  }
  
  if (!settings.strictMode) {
    return { blocked: false };
  }
  
  // Check if URL is blocked
  const blocked = isUrlBlocked(url, settings);
  return { blocked };
}

// Handle tab creation - block if in strict focus mode
chrome.tabs.onCreated.addListener(async (tab) => {
  const settings = await getSettings();
  const timerState = await getTimerState();
  
  if (settings.strictMode && timerState.mode === 'focus' && timerState.state === 'running') {
    // Redirect to focus page
    chrome.tabs.update(tab.id, {
      url: chrome.runtime.getURL('focus.html')
    });
  }
});

// Handle navigation - redirect blocked sites
chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  if (details.frameId !== 0) return; // Only main frame
  
  const settings = await getSettings();
  const timerState = await getTimerState();
  
  if (settings.strictMode && timerState.mode === 'focus' && timerState.state === 'running') {
    const blocked = isUrlBlocked(details.url, settings);
    
    if (blocked && !details.url.includes('focus.html')) {
      chrome.tabs.update(details.tabId, {
        url: chrome.runtime.getURL('focus.html?blocked=true')
      });
    }
  }
});

// Handle tab activation - warn about tab switching in strict mode
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const settings = await getSettings();
  const timerState = await getTimerState();
  
  if (settings.strictMode && timerState.mode === 'focus' && timerState.state === 'running') {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    
    // If switching away from focus page, trigger warning
    if (!tab.url.includes('focus.html')) {
      const blocked = isUrlBlocked(tab.url, settings);
      
      if (blocked) {
        chrome.tabs.update(activeInfo.tabId, {
          url: chrome.runtime.getURL('focus.html?blocked=true')
        });
      } else {
        // Send warning message to content script
        chrome.tabs.sendMessage(activeInfo.tabId, { 
          type: 'SHOW_TAB_SWITCH_WARNING' 
        }).catch(() => {});
      }
    }
  }
});

// Utility functions (duplicated from utils.js for service worker)
async function getTimerState() {
  const result = await chrome.storage.local.get('timerState');
  return result.timerState || {
    mode: 'focus',
    state: 'idle',
    timeRemaining: 25 * 60,
    sessionsCompleted: 0,
    lastUpdate: Date.now(),
    currentFocusTopic: '',
    currentFocusSubject: ''
  };
}

async function saveTimerState(timerState) {
  await chrome.storage.local.set({ timerState });
}

async function getSettings() {
  const result = await chrome.storage.sync.get('settings');
  return result.settings || {
    focusDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sessionsUntilLongBreak: 4,
    autoStartBreaks: false,
    autoStartFocus: false,
    soundEnabled: true,
    notificationsEnabled: true,
    strictMode: true,
    username: '',
    soundscapeEnabled: false,
    selectedSoundscape: 'none',
    blacklist: [],
    whitelist: []
  };
}

function isUrlBlocked(url, settings) {
  if (!url) return false;
  
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.replace('www.', '');
    
    // Check whitelist first
    if (settings.whitelist.some(site => hostname.includes(site))) {
      return false;
    }
    
    // Check blacklist
    return settings.blacklist.some(site => hostname.includes(site));
  } catch (e) {
    return false;
  }
}
