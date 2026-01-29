// Focus page JavaScript

let timerState = null;
let settings = null;
let tasks = [];

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
  setupEventListeners();
  startTimerSync();
  renderTasks();
  checkIfBlocked();
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
  
  // Get tasks
  const tasksResult = await chrome.storage.local.get('tasks');
  tasks = tasksResult.tasks || [];
  
  updateUI();
}

// Setup event listeners
function setupEventListeners() {
  // Mode tabs
  document.querySelectorAll('.mode-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const mode = tab.dataset.mode;
      switchMode(mode);
    });
  });
  
  // Control buttons
  document.querySelector('.start-btn').addEventListener('click', startTimer);
  document.querySelector('.pause-btn').addEventListener('click', pauseTimer);
  document.querySelector('.reset-btn').addEventListener('click', resetTimer);
  
  // Task input
  document.querySelector('.add-task-btn').addEventListener('click', addTask);
  document.querySelector('.task-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTask();
  });
  
  // Listen for storage changes
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (changes.timerState) {
      timerState = changes.timerState.newValue;
      updateUI();
    }
    if (changes.tasks) {
      tasks = changes.tasks.newValue;
      renderTasks();
    }
  });
  
  // Listen for timer updates from background
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'TIMER_UPDATE') {
      loadData();
    }
  });
}

// Start timer sync (update every second)
function startTimerSync() {
  setInterval(() => {
    if (timerState.state === 'running') {
      updateUI();
    }
  }, 1000);
}

// Update UI based on timer state
function updateUI() {
  // Update timer display
  const minutes = Math.floor(timerState.timeRemaining / 60);
  const seconds = timerState.timeRemaining % 60;
  document.querySelector('.timer-display').textContent = 
    `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  
  // Update mode tabs
  document.querySelectorAll('.mode-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.mode === timerState.mode);
  });
  
  // Update timer label
  const labels = {
    focus: 'Focus Time',
    shortBreak: 'Short Break',
    longBreak: 'Long Break'
  };
  document.querySelector('.timer-label').textContent = labels[timerState.mode];
  
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
  
  // Update session counter
  document.querySelector('.session-count').textContent = timerState.sessionsCompleted;
}

// Start timer
async function startTimer() {
  chrome.runtime.sendMessage({ type: 'START_TIMER' });
}

// Pause timer
async function pauseTimer() {
  chrome.runtime.sendMessage({ type: 'PAUSE_TIMER' });
}

// Reset timer
async function resetTimer() {
  chrome.runtime.sendMessage({ type: 'RESET_TIMER' });
}

// Switch mode
async function switchMode(mode) {
  chrome.runtime.sendMessage({ type: 'SWITCH_MODE', mode });
}

// Add task
async function addTask() {
  const input = document.querySelector('.task-input');
  const subjectSelector = document.querySelector('.subject-selector');
  
  const taskText = input.value.trim();
  const subject = subjectSelector.value || 'Other';
  
  if (!taskText) return;
  
  const task = {
    id: Date.now(),
    text: taskText,
    subject: subject,
    completed: false,
    createdAt: new Date().toISOString()
  };
  
  tasks.push(task);
  await chrome.storage.local.set({ tasks });
  
  input.value = '';
  subjectSelector.value = '';
  renderTasks();
}

// Render tasks
function renderTasks() {
  const container = document.querySelector('.tasks-container');
  container.innerHTML = '';
  
  if (tasks.length === 0) {
    return;
  }
  
  tasks.forEach(task => {
    const card = document.createElement('div');
    card.className = `task-card ${task.completed ? 'completed' : ''}`;
    card.dataset.testid = 'task-card';
    
    card.innerHTML = `
      <div class="task-info">
        <div class="task-subject">${task.subject}</div>
        <div class="task-text">${task.text}</div>
      </div>
      <div class="task-actions">
        <button class="task-complete-btn" data-testid="task-complete-btn">✓</button>
        <button class="task-delete-btn" data-testid="task-delete-btn">✕</button>
      </div>
    `;
    
    // Complete button
    card.querySelector('.task-complete-btn').addEventListener('click', async () => {
      task.completed = !task.completed;
      await chrome.storage.local.set({ tasks });
      renderTasks();
    });
    
    // Delete button
    card.querySelector('.task-delete-btn').addEventListener('click', async () => {
      tasks = tasks.filter(t => t.id !== task.id);
      await chrome.storage.local.set({ tasks });
      renderTasks();
    });
    
    container.appendChild(card);
  });
}

// Check if current page is blocked
function checkIfBlocked() {
  const urlParams = new URLSearchParams(window.location.search);
  const blocked = urlParams.get('blocked');
  
  if (blocked === 'true') {
    document.querySelector('.warning-message').classList.remove('hidden');
    
    // Play notification sound
    if (settings.soundEnabled) {
      playWarningSound();
    }
  }
}

// Play warning sound
function playWarningSound() {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.value = 600;
  oscillator.type = 'sine';
  
  gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.3);
}
