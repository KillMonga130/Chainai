# Quick Authentication Test Guide

## ✅ Authentication Has Been Implemented!

Chain AI now includes automatic IBM Cloud IAM authentication. This guide helps you verify it's working correctly.

## 🚀 Quick Test (5 Minutes)

### Step 1: Open Chain AI

Open your Chain AI application in a web browser.

### Step 2: Check System Diagnostics

1. Look for the **Settings icon (⚙️)** in the top navigation bar
2. Click it to open the System Diagnostics panel
3. You'll see two tabs:
   - **Connection Status** - Real-time monitoring
   - **Configuration Validator** - Setup verification

### Step 3: Verify Connection Status

In the **Connection Status** tab, check for:

✅ **Connection: Connected** (Green badge)
```
Shows connectivity to watsonx Orchestrate host
```

✅ **Authentication: Authenticated** (Green badge)
```
Shows successful IBM Cloud IAM authentication
```

If you see ❌ red badges:
- Click the "Refresh" button
- Check the error message
- See troubleshooting below

### Step 4: Validate Configuration

Switch to the **Configuration Validator** tab:

1. Click **"Run Validation"** button
2. All checks should show ✅ green checkmarks:
   - Orchestration Id
   - Host Url
   - Api Url
   - Api Key
   - Crn
   - Platform
   - Agents
   - Url Consistency

If you see ❌ red X marks:
- Read the error message for each failed check
- Follow the fix suggestions
- See AUTHENTICATION_SETUP.md for detailed help

### Step 5: Test the Chat

1. Scroll to the **"Try It Now"** section
2. Click on any agent (e.g., "Supervisor Agent")
3. Wait for the chat to load
4. Look for the green **"Authenticated"** badge in the top-right corner
5. Send a test message (e.g., "Hello, analyze supply chain for Haiti earthquake")
6. Agent should respond without 401 errors

## 🔍 What to Look For

### ✅ Success Indicators

1. **In Navigation Diagnostics:**
   - Both Connection and Authentication show "Connected/Authenticated"
   - No error messages
   - Last checked timestamp updates when refreshed

2. **In Chat Interface:**
   - Green "Authenticated" badge appears
   - Chat loads without errors
   - Messages send successfully
   - Agent responds appropriately

3. **In Browser Console (F12):**
   ```
   [Chain AI Auth] Initializing authentication...
   [Chain AI Auth] Authentication token obtained
   [Chain AI] Configuring watsonx Orchestrate...
   [Chain AI] Adding authentication to config
   [Chain AI] watsonx Orchestrate loader script loaded
   [Chain AI] watsonx Orchestrate chat loaded
   [Chain AI] Chat ready
   ```

### ❌ Error Indicators

1. **In Navigation Diagnostics:**
   - Red "Error" or "Disconnected" badges
   - Error messages displayed
   - Authentication shows "Unauthenticated"

2. **In Chat Interface:**
   - Red error icon
   - "Authentication failed" message
   - "Connection Error" message
   - No green "Authenticated" badge

3. **In Browser Console (F12):**
   ```
   [Chain AI Auth] Authentication error: ...
   [Chain AI] Chat error event: { error: { code: 401 } }
   401 Unauthorized
   ```

## 🔧 Quick Troubleshooting

### Issue: "Authentication: Error"

**Quick Fix:**
1. Open System Diagnostics (Settings icon)
2. Click "Refresh" button
3. Check the error message
4. Verify API key in `/services/watsonx-config.ts`

**Common Causes:**
- Expired API key → Generate new key in watsonx Orchestrate
- Wrong API key → Check Settings → API Details
- Network issue → Check internet connection

### Issue: "Connection: Error"

**Quick Fix:**
1. Check internet connection
2. Verify IBM Cloud services are operational
3. Try opening https://cloud.ibm.com in browser
4. Click "Refresh" in System Diagnostics

### Issue: Chat Loads But Shows 401 Errors

**Quick Fix:**
1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard reload page (Ctrl+Shift+R)
3. Check System Diagnostics for auth status
4. Review browser console for specific error

### Issue: Configuration Validation Fails

**Quick Fix:**
1. Open `/services/watsonx-config.ts`
2. Compare values with Settings → API Details in watsonx Orchestrate
3. Ensure instance IDs match
4. Regenerate API key if needed

## 📊 Browser Console Debug Commands

Open DevTools (F12) and paste these to debug:

```javascript
// Check if auth token is cached
console.log('Auth configured:', window.wxOConfiguration?.authentication);

// Check current config
console.log('Full config:', window.wxOConfiguration);

// Force token refresh (run this in a new browser tab pointing to Chain AI)
// Then check System Diagnostics → Connection Status → Refresh
```

## 🎯 Expected Results

### Successful Authentication Flow

```
Page Load
    ↓
[Chain AI Auth] Initializing authentication...
    ↓
Fetch IBM Cloud IAM Token (https://iam.cloud.ibm.com/identity/token)
    ↓
[Chain AI Auth] Authentication token obtained
    ↓
Configure watsonx Orchestrate with token
    ↓
Load chat interface
    ↓
[Chain AI] Chat ready
    ↓
✅ Green "Authenticated" badge shows
    ↓
User can send messages successfully
```

### Timeline Expectations

- **Authentication**: 1-2 seconds
- **Chat Loading**: 2-5 seconds
- **First Message**: Should work immediately
- **Total Time to Ready**: 5-10 seconds

## 📝 Checklist

Before reporting issues, verify:

- [ ] API key is correct and not expired
- [ ] Instance ID matches in all config locations
- [ ] Internet connection is stable
- [ ] Browser is not blocking requests (check console)
- [ ] watsonx Orchestrate service is running (check IBM Cloud status)
- [ ] System Diagnostics shows "Connected" and "Authenticated"
- [ ] Configuration Validator passes all checks
- [ ] No 401 errors in browser console
- [ ] Green "Authenticated" badge appears in chat
- [ ] Test message sends and receives response

## 🆘 Still Having Issues?

1. **Check Full Documentation:**
   - Read `AUTHENTICATION_SETUP.md` for detailed guide
   - Review `SECURITY_CONFIGURATION_ALTERNATIVE.md` for alternative approaches

2. **Review Browser Console:**
   - Press F12
   - Go to Console tab
   - Look for `[Chain AI Auth]` messages
   - Copy any error messages

3. **Export Diagnostics:**
   - Open System Diagnostics
   - Take screenshot of Connection Status
   - Take screenshot of Configuration Validator results
   - Note any error messages

4. **Try Alternative Approach:**
   - Only if built-in auth fails completely
   - See `SECURITY_CONFIGURATION_ALTERNATIVE.md`
   - Disable security temporarily for testing
   - Re-enable after verifying other issues

## ✨ Success Criteria

You're all set when:

✅ System Diagnostics shows all green
✅ Configuration Validator passes all checks  
✅ Green "Authenticated" badge appears in chat
✅ Messages send and receive successfully
✅ No 401 errors in console
✅ All 5 agents work correctly

## 🎉 Next Steps

Once authentication is working:

1. **Explore All Agents:**
   - Supervisor Agent - Orchestrates multi-agent workflow
   - Disruption Analyzer - Scans crisis data
   - Root Cause Investigator - Analyzes transportation/weather
   - Mitigation Recommender - Generates strategies
   - Communicator Agent - Creates stakeholder messages

2. **Test Real Scenarios:**
   - Ask about recent humanitarian crises
   - Request supply chain analysis
   - Get mitigation recommendations
   - Generate communications

3. **Monitor Performance:**
   - Check System Diagnostics regularly
   - Watch for token refresh (automatic)
   - Monitor response times
   - Review console logs for issues

4. **Provide Feedback:**
   - Use the feedback options in chat messages
   - Report any authentication issues
   - Suggest improvements

---

**Remember:** Authentication is now automatic. You shouldn't need to do anything manually. If you see issues, System Diagnostics will help identify the problem!
