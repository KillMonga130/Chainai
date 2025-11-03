# Alternative: Disable Security Using IBM's Configuration Tool

## ⚠️ Important Notice

Chain AI now includes **automatic IBM Cloud IAM authentication** which is the recommended approach. This document is only for users who want to disable security for testing/development purposes.

**We recommend using the built-in authentication** (already implemented). Only follow this guide if you have a specific reason to disable security.

## When to Use This Approach

Disable security ONLY if:
- ✅ You're in a development/testing environment
- ✅ Your watsonx Orchestrate instance doesn't contain sensitive data  
- ✅ You're troubleshooting authentication issues
- ✅ You understand the security implications

**DO NOT disable security in production!**

## Using the IBM Security Configuration Tool

### Step 1: Save the Script

The bash script provided in your setup instructions can disable security. Save it as:

```bash
# Create the file
touch wxO-embed-chat-security-tool.sh

# Make it executable
chmod +x wxO-embed-chat-security-tool.sh
```

Then paste the entire script content into the file.

### Step 2: Run the Script

```bash
./wxO-embed-chat-security-tool.sh
```

### Step 3: Follow the Prompts

1. **Need help finding Service instance URL?**
   - Enter `n` (we already have the URL)

2. **Service instance URL:**
   ```
   https://api.us-south.watson-orchestrate.cloud.ibm.com/instances/6e4a398d-0f34-42ad-9706-1f16af156856
   ```

3. **API Key:**
   ```
   8JF8iB1bBVvzRtTvU1D8W7oeH8z0JqSMC9tF4KC4Ya6c
   ```

4. **Select an action:**
   - Choose `2` - "Disable security and allow anonymous access"

5. **Confirmation:**
   - Enter `yes` to confirm

### Step 4: Verify

After running the script, you should see:
```
✓ Security has been disabled and key pairs cleared.
✓ Your embedded chat now allows anonymous access.
```

### Step 5: Test Chain AI

1. Open Chain AI in your browser
2. The authentication system will automatically detect that security is disabled
3. Chat should work without authentication tokens
4. No code changes needed in Chain AI

## What Happens When Security is Disabled

### Before (Security Enabled - Default)
```
User opens chat → Must authenticate with JWT token → Can access chat
                  ↓ (if not authenticated)
                  401 Error
```

### After (Security Disabled)
```
User opens chat → Immediately access chat (anonymous)
```

## Security Implications

⚠️ **When security is disabled:**

- ❌ No user authentication required
- ❌ Anyone with the embed URL can access the chat
- ❌ No user tracking or personalization
- ❌ Potential for abuse or unauthorized access
- ❌ Not compliant with most security policies

✅ **When security is enabled (recommended):**

- ✅ Users must authenticate with valid JWT tokens
- ✅ Access can be controlled and monitored
- ✅ User sessions are tracked
- ✅ Compliant with enterprise security requirements
- ✅ Supports user-specific customization

## Re-Enabling Security

If you disabled security and want to re-enable it:

### Option 1: Use the Script (Recommended)

1. Run the script again:
   ```bash
   ./wxO-embed-chat-security-tool.sh
   ```

2. Choose option `1` - "Configure security with custom keys"

3. The script will:
   - Generate IBM public/private key pair
   - Generate client public/private key pair
   - Configure security with both keys
   - Save keys to `wxo_security_config/` directory

4. Chain AI's built-in authentication will automatically work

### Option 2: Use Built-in Authentication (Already Implemented)

Simply don't disable security! Chain AI's authentication system will:
- Automatically fetch IBM Cloud IAM tokens
- Provide tokens to the chat interface
- Handle token refresh automatically
- Work seamlessly without any manual configuration

## Troubleshooting the Script

### Script Won't Run

```bash
# If permission denied:
chmod +x wxO-embed-chat-security-tool.sh

# If bash not found (Windows):
# Use Git Bash or WSL (Windows Subsystem for Linux)
```

### "Failed to obtain IAM token"

**Possible causes:**
1. Wrong API key
2. API key expired
3. Wrong environment (DEV/TEST/PROD)

**Solution:**
- Generate a new API key in watsonx Orchestrate
- The script will try all environments automatically

### "422 Error" When Enabling Security

**Cause:** Key format issue

**Solution:**
- Let the script generate new keys
- Don't manually edit the keys
- Run with `-v` flag for debugging: `./wxO-embed-chat-security-tool.sh -v`

### Script Output Directory Not Writable

```bash
# Fix permissions
chmod 755 wxo_security_config/

# Or create directory manually
mkdir -p wxo_security_config
chmod 755 wxo_security_config
```

## Key Files Generated (When Enabling Security)

When you enable security with the script, it creates:

```
wxo_security_config/
├── ibm_public_key.pem          # IBM's public key (PEM format)
├── ibm_public_key.txt          # IBM's public key (text format)
├── client_private_key.pem      # Your private key (KEEP SECRET!)
├── client_public_key.pem       # Your public key (PEM format)
└── client_public_key.txt       # Your public key (text format)
```

**Important:**
- 🔒 Keep `client_private_key.pem` SECRET - never commit to Git
- 📤 The public keys are safe to share
- 💾 Backup these files - you'll need them if you reconfigure

## Comparison: Built-in Auth vs. Disabled Security

| Feature | Built-in IAM Auth (✅ Recommended) | Disabled Security |
|---------|----------------------------------|-------------------|
| **Security** | ✅ High - Token-based auth | ❌ None - Anonymous |
| **Setup** | ✅ Automatic | ⚠️ Manual script |
| **Maintenance** | ✅ Auto token refresh | ⚠️ Manual re-config |
| **Production Ready** | ✅ Yes | ❌ No |
| **User Tracking** | ✅ Yes | ❌ No |
| **Code Changes** | ✅ None needed | ✅ None needed |
| **Compliance** | ✅ Enterprise-ready | ❌ Testing only |

## Recommendation

**Use Chain AI's built-in authentication system** (already implemented). It's:
- More secure
- Automatic
- Production-ready
- No manual configuration needed
- Handles token refresh
- Provides monitoring via System Diagnostics

Only disable security if you have a specific testing need and understand the security implications.

## Getting Help

If you're having authentication issues:

1. **First, check System Diagnostics**:
   - Click Settings (⚙️) icon in Chain AI navigation
   - View Connection Status and Configuration Validator

2. **Review the logs**:
   - Open browser DevTools (F12)
   - Look for `[Chain AI Auth]` messages
   - Check for specific error details

3. **Try the built-in authentication first**:
   - It's already implemented and should work automatically
   - No manual configuration needed
   - Token management is handled for you

4. **Only disable security as a last resort**:
   - Use for testing/troubleshooting only
   - Never in production
   - Re-enable when done testing

## Summary

- ✅ **Chain AI includes automatic authentication** - Use this (it's already working)
- ⚠️ **Disabling security is optional** - Only for specific testing needs  
- 🔒 **Security disabled = Anonymous access** - Not for production
- 🛠️ **Script provided for flexibility** - But built-in auth is better
- 📊 **Use System Diagnostics** - Monitor auth status in real-time

The built-in authentication should resolve your 401 errors without needing to disable security.
