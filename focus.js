// Focus page JavaScript

let timerState = null;
let settings = null;
let tasks = [];
let soundscapeAudio = null;
let isPlaying = false;

// Motivational quotes
const quotes = {
  Work: [
    "Success is the sum of small efforts repeated day in and day out.",
    "The only way to do great work is to love what you do.",
    "Work hard in silence, let success make the noise.",
    "Don't watch the clock; do what it does. Keep going."
  ],
  Study: [
    "Education is the most powerful weapon you can use to change the world.",
    "The beautiful thing about learning is that no one can take it away from you.",
    "Study while others are sleeping; work while others are loafing.",
    "The expert in anything was once a beginner."
  ],
  Exercise: [
    "The only bad workout is the one that didn't happen.",
    "Your body can stand almost anything. It's your mind you have to convince.",
    "Take care of your body. It's the only place you have to live.",
    "Fitness is not about being better than someone else. It's about being better than you used to be."
  ],
  Reading: [
    "Reading is to the mind what exercise is to the body.",
    "A reader lives a thousand lives before he dies.",
    "The more that you read, the more things you will know.",
    "Books are a uniquely portable magic."
  ],
  Writing: [
    "You can make anything by writing.",
    "Start writing, no matter what. The water does not flow until the faucet is turned on.",
    "The scariest moment is always just before you start.",
    "There is no greater agony than bearing an untold story inside you."
  ],
  Other: [
    "Focus on being productive instead of busy.",
    "The secret of getting ahead is getting started.",
    "You don't have to be great to start, but you have to start to be great.",
    "Small daily improvements are the key to staggering long-term results."
  ]
};

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
  setupEventListeners();
  startTimerSync();
  renderTasks();
  checkIfBlocked();
  updateGreeting();
  updateFocusTopicDisplay();
  initSoundscape();
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
    lastUpdate: Date.now(),
    currentFocusTopic: '',
    currentFocusSubject: ''
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
    username: '',
    soundscapeEnabled: false,
    selectedSoundscape: 'none',
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
  document.querySelector('.start-btn').addEventListener('click', () => {
    showFocusTopicPrompt();
  });
  document.querySelector('.pause-btn').addEventListener('click', pauseTimer);
  document.querySelector('.reset-btn').addEventListener('click', resetTimer);
  document.querySelector('.end-session-btn').addEventListener('click', () => {
    if (confirm('Are you sure you want to end this session?')) {
      endSession();
    }
  });
  
  // Task input
  document.querySelector('.add-task-btn').addEventListener('click', addTask);
  document.querySelector('.task-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTask();
  });
  
  // Soundscape controls
  document.querySelector('.soundscape-selector').addEventListener('change', (e) => {
    changeSoundscape(e.target.value);
  });
  
  document.querySelector('.soundscape-play-btn').addEventListener('click', toggleSoundscape);
  
  document.querySelector('.soundscape-volume').addEventListener('input', (e) => {
    if (soundscapeAudio) {
      soundscapeAudio.volume = e.target.value / 100;
    }
  });
  
  // Listen for storage changes
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (changes.timerState) {
      timerState = changes.timerState.newValue;
      updateUI();
      updateFocusTopicDisplay();
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
    } else if (message.type === 'PLAY_WARNING_SOUND') {
      playWarningSound();
    }
  });
}

// Show focus topic prompt
function showFocusTopicPrompt() {
  const topic = prompt('What are you focusing on today? (Optional)', timerState.currentFocusTopic || '');
  
  if (topic === null) {
    // User cancelled
    return;
  }
  
  startTimer(topic.trim());
}

// Start timer sync (update every second)
function startTimerSync() {
  setInterval(() => {
    if (timerState.state === 'running') {
      updateUI();
    }
  }, 1000);
}

// Update greeting based on time of day
function updateGreeting() {
  const hour = new Date().getHours();
  let greeting = 'Good morning';
  
  if (hour >= 12 && hour < 17) {
    greeting = 'Good afternoon';
  } else if (hour >= 17) {
    greeting = 'Good evening';
  }
  
  const username = settings.username || 'User';
  document.querySelector('.greeting-text').textContent = `${greeting}, ${username}`;
}

// Update focus topic display with quote
function updateFocusTopicDisplay() {
  const display = document.querySelector('.focus-topic-display');
  
  if (timerState.currentFocusTopic || timerState.currentFocusSubject) {
    const topic = timerState.currentFocusTopic || timerState.currentFocusSubject;
    const subject = timerState.currentFocusSubject || 'Other';
    
    // Get random quote for subject
    const subjectQuotes = quotes[subject] || quotes.Other;
    const randomQuote = subjectQuotes[Math.floor(Math.random() * subjectQuotes.length)];
    
    display.innerHTML = `
      <div class="focus-topic-title">${topic}</div>
      <div class="focus-quote">"${randomQuote}"</div>
    `;
    display.classList.remove('hidden');
  } else {
    display.innerHTML = '';
    display.classList.add('hidden');
  }
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
  const endSessionBtn = document.querySelector('.end-session-btn');
  
  if (timerState.state === 'running') {
    startBtn.classList.add('hidden');
    pauseBtn.classList.remove('hidden');
    endSessionBtn.classList.remove('hidden');
  } else {
    startBtn.classList.remove('hidden');
    pauseBtn.classList.add('hidden');
    endSessionBtn.classList.add('hidden');
  }
  
  // Update session counter
  document.querySelector('.session-count').textContent = timerState.sessionsCompleted;
}

// Start timer
async function startTimer(focusTopic = '') {
  chrome.runtime.sendMessage({ 
    type: 'START_TIMER',
    focusTopic: focusTopic,
    focusSubject: ''
  });
}

// Pause timer
async function pauseTimer() {
  chrome.runtime.sendMessage({ type: 'PAUSE_TIMER' });
}

// Reset timer
async function resetTimer() {
  chrome.runtime.sendMessage({ type: 'RESET_TIMER' });
}

// End session
async function endSession() {
  chrome.runtime.sendMessage({ type: 'END_SESSION' });
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
  
  // Update timer state with focus subject
  if (!timerState.currentFocusTopic) {
    timerState.currentFocusSubject = subject;
    timerState.currentFocusTopic = taskText;
    await chrome.storage.local.set({ timerState });
    updateFocusTopicDisplay();
  }
  
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

// Initialize soundscape
function initSoundscape() {
  const selector = document.querySelector('.soundscape-selector');
  selector.value = settings.selectedSoundscape || 'none';
}

// Change soundscape
function changeSoundscape(soundscape) {
  if (soundscapeAudio) {
    soundscapeAudio.pause();
    soundscapeAudio = null;
    isPlaying = false;
    updatePlayButton();
  }
  
  settings.selectedSoundscape = soundscape;
  chrome.storage.sync.set({ settings });
}

// Toggle soundscape playback
function toggleSoundscape() {
  const soundscape = document.querySelector('.soundscape-selector').value;
  
  if (soundscape === 'none') {
    alert('Please select a soundscape first');
    return;
  }
  
  if (isPlaying) {
    stopSoundscape();
  } else {
    playSoundscape(soundscape);
  }
}

// Play soundscape
function playSoundscape(soundscape) {
  const soundFiles = {
    'spring': 'assets/spring.mp3',
    'birds-forest': 'assets/birds-forest.mp3',
    'nature-ambience': 'assets/nature-ambience.mp3',
    'ocean-waves': 'assets/ocean-waves.mp3',
    'relaxing-rain': 'assets/relaxing-rain.mp3'
  };
  
  if (!soundFiles[soundscape]) return;
  
  if (soundscapeAudio) {
    soundscapeAudio.pause();
  }
  
  soundscapeAudio = new Audio(chrome.runtime.getURL(soundFiles[soundscape]));
  soundscapeAudio.loop = true;
  soundscapeAudio.volume = document.querySelector('.soundscape-volume').value / 100;
  
  soundscapeAudio.play().then(() => {
    isPlaying = true;
    updatePlayButton();
  }).catch(err => {
    console.error('Error playing soundscape:', err);
    alert('Could not play soundscape. Please try again.');
  });
}

// Stop soundscape
function stopSoundscape() {
  if (soundscapeAudio) {
    soundscapeAudio.pause();
    isPlaying = false;
    updatePlayButton();
  }
}

// Update play button icon
function updatePlayButton() {
  const btn = document.querySelector('.soundscape-play-btn');
  const icon = btn.querySelector('.play-icon');
  icon.textContent = isPlaying ? '⏸' : '▶';
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
  try {
    const audio = new Audio(chrome.runtime.getURL('assets/error.mp3'));
    audio.volume = 0.5;
    audio.play().catch(err => console.log('Could not play warning sound:', err));
  } catch (e) {
    console.log('Error playing warning sound:', e);
  }
}
