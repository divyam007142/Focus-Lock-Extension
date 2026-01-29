// Options page JavaScript

let settings = null;

// Initialize options page
document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();
  populateForm();
  renderLists();
  setupEventListeners();
});

// Load settings from storage
async function loadSettings() {
  const result = await chrome.storage.sync.get('settings');
  settings = result.settings || {
    focusDuration: 25,
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
}

// Populate form with settings
function populateForm() {
  // Number inputs
  document.querySelectorAll('.setting-input[type="number"]').forEach(input => {
    const setting = input.dataset.setting;
    input.value = settings[setting];
  });
  
  // Text inputs
  document.querySelectorAll('.setting-input-text').forEach(input => {
    const setting = input.dataset.setting;
    input.value = settings[setting] || '';
  });
  
  // Checkboxes
  document.querySelectorAll('.setting-checkbox').forEach(checkbox => {
    const setting = checkbox.dataset.setting;
    checkbox.checked = settings[setting];
  });
}

// Render blacklist and whitelist
function renderLists() {
  renderList('blacklist', settings.blacklist);
  renderList('whitelist', settings.whitelist);
}

// Render a list
function renderList(listType, items) {
  const container = document.querySelector(`.list-container[data-list="${listType}"]`);
  container.innerHTML = '';
  
  items.forEach(item => {
    const itemEl = document.createElement('div');
    itemEl.className = 'list-item';
    itemEl.dataset.testid = `${listType}-item`;
    
    itemEl.innerHTML = `
      <span class="list-item-text">${item}</span>
      <button class="remove-btn" data-item="${item}" data-testid="${listType}-remove-btn">✕</button>
    `;
    
    // Remove button
    itemEl.querySelector('.remove-btn').addEventListener('click', () => {
      removeFromList(listType, item);
    });
    
    container.appendChild(itemEl);
  });
}

// Setup event listeners
function setupEventListeners() {
  // Save button
  document.querySelector('[data-testid="save-settings-button"]').addEventListener('click', saveSettings);
  
  // Add buttons
  document.querySelectorAll('.add-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const listType = btn.dataset.list;
      addToList(listType);
    });
  });
  
  // Enter key on inputs
  document.querySelectorAll('.list-input').forEach(input => {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const listType = e.target.closest('.settings-section').querySelector('.add-btn').dataset.list;
        addToList(listType);
      }
    });
  });
  
  // Reset button
  document.querySelector('[data-testid="reset-settings-button"]').addEventListener('click', resetSettings);
}

// Add item to list
function addToList(listType) {
  const input = document.querySelector(`.list-input[data-testid="${listType}-input"]`);
  const value = input.value.trim().toLowerCase();
  
  if (!value) return;
  
  // Remove http://, https://, www.
  const cleanValue = value.replace(/^(https?:\/\/)?(www\.)?/, '');
  
  if (settings[listType].includes(cleanValue)) {
    showToast('Site already in list!', 'error');
    return;
  }
  
  settings[listType].push(cleanValue);
  input.value = '';
  renderLists();
}

// Remove item from list
function removeFromList(listType, item) {
  settings[listType] = settings[listType].filter(i => i !== item);
  renderLists();
}

// Save settings
async function saveSettings() {
  // Get values from number inputs
  document.querySelectorAll('.setting-input[type="number"]').forEach(input => {
    const setting = input.dataset.setting;
    settings[setting] = parseInt(input.value);
  });
  
  // Get values from text inputs
  document.querySelectorAll('.setting-input-text').forEach(input => {
    const setting = input.dataset.setting;
    settings[setting] = input.value.trim();
  });
  
  // Get values from checkboxes
  document.querySelectorAll('.setting-checkbox').forEach(checkbox => {
    const setting = checkbox.dataset.setting;
    settings[setting] = checkbox.checked;
  });
  
  // Save to storage
  await chrome.storage.sync.set({ settings });
  
  showToast('Settings saved successfully!');
  
  // Reset timer if it's idle
  const timerResult = await chrome.storage.local.get('timerState');
  const timerState = timerResult.timerState;
  
  if (timerState && timerState.state === 'idle') {
    chrome.runtime.sendMessage({ type: 'RESET_TIMER' });
  }
}

// Reset settings to default
async function resetSettings() {
  if (!confirm('Are you sure you want to reset all settings to default?')) {
    return;
  }
  
  settings = {
    focusDuration: 25,
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
  
  await chrome.storage.sync.set({ settings });
  populateForm();
  renderLists();
  showToast('Settings reset to default!');
}

// Show toast notification
function showToast(message, type = 'success') {
  const toast = document.querySelector('.toast');
  toast.textContent = message;
  toast.style.background = type === 'error' ? '#ef4444' : '#4ade80';
  toast.classList.remove('hidden');
  
  setTimeout(() => {
    toast.classList.add('hidden');
  }, 3000);
}
