# 🔒 FocusLock v2.0 - Installation Guide

## 📋 Quick Installation Steps

### Step 1: Load Extension in Chrome

1. Open Google Chrome
2. Navigate to `chrome://extensions/` in the address bar
3. Enable **"Developer mode"** (toggle in top-right corner)
4. Click **"Load unpacked"** button
5. Select the `/app` folder containing all the extension files
6. The FocusLock extension should now appear in your extensions list

### Step 2: Pin the Extension

1. Click the **Extensions** icon (puzzle piece) in Chrome toolbar
2. Find **FocusLock** in the list
3. Click the **pin icon** to keep it visible in your toolbar

## ✨ New Features in v2.0

### 🎯 Enhanced Focus Mode
- **End Session Button**: Manually end your focus session anytime
- **End Break Button**: Skip break and return to work
- **Auto-navigate to Focus Page**: Automatically opens focus page when session starts
- **Tab Restoration**: All tabs are saved and restored when session ends

### 🔔 Alert System
- **Tab Switch Alert**: Visual alert + sound when switching tabs during focus
- **Sound Warning**: Custom error.mp3 plays on distracting actions
- **Blocked Site Warning**: Immediate feedback for blacklisted sites

### 🎵 Soundscapes
Choose from 5 ambient sounds to enhance focus:
- 🌸 Spring Sounds
- 🐦 Birds & Forest
- 🌿 Nature Ambience
- 🌊 Ocean Waves
- 🌧️ Relaxing Rain

### 👤 Personalization
- **Custom Username**: Set your name for personalized greetings
- **Time-based Greetings**: Good morning/afternoon/evening messages
- **Focus Topic Display**: Shows what you're focusing on with motivational quotes
- **Custom Focus Prompt**: Enter your focus goal when starting sessions

## 🎮 Usage Guide

### Starting a Focus Session

1. Click the FocusLock icon in your toolbar
2. When prompted, enter what you're focusing on (optional)
3. Click **Start** button
4. You'll automatically be redirected to the focus page
5. All your current tabs are saved automatically

### Using Soundscapes

1. On the focus page, find the **Soundscapes** section
2. Select a sound from the dropdown menu
3. Click the **Play** button (▶)
4. Adjust volume using the slider
5. Click **Pause** (⏸) to stop

### Managing Tasks

1. On the focus page, scroll to the task input section
2. Select a subject category (Work, Study, Exercise, etc.)
3. Enter your task description
4. Click the **+** button to add
5. Click **✓** to mark complete or **✕** to delete

### Ending a Session

**Option 1: Manual End**
- Click the **End Session** button during any session
- Confirm the action
- All saved tabs will be restored

**Option 2: Natural Completion**
- Let the timer run to zero
- If breaks are enabled, you'll transition to break mode
- If breaks are disabled, tabs restore automatically

### Customizing Settings

1. Click the **⚙️** (gear) icon in the popup
2. **Personal Settings**:
   - Enter your name for personalized greetings
3. **Timer Settings**:
   - Adjust focus duration (1-120 minutes)
   - Set short break length (1-60 minutes)
   - Set long break length (1-120 minutes)
   - Configure long break frequency
4. **Behavior Settings**:
   - Enable/disable auto-start for breaks
   - Enable/disable auto-start for focus
   - Toggle strict mode (site blocking)
5. **Notifications**:
   - Enable/disable sounds
   - Enable/disable browser notifications
6. **Blacklist/Whitelist**:
   - Add distracting sites to block
   - Add essential sites to whitelist
7. Click **Save Settings**

## 🎨 Features Explained

### Greeting Display
- Shows time-appropriate greeting (morning/afternoon/evening)
- Displays your custom username
- Appears at the top of the focus page

### Focus Topic & Quotes
- Displays your current focus goal
- Shows motivational quotes based on subject
- Changes randomly each session for variety

### Tab Management
- **Auto-save**: All tabs saved when focus session starts
- **Auto-restore**: Tabs restored when session ends
- **Smart handling**: Focus page is excluded from restoration

### Alert System
- **Visual Alerts**: Modal popup appears on tab switches
- **Audio Alerts**: Error sound plays on distracting actions
- **Frequency**: Alerts appear every time (not just once)

## 🔧 Troubleshooting

### Extension Not Loading
- Ensure all files are in the `/app` folder
- Check that Developer Mode is enabled
- Try clicking "Reload" button on the extension card

### Sounds Not Playing
- Check browser volume settings
- Ensure sound is enabled in extension settings
- Try clicking play button again

### Tabs Not Restoring
- Make sure you're using the End Session button or letting timer complete
- Check Chrome permissions for tabs access
- Restart Chrome if issues persist

### Focus Page Not Opening
- Check if pop-up blocker is enabled
- Allow pop-ups for chrome-extension:// URLs
- Manually open via "Open Focus Page" button in popup

## 📊 Best Practices

1. **Set Realistic Goals**: Start with 25-minute focus sessions
2. **Use Soundscapes**: Background sounds can improve concentration
3. **Add Tasks**: Track what you need to accomplish
4. **Take Breaks**: Don't skip breaks - they're essential for productivity
5. **Customize Blacklist**: Add your personal distracting sites
6. **Personalize**: Set your name for a more engaging experience

## 🆘 Support

If you encounter any issues:
1. Check the browser console for errors (F12 → Console)
2. Verify all audio files are in `/app/assets/` folder
3. Ensure manifest.json is properly formatted
4. Try reinstalling the extension

## 📁 File Structure

```
/app/
├── manifest.json          # Extension configuration
├── background.js          # Service worker (timer, tab management)
├── focus.html            # Full-screen focus page
├── focus.js              # Focus page logic
├── focus.css             # Focus page styles
├── popup.html            # Extension popup
├── popup.js              # Popup logic
├── popup.css             # Popup styles
├── options.html          # Settings page
├── options.js            # Settings logic
├── options.css           # Settings styles
├── content.js            # Content script (site blocking, alerts)
├── assets/
│   ├── mountain-bg.jpg   # Background image
│   ├── error.mp3         # Alert sound
│   ├── spring.mp3        # Soundscape
│   ├── birds-forest.mp3  # Soundscape
│   ├── nature-ambience.mp3 # Soundscape
│   ├── ocean-waves.mp3   # Soundscape
│   └── relaxing-rain.mp3 # Soundscape
└── icons/
    ├── icon-16.png       # Extension icons
    ├── icon-48.png
    └── icon-128.png
```

## 🎉 Enjoy FocusLock!

Stay focused, stay productive, and achieve your goals! 🚀
