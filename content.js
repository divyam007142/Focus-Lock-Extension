// Content script for FocusLock - handles site blocking and tab switching warnings

(async function() {
  // Check if we should block this page
  const settings = await getSettings();
  const timerState = await getTimerState();
  
  // Only run blocking logic during focus mode
  if (settings.strictMode && timerState.mode === 'focus' && timerState.state === 'running') {
    const currentUrl = window.location.href;
    
    // Check if current site is blocked
    if (isUrlBlocked(currentUrl, settings)) {
      // Redirect to focus page
      window.location.href = chrome.runtime.getURL('focus.html?blocked=true');
    }
    
    // Show warning overlay for tab switching attempts
    showFocusModeWarning();
  }
  
  // Listen for visibility changes (tab switching)
  document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState === 'visible') {
      const settings = await getSettings();
      const timerState = await getTimerState();
      
      if (settings.strictMode && timerState.mode === 'focus' && timerState.state === 'running') {
        // Check if this site should be blocked
        const currentUrl = window.location.href;
        if (isUrlBlocked(currentUrl, settings) && !currentUrl.includes('focus.html')) {
          window.location.href = chrome.runtime.getURL('focus.html?blocked=true');
        }
      }
    }
  });
})();

// Show focus mode warning overlay
function showFocusModeWarning() {
  // Don't show on focus page itself
  if (window.location.href.includes('focus.html')) return;
  
  const overlay = document.createElement('div');
  overlay.id = 'focuslock-warning-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: rgba(239, 68, 68, 0.95);
    backdrop-filter: blur(10px);
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    z-index: 999999;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    font-weight: 600;
    animation: slideInRight 0.3s ease;
    max-width: 300px;
  `;
  
  overlay.innerHTML = `
    <div style="display: flex; align-items: center; gap: 10px;">
      <span style="font-size: 24px;">⚠️</span>
      <div>
        <div style="font-size: 16px; margin-bottom: 4px;">Focus Mode Active</div>
        <div style="font-size: 12px; opacity: 0.9;">Stay focused on your task!</div>
      </div>
    </div>
  `;
  
  // Add animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideInRight {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);
  document.body.appendChild(overlay);
  
  // Remove after 3 seconds
  setTimeout(() => {
    overlay.style.animation = 'slideInRight 0.3s ease reverse';
    setTimeout(() => overlay.remove(), 300);
  }, 3000);
}

// Utility functions
async function getSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get('settings', (result) => {
      resolve(result.settings || {
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
      });
    });
  });
}

async function getTimerState() {
  return new Promise((resolve) => {
    chrome.storage.local.get('timerState', (result) => {
      resolve(result.timerState || {
        mode: 'focus',
        state: 'idle',
        timeRemaining: 25 * 60,
        sessionsCompleted: 0,
        lastUpdate: Date.now()
      });
    });
  });
}

function isUrlBlocked(url, settings) {
  if (!url) return false;
  
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.replace('www.', '');
    
    // Chrome extension pages are never blocked
    if (url.startsWith('chrome://') || url.startsWith('chrome-extension://')) {
      return false;
    }
    
    // Check whitelist first
    if (settings.whitelist && settings.whitelist.some(site => hostname.includes(site))) {
      return false;
    }
    
    // Check blacklist
    if (settings.blacklist && settings.blacklist.some(site => hostname.includes(site))) {
      return true;
    }
    
    return false;
  } catch (e) {
    return false;
  }
}
