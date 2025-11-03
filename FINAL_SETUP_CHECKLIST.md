# ✅ Chain AI Multi-Agent + WhatsApp Setup Checklist

## 🎯 Overview
This checklist covers the final setup steps to enable:
1. **True Multi-Agent Orchestration** - Real IBM watsonx agent delegation (not simulation)
2. **WhatsApp Notifications** - Real-time alerts for critical disruptions and approvals

---

## 📋 Part 1: Configure IBM watsonx Agents (30 minutes)

All agent instructions are in: **IBM_CHILD_AGENTS_INSTRUCTIONS.md**

### Agent 1: Disruption Analyzer
- [ ] Log into IBM watsonx Orchestrate
- [ ] Navigate to your DisruptionAnalyzer agent settings
- [ ] Copy instructions from IBM_CHILD_AGENTS_INSTRUCTIONS.md → Section "Agent 1: Disruption Analyzer"
- [ ] Paste into agent's "Instructions" field
- [ ] **Remove these invalid tools** from toolset:
  - [ ] Remove any tool named "disruption_analyzer" or similar self-referencing tools
  - [ ] Remove any tools that return JSON responses
- [ ] Click "Save"
- [ ] Click "Deploy to Live"

### Agent 2: Root Cause Investigator
- [ ] Navigate to RootCauseInvestigator agent settings
- [ ] Copy instructions from IBM_CHILD_AGENTS_INSTRUCTIONS.md → Section "Agent 2: Root Cause Investigator"
- [ ] Paste into agent's "Instructions" field
- [ ] **Remove these invalid tools** from toolset:
  - [ ] Remove any tool named "root_cause_investigator" or similar
  - [ ] Remove any tools that return JSON responses
- [ ] Click "Save"
- [ ] Click "Deploy to Live"

### Agent 3: Mitigation Recommender
- [ ] Navigate to MitigationRecommender agent settings
- [ ] Copy instructions from IBM_CHILD_AGENTS_INSTRUCTIONS.md → Section "Agent 3: Mitigation Recommender"
- [ ] Paste into agent's "Instructions" field
- [ ] **Remove these invalid tools** from toolset:
  - [ ] Remove any tool named "mitigation_recommender" or similar
  - [ ] Remove any tools that return JSON responses
- [ ] Click "Save"
- [ ] Click "Deploy to Live"

### Agent 4: Communicator
- [ ] Navigate to Communicator agent settings
- [ ] Copy instructions from IBM_CHILD_AGENTS_INSTRUCTIONS.md → Section "Agent 4: Communicator"
- [ ] Paste into agent's "Instructions" field
- [ ] **Remove these invalid tools** from toolset:
  - [ ] Remove any tool named "communicator" or similar
  - [ ] Remove any tools that return JSON responses
- [ ] Click "Save"
- [ ] Click "Deploy to Live"

### Agent 5: Supervisor (Updated)
- [ ] Navigate to Supervisor agent settings
- [ ] Copy instructions from IBM_CHILD_AGENTS_INSTRUCTIONS.md → Section "Updated Supervisor Agent for Delegation"
- [ ] Paste into agent's "Instructions" field
- [ ] **Verify toolset contains**:
  - [ ] DisruptionAnalyzer (agent delegation)
  - [ ] RootCauseInvestigator (agent delegation)
  - [ ] MitigationRecommender (agent delegation)
  - [ ] Communicator (agent delegation)
- [ ] **Remove invalid tools** (same as above)
- [ ] Click "Save"
- [ ] Click "Deploy to Live"

### Verification
- [ ] All 5 agents show "Live" status
- [ ] All agents have updated instructions
- [ ] All agents have invalid tools removed
- [ ] Supervisor has all 4 child agents in toolset

---

## 📋 Part 2: Set Up WhatsApp Notifications (10 minutes)

Full guide in: **WHATSAPP_SETUP_GUIDE.md**

### Step 1: Create Twilio Account
- [ ] Go to https://www.twilio.com/try-twilio
- [ ] Sign up (free account)
- [ ] Verify email and phone

### Step 2: Join WhatsApp Sandbox
- [ ] Log into https://console.twilio.com/
- [ ] Navigate to: **Messaging → Try it out → Send a WhatsApp message**
- [ ] Open WhatsApp on your phone
- [ ] Send message to **+1 415 523 8886**
- [ ] Message format: `join <your-sandbox-code>` (shown in console)
- [ ] Receive confirmation message

### Step 3: Get Credentials
- [ ] Copy **Account SID** from Twilio Dashboard (starts with "AC")
- [ ] Click "View" under **Auth Token** and copy it
- [ ] Note sandbox number: `whatsapp:+14155238886`
- [ ] Note your WhatsApp number in format: `whatsapp:+[country][number]`

### Step 4: Configure Environment Variables
- [ ] Open `.env.example` in project root
- [ ] Copy to create `.env` (if it doesn't exist)
- [ ] Fill in these 4 variables:
  ```env
  VITE_TWILIO_ACCOUNT_SID=AC1234567890abcdef1234567890abcdef
  VITE_TWILIO_AUTH_TOKEN=your_auth_token_here
  VITE_TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
  VITE_YOUR_WHATSAPP_NUMBER=whatsapp:+12025551234
  ```
- [ ] Save `.env` file

### Step 5: Restart Dev Server
- [ ] Stop dev server (Ctrl+C in terminal)
- [ ] Run: `npm run dev`
- [ ] Verify server starts on port 3002

---

## 📋 Part 3: Test Everything (5 minutes)

### Test 1: Multi-Agent Orchestration
- [ ] Open browser to http://localhost:3002
- [ ] Switch to **Live mode** (toggle at top)
- [ ] Send test query: `DRC - cholera outbreak - blood supplies stuck - urgent - 2000 people affected`
- [ ] **Verify**:
  - [ ] See "Activating supervisor..." message
  - [ ] See sequential agent activations (NOT simulation)
  - [ ] Console shows: `[Chain AI] ✓ Injected real-time context`
  - [ ] Agents reference ReliefWeb reports and weather data
  - [ ] Final response includes mitigation strategies with costs

### Test 2: WhatsApp Notifications
During the same test query:
- [ ] **Verify Critical Disruption Alert**:
  - [ ] WhatsApp message received on your phone
  - [ ] Message shows: Location, Cargo, Severity, People affected
  - [ ] Browser toast shows: "WhatsApp notification sent"
  
- [ ] **Verify Approval Alert** (if cost > $10K):
  - [ ] Second WhatsApp message received
  - [ ] Message shows: Cost, Timeline, Location, Cargo
  - [ ] Approval UI appears in browser

### Test 3: Demo Mode Comparison
- [ ] Switch to **Demo mode** (toggle at top)
- [ ] Send same query
- [ ] **Verify**:
  - [ ] Left panel stays visible (doesn't disappear)
  - [ ] Workflow simulation runs (5 phases)
  - [ ] Uses real ReliefWeb data
  - [ ] Shows approval workflow
- [ ] **Compare**: Live mode should have similar workflow but with real agents

---

## 🐛 Troubleshooting

### Issue: Agents still asking basic questions
- **Cause**: Agent instructions not updated in IBM watsonx
- **Fix**: Re-check Part 1, ensure all agents deployed to Live

### Issue: Agents throwing "Invalid tool call" errors
- **Cause**: Invalid tools not removed from agent toolsets
- **Fix**: Remove all self-referencing tools (e.g., agent calling itself)

### Issue: No WhatsApp notifications received
- **Cause**: Twilio credentials not configured or sandbox not joined
- **Fix**:
  - Verify `.env` has all 4 Twilio variables
  - Re-send `join <code>` to +1 415 523 8886
  - Check browser console for errors
  - Restart dev server

### Issue: Context injection not working
- **Cause**: Widget instance not loaded
- **Fix**: Wait 10 seconds after page load, check console for logs

### Issue: Multi-agent not delegating
- **Cause**: Supervisor toolset doesn't have child agents
- **Fix**: Add DisruptionAnalyzer, RootCauseInvestigator, MitigationRecommender, Communicator to Supervisor toolset

---

## ✅ Final Verification

All features working:
- [ ] ✅ Live mode uses real IBM agents (not simulation)
- [ ] ✅ Agents execute sequentially (Supervisor → Analyzer → Investigator → Recommender → Communicator)
- [ ] ✅ Agents reference ReliefWeb reports in responses
- [ ] ✅ Agents reference weather data in responses
- [ ] ✅ Console shows context injection logs
- [ ] ✅ WhatsApp alert received for critical disruptions (severity = HIGH)
- [ ] ✅ WhatsApp alert received for approvals (cost > $10K)
- [ ] ✅ Approval workflow UI appears correctly
- [ ] ✅ Demo mode still works (simulation with real data)
- [ ] ✅ No console errors

---

## 📚 Reference Documents

| Document | Purpose |
|----------|---------|
| **IBM_CHILD_AGENTS_INSTRUCTIONS.md** | Complete configuration for all 5 agents |
| **WHATSAPP_SETUP_GUIDE.md** | Detailed Twilio + WhatsApp setup |
| **REAL_TIME_DATA_SUMMARY.md** | How context injection works |
| **AGENT_CONFIGURATION_FIX.md** | General agent configuration fixes |
| **.env.example** | Environment variable template |

---

## 🎉 Success Criteria

You'll know everything works when:
1. You send a crisis query in Live mode
2. You see 4 agents activate sequentially
3. Each agent references real-time ReliefWeb and weather data
4. You receive 2 WhatsApp messages on your phone:
   - Critical disruption alert (severity HIGH)
   - Approval required alert (cost > $10K)
5. Browser shows approval workflow with mitigation strategies
6. All responses are AI-generated (not hardcoded simulation)

---

## ⏱️ Estimated Time
- Part 1: IBM Agent Configuration → **30 minutes**
- Part 2: WhatsApp Setup → **10 minutes**
- Part 3: Testing → **5 minutes**
- **Total**: ~45 minutes

---

## 🆘 Need Help?

- **IBM watsonx Orchestrate**: https://www.ibm.com/docs/en/watsonx/watson-orchestrate
- **Twilio WhatsApp**: https://www.twilio.com/docs/whatsapp
- **ReliefWeb API**: https://reliefweb.int/help/api
- **Console Logs**: Check browser DevTools → Console tab

---

**Good luck! 🚀**
