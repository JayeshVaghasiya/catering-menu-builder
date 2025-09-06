# 🔧 Mobile Login Troubleshooting Guide

## 📱 **For Android Users Getting "Double check email and password" Error**

### **🔍 Quick Fixes (Try These First):**

1. **Use the Test Account Feature:**
   - Look for the 🔧 icon on your screen (bottom right)
   - Tap it and select "Create Test Account"
   - Try logging in with: `test@example.com` / `123456`
   - If this works, the issue is with your specific account

2. **Check Storage Settings:**
   - Open Chrome settings → Privacy and security
   - Ensure "Cookies and site data" is enabled
   - Clear site data for the app and try again

3. **Try Different Browser:**
   - Chrome (recommended)
   - Firefox
   - Samsung Internet
   - Edge Mobile

### **🛠️ Advanced Troubleshooting:**

#### **Step 1: Enable Debug Mode**
1. Tap the 🔧 icon in bottom right corner
2. Check the debug information:
   - `Storage Available`: Should be ✅
   - `Cookie Enabled`: Should be true
   - `Local Storage Test`: Should be "Working ✅"

#### **Step 2: Storage Issues**
If storage shows ❌:
- **Clear browser data**: Settings → Privacy → Clear browsing data
- **Disable private/incognito mode**
- **Enable cookies**: Settings → Site settings → Cookies (Allow all)

#### **Step 3: Account Issues**
If storage is ✅ but login fails:
1. Use "Create Test Account" in debug panel
2. If test account works, your original account may be corrupted
3. Try creating a new account with a different email

#### **Step 4: Input Issues**
- Turn off **auto-capitalization** in keyboard settings
- Disable **auto-correct** for email field
- Check for extra spaces in email/password
- Try typing credentials in a note app first, then copy-paste

### **📋 Debug Information to Collect:**

When reporting issues, please include:
1. **Device**: Android version, browser name & version
2. **Debug Info**: Copy from 🔧 panel
3. **Error Messages**: Exact text shown
4. **Test Results**: Whether test account worked

### **🚨 Common Android Browser Issues:**

#### **Samsung Internet:**
- May block localStorage in private mode
- Go to Settings → Privacy → Smart anti-tracking → Off

#### **Chrome Mobile:**
- Ensure "Third-party cookies" are not blocked
- Check "Enhanced Safe Browsing" isn't too strict

#### **Firefox Mobile:**
- Enable "Enhanced Tracking Protection" exceptions
- Allow cookies for the site

### **💡 Quick Workarounds:**

1. **Use Chrome Incognito** (paradoxically sometimes works better)
2. **Add to Home Screen** - makes it behave like an app
3. **Use landscape mode** while logging in
4. **Restart browser** completely and try again

### **🔄 Reset Instructions:**

If nothing works:
1. Clear ALL browser data
2. Restart phone
3. Open app in fresh browser session
4. Create new account (don't try to login with old credentials)

### **📞 Still Having Issues?**

Contact support with:
- Debug info from 🔧 panel
- Screenshots of error messages
- Device and browser details
- Steps you've already tried

---

**Remember**: The test account feature (🔧 → Create Test Account) is your best debugging tool!
