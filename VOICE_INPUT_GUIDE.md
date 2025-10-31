# 🎤 Voice Input Troubleshooting Guide

## ✅ How to Use Voice Input

1. **Click the microphone icon** 🎤 in the district input field
2. **Allow microphone permission** when browser asks (very important!)
3. **Wait for the blue box** that says "🎤 Listening... Speak now"
4. **Speak clearly** - say the district name (e.g., "Mumbai" or "Pune")
5. **Wait 1-2 seconds** - the district will auto-fill

---

## ⚠️ Common Issues & Solutions

### **Issue 1: "No speech heard"**

**Causes:**
- Microphone permission not granted
- Speaking too quietly
- Wrong microphone selected
- Browser doesn't have mic access

**Solutions:**
1. **Check browser permission:**
   - Chrome: Click 🔒 padlock icon in address bar
   - Look for "Microphone" → set to "Allow"
   - Refresh the page

2. **Speak louder and clearer:**
   - Hold microphone/device closer
   - Speak at normal volume
   - Reduce background noise

3. **Check microphone:**
   - Windows: Settings → Privacy → Microphone → Allow apps
   - Make sure correct microphone is selected

---

### **Issue 2: Microphone permission denied**

**Solution:**
1. Click the 🔒 padlock in address bar (left of URL)
2. Find "Microphone" setting
3. Change from "Block" to "Allow"
4. Reload page (F5)

---

### **Issue 3: No microphone found**

**Solution:**
1. **Check if microphone is connected**
   - Laptops: built-in mic should work
   - Desktop: plug in external mic/headset

2. **Test microphone:**
   - Windows: Settings → System → Sound → Input
   - Speak and watch the input level bar
   - If bar doesn't move, mic is not working

3. **Browser test:**
   - Go to: https://www.onlinemictest.com/
   - Allow microphone and test if it works

---

### **Issue 4: Works sometimes but not always**

**Causes:**
- Network interruption (Chrome uses online service)
- Browser bug/tab not focused

**Solutions:**
1. Make sure browser tab is active/focused
2. Try speaking 2-3 seconds after clicking mic
3. Speak one district name clearly, then stop
4. If fails, click mic again and retry

---

## 🌐 Browser Compatibility

| Browser | Support | Notes |
|---------|---------|-------|
| **Chrome** | ✅ Best | Recommended! |
| **Edge** | ✅ Good | Works well |
| **Safari** | ⚠️ Limited | iOS 14.5+ only |
| **Firefox** | ❌ No | Not supported |

**Recommendation:** Use **Google Chrome** for best voice input experience.

---

## 🗣️ Language Settings

- **English Mode:** Say district name in English (e.g., "Mumbai", "Pune")
- **Hindi Mode:** Say district name in Hindi (e.g., "मुंबई", "पुणे")

The app automatically switches language based on your UI language selection.

---

## 📱 Mobile vs Desktop

### **Mobile (Android/iOS):**
- ✅ Usually works better (built-in mic)
- ✅ Touch mic icon, speak when prompted
- ⚠️ iOS: Safari support limited

### **Desktop:**
- ✅ Chrome works best
- ⚠️ Need external mic if no built-in
- ✅ Better for quiet environment

---

## 🎯 Quick Test Steps

1. **Test your microphone:**
   ```
   Go to: chrome://settings/content/microphone
   Check if site has permission
   ```

2. **Test voice input:**
   - Click 🎤 icon
   - See "🎤 Listening... Speak now" message?
     - ✅ YES → Microphone working, speak now!
     - ❌ NO → Permission denied, check settings

3. **Speak clearly:**
   - Example: "Pune" (pause 1 second)
   - See if district fills in

---

## 🔧 Advanced Troubleshooting

### **Check Console (for developers):**
1. Press **F12** to open DevTools
2. Click **Console** tab
3. Click 🎤 and speak
4. Look for messages:
   - "Voice input: [your text]" ✅ Working!
   - "not-allowed" ❌ Permission issue
   - "audio-capture" ❌ Mic not found
   - "no-speech" ⚠️ Not detecting voice

### **Force permission reset:**
1. Chrome: `chrome://settings/content/siteDetails?site=http://localhost:3000`
2. Click "Clear data"
3. Reload page
4. Allow mic permission again

---

## 📞 Still Not Working?

### **Fallback Options:**

1. **Type instead:** Just type the district name manually
2. **Use dropdown:** Click the dropdown arrow to select
3. **Different browser:** Try Chrome if using another browser

### **System Requirements:**

- ✅ Chrome/Edge browser (latest version)
- ✅ Working microphone
- ✅ Internet connection (for speech processing)
- ✅ Microphone permission granted

---

## 💡 Pro Tips

1. **Speak naturally** - don't shout or whisper
2. **Say just the district name** - avoid extra words
3. **Wait for the blue box** before speaking
4. **One try per click** - if no response, click mic again
5. **Check the feedback message** - it tells you what went wrong

---

## ✅ Success Signs

You'll know it's working when:
- ✅ Microphone icon turns **red** and **pulses**
- ✅ Blue box shows **"🎤 Listening... Speak now"**
- ✅ After speaking, see **"✓ [District] selected"** (green)
- ✅ District name fills in the input field

---

**Need more help?** Check browser console (F12) for detailed error messages!
