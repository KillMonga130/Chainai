# Fix 403 Forbidden Error - Agent Access Configuration

## Current Status

✅ **Security disabled** - Your instance now accepts anonymous connections  
❌ **403 Forbidden** - The agents are not configured for anonymous/embedded access

## The Issue

Even with security disabled, you need to explicitly grant anonymous users access to your agents. The 403 error means:
- Authentication is working (unsecured token accepted)
- But the agent `5529ab2d-b69d-40e8-a0af-78655396c3e5` is not configured for anonymous access

## Solution Options

### Option 1: Configure Agent Permissions in watsonx Orchestrate UI (Recommended)

1. **Log into your watsonx Orchestrate instance**:
   - Go to: <https://us-south.watson-orchestrate.cloud.ibm.com>

2. **Navigate to your Supervisor Agent**:
   - Open the Agents section
   - Find "Supervisor Agent" (ID: `5529ab2d-b69d-40e8-a0af-78655396c3e5`)

3. **Enable Embedded Chat Access**:
   - Click on the agent settings/permissions
   - Look for "Embedded Chat" or "Anonymous Access" settings
   - Enable anonymous/embedded access for this agent
   - Save the configuration

4. **Repeat for all agents** you want to use:
   - Supervisor Agent: `5529ab2d-b69d-40e8-a0af-78655396c3e5`
   - Disruption Analyzer: `6b049d85-126a-4545-9292-a8f4ec290b02`
   - Root Cause Investigator: `2a9d1b56-81d7-4eb4-b3bf-aa1c26b33e8d`
   - Mitigation Recommender: `9acc7c17-0f8f-4206-ba71-ae7cad029b0b`
   - Communicator Agent: `b9b35094-185e-4aed-a537-b4dc8435cae8`

### Option 2: Use API to Configure Agent Access

If the UI doesn't have the option, you may need to configure it via API:

```bash
# Get IAM token first
IAM_TOKEN=$(curl -X POST \
  'https://iam.cloud.ibm.com/identity/token' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'grant_type=urn:ibm:params:oauth:grant-type:apikey' \
  -d 'apikey=8JF8iB1bBVvzRtTvU1D8W7oeH8z0JqSMC9tF4KC4Ya6c' \
  | jq -r '.access_token')

# Configure agent for anonymous access (example - adjust endpoint as needed)
curl -X PATCH \
  "https://api.us-south.watson-orchestrate.cloud.ibm.com/instances/6e4a398d-0f34-42ad-9706-1f16af156856/agents/5529ab2d-b69d-40e8-a0af-78655396c3e5" \
  -H "Authorization: Bearer $IAM_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "embedAccess": "enabled",
    "anonymousAccess": true
  }'
```

### Option 3: Verify Agent Environment ID

The 403 might also occur if the agent environment ID is incorrect or not deployed:

**Current configuration**:
- Agent ID: `5529ab2d-b69d-40e8-a0af-78655396c3e5`
- Environment ID: `87dcb805-67f1-4d94-a1b4-469a8f0f4dad`

**Verify in watsonx Orchestrate**:
1. Go to your agent settings
2. Check if environment `87dcb805-67f1-4d94-a1b4-469a8f0f4dad` exists
3. Ensure it's published/deployed
4. If using a different environment, update `src/services/watsonx-config.ts`

### Option 4: Re-run Security Tool with Agent Configuration

The security configuration tool might have additional options for agent access. Try running it again:

```bash
./wxO-embed-chat-security-tool.sh \
  --api-key "8JF8iB1bBVvzRtTvU1D8W7oeH8z0JqSMC9tF4KC4Ya6c" \
  --host-url "https://us-south.watson-orchestrate.cloud.ibm.com" \
  --orchestration-id "c139b03f7afb4bc7b617216e3046ac5b_6e4a398d-0f34-42ad-9706-1f16af156856" \
  --crn "crn:v1:bluemix:public:watsonx-orchestrate:us-south:a/c139b03f7afb4bc7b617216e3046ac5b:6e4a398d-0f34-42ad-9706-1f16af156856::" \
  --agent-id "5529ab2d-b69d-40e8-a0af-78655396c3e5" \
  --agent-environment-id "87dcb805-67f1-4d94-a1b4-469a8f0f4dad" \
  --disable-security
```

Look for options to enable agent access or embed permissions.

## Temporary Workaround: Test with JWT

If you can't configure agent access for anonymous users, use a proper JWT instead:

1. **Generate a JWT for your user account** (via IBM Cloud)
2. **Update `.env.local`**:
   ```env
   # Comment out security disabled:
   # VITE_WXO_SECURITY_DISABLED=true
   
   # Add your JWT:
   VITE_WXO_JWT=your_jwt_token_here
   ```
3. **Re-enable security** on the instance (run the tool without `--disable-security`)
4. **Restart dev server**

With a valid JWT representing an authenticated user who has agent access, the 403 should be resolved.

## Check Agent Permissions in IBM Cloud Console

1. Go to: <https://cloud.ibm.com/resources>
2. Find your watsonx Orchestrate instance: `6e4a398d-0f34-42ad-9706-1f16af156856`
3. Open it and navigate to Access Management / IAM
4. Ensure the agents have the necessary permissions for embedded/anonymous access

## Next Steps

1. **Try Option 1** first (UI configuration) - this is the most straightforward
2. If that doesn't work, check the agent environment is deployed
3. As a last resort, use JWT authentication instead of anonymous mode

---

**After configuring agent access**, restart the dev server and the 403 should become a successful connection!
