# 📱 WhatsApp Notification Setup Guide

## Overview
Chain AI sends WhatsApp notifications via Twilio for:
- **Critical Disruptions**: When severity = HIGH
- **Approval Required**: When mitigation cost > $10,000

---

## 🚀 Quick Setup (5 minutes)

### Step 1: Create Twilio Account
1. Go to https://www.twilio.com/try-twilio
2. Sign up for a free account
3. Verify your email and phone number

### Step 2: Get WhatsApp Sandbox Credentials (Testing)
1. Log into Twilio Console: https://console.twilio.com/
2. Navigate to **Messaging → Try it out → Send a WhatsApp message**
3. Follow the instructions to:
   - Send a WhatsApp message to Twilio's sandbox number: **+1 415 523 8886**
   - Message format: `join <your-sandbox-code>` (e.g., `join happy-tiger`)
4. You'll receive a confirmation message

### Step 3: Copy Your Credentials
From the Twilio Console:
- **Account SID**: Found in Dashboard (starts with "AC...")
- **Auth Token**: Click "View" under Auth Token
- **WhatsApp Number**: Use sandbox number `whatsapp:+14155238886`
- **Your Number**: Your WhatsApp number in format `whatsapp:+[country][number]`

### Step 4: Configure Environment Variables
1. Open `.env.example` in the project root
2. Copy it to create `.env`
3. Fill in your credentials:

```env
VITE_TWILIO_ACCOUNT_SID=AC1234567890abcdef1234567890abcdef
VITE_TWILIO_AUTH_TOKEN=your_auth_token_here
VITE_TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
VITE_YOUR_WHATSAPP_NUMBER=whatsapp:+12025551234
```

### Step 5: Restart Dev Server
```bash
npm run dev
```

---

## 🧪 Test Your Setup

### Test 1: Critical Disruption Alert
1. Switch to **Live mode**
2. Send: `DRC - cholera outbreak - blood supplies stuck - urgent - 2000 people affected`
3. You should receive a WhatsApp message within 5 seconds:

```
🚨 CRITICAL SUPPLY CHAIN DISRUPTION

📍 Location: DRC
📦 Cargo: Blood supplies
⚠️ Severity: HIGH
👥 People Affected: 500

Immediate action required. Check Chain AI dashboard.
```

### Test 2: Approval Required Alert
1. Wait for the analysis to complete
2. If cost > $10,000, you'll receive:

```
⚠️ APPROVAL REQUIRED

📍 Location: DRC
📦 Cargo: Blood supplies
👥 Affected: 500 people
💰 Cost: $45,000
⏱️ Timeline: 3-4 weeks

Review mitigation strategies in Chain AI.
```

---

## 🔐 Production Setup (Optional)

### For Production WhatsApp Number
1. Go to Twilio Console → **Messaging → Senders → WhatsApp senders**
2. Click **Request to enable my Twilio numbers for WhatsApp**
3. Complete Facebook Business verification
4. Update `VITE_TWILIO_WHATSAPP_NUMBER` in `.env`

**Cost**: ~$0.005-$0.01 per message (pay-as-you-go)

---

## 🐛 Troubleshooting

### Issue: "Twilio credentials not configured"
- **Solution**: Check `.env` file exists and has all 4 variables set
- **Restart**: Dev server after changing `.env`

### Issue: "Failed to send WhatsApp message"
- **Check 1**: Verify Account SID starts with "AC"
- **Check 2**: Verify Auth Token is correct (no extra spaces)
- **Check 3**: Verify you joined the sandbox (send `join <code>` to +1 415 523 8886)
- **Check 4**: Verify your WhatsApp number format: `whatsapp:+12025551234`

### Issue: No notification received
- **Check 1**: Open browser console, look for "WhatsApp notification sent" toast
- **Check 2**: Check your WhatsApp on your phone (not WhatsApp Web)
- **Check 3**: Verify severity is HIGH or cost > $10,000
- **Check 4**: Check Twilio Console logs for errors

### Issue: "Sandbox has expired"
- **Solution**: Re-join sandbox by sending `join <code>` to Twilio number
- **Note**: Sandbox expires after 72 hours of inactivity

---

## 📊 Notification Triggers

| Trigger | Condition | Function Called |
|---------|-----------|----------------|
| Critical Disruption | Severity = HIGH | `notifyCriticalDisruption()` |
| Approval Required | Cost > $10,000 | `notifyApprovalRequired()` |

Both notifications are sent automatically during the analysis workflow.

---

## 🔒 Security Notes

1. **Never commit `.env`** - Already in `.gitignore`
2. **Rotate credentials** if exposed
3. **Use environment-specific** credentials for dev/prod
4. **Monitor Twilio usage** to avoid unexpected charges

---

## 💡 Advanced Configuration

### Custom Message Templates
Edit `src/services/whatsapp-notification.ts`:
```typescript
function formatWhatsAppMessage(/* ... */) {
  return `
🚨 YOUR CUSTOM MESSAGE
Location: ${location}
// ... customize here
  `.trim();
}
```

### Disable Notifications
Comment out notification calls in `ChainAISupervisor.tsx`:
```typescript
// notifyApprovalRequired(...)
// notifyCriticalDisruption(...)
```

### Alternative: Web-Based Notifications
Use `openWhatsAppWithMessage()` instead of Twilio (no API required):
- Opens WhatsApp Web with pre-filled message
- User must click "Send" manually
- No Twilio account needed

---

## ✅ Setup Checklist

- [ ] Created Twilio account
- [ ] Joined WhatsApp sandbox
- [ ] Copied Account SID
- [ ] Copied Auth Token
- [ ] Created `.env` file from `.env.example`
- [ ] Added all 4 Twilio variables
- [ ] Restarted dev server
- [ ] Tested with critical disruption query
- [ ] Received WhatsApp notification on phone

---

## 🆘 Need Help?

- **Twilio Docs**: https://www.twilio.com/docs/whatsapp
- **Sandbox Setup**: https://www.twilio.com/docs/whatsapp/sandbox
- **Console**: https://console.twilio.com/
- **Pricing**: https://www.twilio.com/whatsapp/pricing

---

**Note**: Twilio sandbox is free for testing. Production WhatsApp requires Facebook Business verification and has per-message costs (~$0.005-$0.01).
