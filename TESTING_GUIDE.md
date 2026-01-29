# 🧪 Testing Guide - Focus Lock Extension

## Quick Test Steps

### 1. Load Extension in Chrome
```
1. Open Chrome
2. Go to chrome://extensions/
3. Enable "Developer mode" (top right)
4. Click "Load unpacked"
5. Select the /app folder
6. Extension should load successfully
```

### 2. Test Focus Page Layout
```
1. Click extension icon
2. Click "Open Focus Page" or start a session
3. Verify clean vertical layout:
   ✓ Greeting at top
   ✓ Mode tabs below greeting
   ✓ Timer centered
   ✓ Control buttons
   ✓ Session counter
   ✓ Soundscape section (clean and organized)
   ✓ Task input
   ✓ Task cards at bottom
   ✓ No overlapping elements
```

### 3. Test Mobile Responsiveness
```
1. Open Focus page
2. Right-click → Inspect
3. Toggle device toolbar (Ctrl+Shift+M)
4. Test different sizes:
   - iPhone SE (375px) - Should stack cleanly
   - iPad (768px) - Should look balanced
   - Desktop (1920px) - Should look spacious
5. Verify all elements are readable and accessible
```

### 4. Test Session Completion Notification
```
Option A - Quick Test (1 minute):
1. Go to extension options
2. Set focus duration to 1 minute
3. Start a focus session
4. Wait 1 minute
5. Verify:
   ✓ Completion sound plays
   ✓ Green notification appears
   ✓ Message: "Great job! 🎉"
   ✓ Notification auto-dismisses after 4 seconds

Option B - Full Test (25 minutes):
1. Use default 25-minute setting
2. Start session
3. Wait for completion
4. Verify same as above
```

### 5. Test Tab Switch Alert Duration
```
1. Start a focus session
2. Open a new tab (Ctrl+T)
3. Try to navigate to a non-blocked site
4. Verify:
   ✓ Warning overlay appears
   ✓ Alert dismisses after 2 seconds (not 3)
   ✓ Smooth fade-out animation
```

### 6. Test Tab Restoration
```
1. Open several tabs (e.g., 3-4 different websites)
2. Start a focus session
3. Note: All tabs except focus page should remain
4. Complete or end the session
5. Verify:
   ✓ Original tabs are restored
   ✓ Focus page closes
   ✓ Only tabs from step 1 restored (not newly closed ones)
```

### 7. Test Soundscape Section
```
1. Open focus page
2. Locate "Focus Soundscapes" section
3. Verify:
   ✓ Clean layout with header
   ✓ Dropdown selector visible
   ✓ Green play button prominent
   ✓ Volume slider functional
   ✓ Volume icon visible
4. Select a soundscape (e.g., "Ocean Waves")
5. Click play button
6. Verify:
   ✓ Sound plays
   ✓ Button icon changes to pause (⏸)
   ✓ Volume control works
7. Click pause
8. Verify sound stops
```

### 8. Test Break Completion
```
1. Complete a focus session (or set to 1 min)
2. When break starts, wait for completion
3. Verify:
   ✓ Completion sound plays
   ✓ Different notification appears
   ✓ Message: "Break Complete! ☕" (for short break)
   ✓ Or "Long Break Complete! 🌴" (for long break)
```

## 🎯 Expected Results Checklist

### Visual Design ✓
- [ ] Clean vertical layout (no overlapping)
- [ ] Professional glassmorphism effects
- [ ] Smooth animations on all interactions
- [ ] Responsive on all screen sizes
- [ ] Readable fonts and proper contrast

### Functionality ✓
- [ ] Timer counts down correctly
- [ ] Mode switching works
- [ ] Start/Pause/Reset buttons functional
- [ ] Tasks can be added/completed/deleted
- [ ] Soundscapes play correctly

### Notifications ✓
- [ ] Completion notification appears
- [ ] Custom sound plays on completion
- [ ] Different messages for different modes
- [ ] Auto-dismisses after 4 seconds
- [ ] Smooth animations

### Alerts ✓
- [ ] Tab switch warning appears
- [ ] Dismisses after 2 seconds (not 3)
- [ ] Sound plays with warning
- [ ] Smooth fade-out animation

### Tab Management ✓
- [ ] Tabs saved on session start
- [ ] Only saved tabs restored on session end
- [ ] Focus page closes properly
- [ ] No duplicate tabs created

## 🐛 Common Issues & Solutions

### Issue: Extension doesn't load
**Solution**: Make sure you're loading the /app folder directly

### Issue: Sounds don't play
**Solution**: Check Chrome sound permissions, ensure volume is up

### Issue: Notification doesn't appear
**Solution**: Check browser console for errors, verify manifest.json is correct

### Issue: Layout looks broken
**Solution**: Hard refresh the page (Ctrl+Shift+R)

### Issue: Mobile view not working
**Solution**: Ensure viewport meta tag is present in focus.html

## 📱 Mobile Testing Tips

1. Use Chrome DevTools device emulation
2. Test on actual mobile device if available
3. Check touch interactions
4. Verify text is readable without zooming
5. Ensure buttons are easily tappable

## 🎉 Success Criteria

✅ All visual elements properly aligned
✅ Clean, professional appearance
✅ Mobile-responsive on all screen sizes
✅ Completion notifications working with sound
✅ Alert duration is 2 seconds
✅ Tab restoration works correctly
✅ Soundscape section looks clean and professional
✅ No console errors
✅ Smooth user experience

---

**Note**: For best results, test on Chrome version 88 or higher with a clean profile.
