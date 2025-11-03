# Troubleshooting: "Connecting to Supervisor Agent..." Issue

## Current Status
The chat widget loads but gets stuck on "Connecting..." without reaching the `chat:ready` event.

## Root Cause
This happens when:
1. **Agent-level permissions** not configured for embedded/anonymous access in IBM watsonx Orchestrate
2. **Authentication token** is invalid or not accepted by the agent
3. **Agent environment not published** or not accessible

## Quick Fixes to Try

### Option 1: Enable IAM Authentication (Recommended)
I've already updated your `.env.local` to use IAM:

```bash
VITE_WXO_USE_IAM=true
VITE_WATSONX_API_KEY=8JF8iB1bBVvzRtTvU1D8W7oeH8z0JqSMC9tF4KC4Ya6c
```

**Steps:**
1. Restart dev server (already running on port 3001)
2. Open http://localhost:3001
3. Switch to "Live Chat" mode
4. Open browser console (F12)
5. Look for these logs:
   - `[Chain AI Auth] IAM token generated and cached` ✅
   - `[Chain AI] ✅ Chat ready` ✅
   - OR errors showing what's blocking connection ❌

### Option 2: Get a Valid JWT Token

If IAM doesn't work (CORS issues), get a JWT from IBM:

1. **Go to IBM watsonx Orchestrate UI**
2. **Open browser DevTools (F12) → Network tab**
3. **Refresh the page**
4. **Find a request with "Authorization: Bearer ..." header**
5. **Copy the JWT token** (long string after "Bearer ")
6. **Update `.env.local`:**
   ```bash
   # Comment out IAM
   # VITE_WXO_USE_IAM=true
   
   # Add JWT
   VITE_WXO_JWT=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
7. **Restart dev server**

### Option 3: Configure Agent for Anonymous Access

This requires access to IBM watsonx Orchestrate admin:

1. **Log into watsonx Orchestrate**
2. **Navigate to your Supervisor Agent**
3. **Settings → Security**
4. **Enable "Allow anonymous embedded access"** or **"Allow public API access"**
5. **Publish the agent environment**
6. **Go back to your app and refresh**

## Diagnostic Steps

### 1. Check Browser Console
Open http://localhost:3001, switch to Live mode, and check console for:

**Good signs:**
```
[Chain AI Auth] IAM token obtained successfully
[Chain AI] watsonx Orchestrate loader script loaded
[Chain AI] watsonx Orchestrate chat loaded
[Chain AI] ✅ Chat ready
```

**Bad signs (what to look for):**
```
[Chain AI Auth] CORS error getting IAM token
[Chain AI] Chat error event: {...}
[Chain AI] Chat failed to become ready within 30 seconds
```

### 2. Check Network Tab
1. Open DevTools → Network tab
2. Try to connect to chat
3. Look for failed requests to:
   - `iam.cloud.ibm.com` (auth)
   - `watson-orchestrate.cloud.ibm.com` (chat)
4. Click on failed requests to see error details

### 3. Test Authentication Separately

Open browser console on http://localhost:3001 and run:

```javascript
// Test if IAM token generation works
fetch('/_iam/identity/token', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  body: new URLSearchParams({
    grant_type: 'urn:ibm:params:oauth:grant-type:apikey',
    apikey: 'YOUR_API_KEY_HERE'
  })
}).then(r => r.json()).then(console.log).catch(console.error)
```

If you get a token response with `access_token`, IAM is working.

## Common Issues & Solutions

### Issue: CORS Error
```
Access to fetch at 'https://iam.cloud.ibm.com/...' has been blocked by CORS
```

**Solution:**
- Dev server already has proxy configured (/_iam)
- If still failing, use JWT token instead (Option 2 above)

### Issue: 401 Unauthorized
```
Chat initialization failed: Unauthorized
```

**Solution:**
- Token is invalid or expired
- Get a fresh JWT from watsonx Orchestrate UI
- Verify API key is correct

### Issue: 403 Forbidden
```
Chat initialization failed: Forbidden
```

**Solution:**
- Agent not configured for your access level
- Need to enable agent-level permissions in watsonx Orchestrate
- Contact IBM admin to grant access

### Issue: Timeout (30 seconds)
```
Chat failed to become ready within 30 seconds
```

**Solution:**
- Agent environment not published
- Agent not responding to embed requests
- Check if agent works in watsonx Orchestrate UI first

## What to Send Me

If none of the above works, send me:

1. **Browser console output** (all lines starting with `[Chain AI]`)
2. **Network tab errors** (screenshot of failed requests)
3. **Agent configuration** (is it published? security settings?)
4. **Authentication method you're trying** (IAM, JWT, or disabled)

## Quick Test Commands

```powershell
# Rebuild and restart
npm run build
npm run dev

# Check if .env.local is being read
# (should see IAM authentication attempt in console)
```

## Expected Timeline

- **IAM auth**: Should connect in 2-3 seconds if working
- **JWT auth**: Instant connection if token is valid
- **Anonymous**: May never work if agent-level permissions not set

## Success Indicators

You'll know it's working when:
1. Loading spinner disappears in ~2 seconds
2. Console shows `✅ Chat ready`
3. Chat input becomes active (can type)
4. First message gets a response from agent

## Next Steps

1. **Start dev server** (already running on port 3001)
2. **Open browser console** (F12)
3. **Try Live mode**
4. **Copy all `[Chain AI]` logs and send them to me**

I'll analyze the exact error and provide a targeted fix.
