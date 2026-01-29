// Popup JavaScript

let timerState = null;
let settings = null;

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
  setupEventListeners();
  startSync();
});

// Load data from storage
async function loadData() {
  // Get timer state
  const timerResult = await chrome.storage.local.get('timerState');
  timerState = timerResult.timerState || {
    mode: 'focus',
    state: 'idle',
    timeRemaining: 25 * 60,
    sessionsCompleted: 0,
    lastUpdate: Date.now()
  };
  
  // Get settings
  const settingsResult = await chrome.storage.sync.get('settings');
  settings = settingsResult.settings || {
    focusDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sessionsUntilLongBreak: 4,
    autoStartBreaks: false,
    autoStartFocus: false,
    soundEnabled: true,
    notificationsEnabled: true,
    strictMode: true,
    blacklist: [],
    whitelist: []
  };
  
  updateUI();
}

// Setup event listeners
function setupEventListeners() {
  // Settings button
  document.querySelector('.settings-btn').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
  
  // Control buttons
  document.querySelector('.start-btn').addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'START_TIMER' });
  });
  
  document.querySelector('.pause-btn').addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'PAUSE_TIMER' });
  });
  
  document.querySelector('.reset-btn').addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'RESET_TIMER' });
  });
  
  // Mode buttons
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.mode;
      chrome.runtime.sendMessage({ type: 'SWITCH_MODE', mode });
    });
  });
  
  // Open focus page
  document.querySelector('[data-testid="open-focus-page-button"]').addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('focus.html') });
  });
  
  // Listen for storage changes
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (changes.timerState) {
      timerState = changes.timerState.newValue;
      updateUI();
    }
  });
}

// Start sync (update every second)
function startSync() {
  setInterval(async () => {
    await loadData();
  }, 1000);
}

// Update UI
function updateUI() {
  // Update timer display
  const minutes = Math.floor(timerState.timeRemaining / 60);
  const seconds = timerState.timeRemaining % 60;
  document.querySelector('.timer-display').textContent = 
    `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  
  // Update mode indicator
  const modeLabels = {
    focus: 'Focus Mode',
    shortBreak: 'Short Break',
    longBreak: 'Long Break'
  };
  document.querySelector('.mode-indicator').textContent = modeLabels[timerState.mode];
  
  // Update mode buttons
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === timerState.mode);
  });
  
  // Update control buttons
  const startBtn = document.querySelector('.start-btn');
  const pauseBtn = document.querySelector('.pause-btn');
  
  if (timerState.state === 'running') {
    startBtn.classList.add('hidden');
    pauseBtn.classList.remove('hidden');
  } else {
    startBtn.classList.remove('hidden');
    pauseBtn.classList.add('hidden');
  }
  
  // Update progress bar
  const totalDuration = getTotalDuration();
  const progress = (timerState.timeRemaining / totalDuration) * 100;
  document.querySelector('.progress-fill').style.width = `${progress}%`;
  
  // Update stats
  document.querySelector('[data-testid="sessions-today"]').textContent = timerState.sessionsCompleted;
  
  const totalFocusMinutes = timerState.sessionsCompleted * settings.focusDuration;
  const hours = Math.floor(totalFocusMinutes / 60);
  const mins = totalFocusMinutes % 60;
  document.querySelector('[data-testid="total-focus-time"]').textContent = `${hours}h ${mins}m`;
}

// Get total duration for current mode
function getTotalDuration() {
  const durations = {
    focus: settings.focusDuration * 60,
    shortBreak: settings.shortBreakDuration * 60,
    longBreak: settings.longBreakDuration * 60
  };
  return durations[timerState.mode];
}
