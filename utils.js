// Shared utility functions for FocusLock

// Default settings
const DEFAULT_SETTINGS = {
  focusDuration: 25, // minutes
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsUntilLongBreak: 4,
  autoStartBreaks: false,
  autoStartFocus: false,
  soundEnabled: true,
  notificationsEnabled: true,
  strictMode: true,
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
};

const TIMER_MODES = {
  FOCUS: 'focus',
  SHORT_BREAK: 'shortBreak',
  LONG_BREAK: 'longBreak'
};

const TIMER_STATES = {
  IDLE: 'idle',
  RUNNING: 'running',
  PAUSED: 'paused'
};

// Get settings from storage
async function getSettings() {
  const result = await chrome.storage.sync.get('settings');
  return result.settings || DEFAULT_SETTINGS;
}

// Save settings to storage
async function saveSettings(settings) {
  await chrome.storage.sync.set({ settings });
}

// Get timer state from storage
async function getTimerState() {
  const result = await chrome.storage.local.get('timerState');
  return result.timerState || {
    mode: TIMER_MODES.FOCUS,
    state: TIMER_STATES.IDLE,
    timeRemaining: 25 * 60, // seconds
    sessionsCompleted: 0,
    lastUpdate: Date.now()
  };
}

// Save timer state to storage
async function saveTimerState(timerState) {
  await chrome.storage.local.set({ timerState });
}

// Get tasks from storage
async function getTasks() {
  const result = await chrome.storage.local.get('tasks');
  return result.tasks || [];
}

// Save tasks to storage
async function saveTasks(tasks) {
  await chrome.storage.local.set({ tasks });
}

// Format time in MM:SS
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// Check if a URL is blocked
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

// Check if we're in focus mode
async function isInFocusMode() {
  const timerState = await getTimerState();
  return timerState.mode === TIMER_MODES.FOCUS && timerState.state === TIMER_STATES.RUNNING;
}

// Generate notification sound (simple beep)
function playNotificationSound() {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.value = 800;
  oscillator.type = 'sine';
  
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.5);
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    DEFAULT_SETTINGS,
    TIMER_MODES,
    TIMER_STATES,
    getSettings,
    saveSettings,
    getTimerState,
    saveTimerState,
    getTasks,
    saveTasks,
    formatTime,
    isUrlBlocked,
    isInFocusMode,
    playNotificationSound
  };
}
