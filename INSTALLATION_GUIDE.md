# 🚀 FocusLock - Installation & Testing Guide

## Quick Installation Steps

### Step 1: Open Chrome Extensions Page
1. Open Google Chrome
2. Navigate to: `chrome://extensions/`
3. Or use menu: ⋮ Menu → Extensions → Manage Extensions

### Step 2: Enable Developer Mode
- Look for the **"Developer mode"** toggle in the top-right corner
- Turn it **ON**

### Step 3: Load the Extension
1. Click the **"Load unpacked"** button (appears after enabling Developer mode)
2. Navigate to and select the `/app` folder
3. Click "Select Folder"

### Step 4: Verify Installation
- You should see **FocusLock** appear in your extensions list
- The extension icon (🔒) should appear in your Chrome toolbar
- Status should show as "Enabled"

## 🧪 Testing the Extension

### Test 1: Basic Timer Functionality
1. Click the FocusLock icon in the toolbar
2. You should see the popup with:
   - Timer display (25:00)
   - Mode selector (Focus/Short/Long)
   - Start/Reset buttons
3. Click "Start" - timer should begin counting down
4. Click "Pause" - timer should stop
5. Click "Reset" - timer should return to 25:00

### Test 2: Focus Page
1. Click the FocusLock icon
2. Click "Open Focus Page" button
3. You should see:
   - Beautiful mountain background with dark overlay
   - Large centered timer (25:00)
   - Mode tabs at the top (Focus/Short Break/Long Break)
   - Control buttons (Start/Pause/Reset)
   - Task input section with subject selector
   - Task cards area at the bottom

### Test 3: Task Management
1. On the focus page, select a subject (e.g., "Work")
2. Enter a task name (e.g., "Complete project report")
3. Click the "+" button
4. Task should appear as a glassmorphism card at the bottom
5. Click "✓" to mark complete (card becomes semi-transparent with strikethrough)
6. Click "✕" to delete the task

### Test 4: Mode Switching
1. Click on "Short Break" tab at the top
2. Timer should change to 5:00
3. Click on "Long Break" tab
4. Timer should change to 15:00
5. Click back to "Focus" tab
6. Timer should return to 25:00

### Test 5: Settings Page
1. Click the FocusLock icon
2. Click the settings gear (⚙️) icon
3. Settings page should open with sections:
   - Timer Settings (durations)
   - Behavior (auto-start options, strict mode)
   - Notifications
   - Blocked Sites (Blacklist)
   - Allowed Sites (Whitelist)
4. Try changing focus duration to 30 minutes
5. Click "Save Settings"
6. Return to popup - timer should now show 30:00

### Test 6: Blacklist/Whitelist
1. Open Settings page
2. In "Blocked Sites" section, you should see default sites:
   - facebook.com
   - youtube.com
   - twitter.com
   - etc.
3. Add a new site (e.g., "github.com")
4. Click "Add" - site should appear in the list
5. Click "✕" to remove it
6. Do the same for Whitelist
7. Click "Save Settings"

### Test 7: Strict Focus Mode (The Main Feature!)
1. Ensure "Strict Mode" is enabled in Settings
2. Start a focus session:
   - Click FocusLock icon → Click "Start"
3. Try to visit a blocked site (e.g., youtube.com)
4. You should be **automatically redirected** to the focus page
5. A warning message should appear: "Focus Mode Active - This site is blocked"
6. Try to open a new tab - it should open with the focus page
7. Timer should continue counting down

### Test 8: Session Completion
1. For testing, change focus duration to 1 minute in Settings
2. Start a focus session
3. Wait for the timer to reach 0:00
4. You should receive:
   - Browser notification: "Focus session complete! Time for a break."
   - Timer automatically switches to "Short Break" mode
   - All site restrictions are removed (you can browse normally)

### Test 9: Break to Focus Transition
1. During a break session, wait for timer to complete
2. You should receive notification: "Break is over! Ready to focus?"
3. Timer switches back to "Focus" mode
4. You can start the next focus session

### Test 10: Statistics
1. Complete a few focus sessions
2. Open the popup
3. Check "Sessions Today" counter - should increase with each completed session
4. Check "Total Focus Time" - should show cumulative time (e.g., "1h 15m")

## 🐛 Common Issues & Solutions

### Issue 1: Extension not loading
**Solution**: 
- Check that all files are in the correct location
- Verify manifest.json is valid (no syntax errors)
- Try removing and re-adding the extension

### Issue 2: Timer not starting
**Solution**:
- Open Chrome DevTools (F12) on the popup
- Check Console for any errors
- Verify storage permissions are granted

### Issue 3: Sites not being blocked
**Solution**:
- Ensure "Strict Mode" is enabled in Settings
- Verify the site is in the blacklist
- Check that the site is NOT in the whitelist
- The timer must be RUNNING in FOCUS mode for blocking to work

### Issue 4: Background image not showing
**Solution**:
- Verify `/app/assets/mountain-bg.jpg` exists
- Check browser console for any 404 errors
- Try reloading the extension

### Issue 5: Notifications not appearing
**Solution**:
- Check Chrome notification permissions
- Ensure "Enable browser notifications" is checked in Settings
- Chrome Settings → Privacy and Security → Site Settings → Notifications

## 📋 Feature Checklist

Use this checklist to verify all features are working:

- [ ] Timer starts and counts down correctly
- [ ] Timer can be paused and resumed
- [ ] Timer can be reset
- [ ] Mode switching works (Focus/Short/Long)
- [ ] Focus page opens with mountain background
- [ ] Glassmorphism UI elements render correctly
- [ ] Tasks can be added with subjects
- [ ] Tasks can be marked complete
- [ ] Tasks can be deleted
- [ ] Tasks persist after closing/reopening
- [ ] Settings can be saved
- [ ] Timer durations can be customized
- [ ] Blacklist can be edited
- [ ] Whitelist can be edited
- [ ] Blocked sites redirect to focus page during focus mode
- [ ] New tabs open to focus page during focus mode
- [ ] Tab switching shows warning during focus mode
- [ ] Session completion triggers notification
- [ ] Session counter increments correctly
- [ ] Restrictions lift after session ends
- [ ] Auto-start options work (if enabled)
- [ ] Sound notifications work (if enabled)
- [ ] Stats display correctly in popup

## 🎨 Visual Verification

### Focus Page Should Display:
- ✅ Mountain background image (full screen)
- ✅ Dark overlay (semi-transparent black)
- ✅ Glassmorphism mode tabs at top
- ✅ Large white timer text (centered)
- ✅ Timer label below timer
- ✅ Start/Pause button (glassmorphism style)
- ✅ Reset button (smaller, circular)
- ✅ Session counter with green number
- ✅ Task input section (frosted glass style)
- ✅ Subject selector dropdown
- ✅ Task input field
- ✅ Add button (green)
- ✅ Task cards (frosted glass) at bottom

### Popup Should Display:
- ✅ Purple gradient background
- ✅ FocusLock title with lock emoji
- ✅ Settings gear icon (top-right)
- ✅ Timer display with mode indicator
- ✅ Progress bar (green)
- ✅ Start/Pause/Reset buttons
- ✅ Mode selector buttons (3 buttons)
- ✅ Statistics section (2 items)
- ✅ "Open Focus Page" button

### Settings Page Should Display:
- ✅ Clean white sections on purple gradient background
- ✅ Timer Settings section with number inputs
- ✅ Behavior section with checkboxes
- ✅ Notifications section with checkboxes
- ✅ Blacklist section with input and list
- ✅ Whitelist section with input and list
- ✅ Default blacklist sites populated
- ✅ Save button (top-right)
- ✅ Reset button (bottom)

## 🎯 Core Functionality Verification

### Must-Have Features Working:
1. ✅ Pomodoro timer with customizable durations
2. ✅ Focus/Short Break/Long Break modes
3. ✅ Full-screen focus page with mountain background
4. ✅ Glassmorphism UI design
5. ✅ Strict focus mode blocks distracting sites
6. ✅ Automatic redirect to focus page
7. ✅ Tab creation/switching prevention
8. ✅ Blacklist and whitelist management
9. ✅ Task management with subjects
10. ✅ Session tracking and statistics
11. ✅ Browser notifications on session end
12. ✅ Auto-unlock when session completes
13. ✅ Settings persistence
14. ✅ Warning displays for blocked actions

## 📝 Testing Checklist for Developer

- [ ] Install extension in Chrome
- [ ] Test basic timer operations
- [ ] Test mode switching
- [ ] Test task creation and management
- [ ] Test settings modification
- [ ] Test blacklist/whitelist editing
- [ ] Test strict mode blocking
- [ ] Test session completion flow
- [ ] Test notification system
- [ ] Test statistics accuracy
- [ ] Test UI responsiveness
- [ ] Test glassmorphism effects
- [ ] Test background image display
- [ ] Verify all data persistence
- [ ] Test auto-start features
- [ ] Test reset functionality

## 🚀 Ready to Use!

Once all tests pass, your FocusLock extension is ready for productive use! 

**Pro Tips:**
- Start with default settings to get familiar
- Add your most distracting sites to blacklist
- Add work/study resources to whitelist
- Use task manager to track what you accomplish
- Check stats to see your productivity progress

---

**Happy focusing! 🔒🎯**
