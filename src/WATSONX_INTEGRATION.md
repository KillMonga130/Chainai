# IBM watsonx Orchestrate Integration

## Overview
Chain AI now features **real-time integration** with IBM watsonx Orchestrate, allowing users to interact with live AI agents through the embedded webchat SDK.

## Configuration Details

### Service Instance
- **URL**: `https://api.us-south.watson-orchestrate.cloud.ibm.com/instances/6e4a398d-0f34-42ad-9706-1f16af156856`
- **Region**: US South (Dallas)
- **Deployment Platform**: IBM Cloud
- **Orchestration ID**: `c139b03f7afb4bc7b617216e3046ac5b_6e4a398d-0f34-42ad-9706-1f16af156856`
- **CRN**: `crn:v1:bluemix:public:watsonx-orchestrate:us-south:a/c139b03f7afb4bc7b617216e3046ac5b:6e4a398d-0f34-42ad-9706-1f16af156856::`

### AI Agents

#### 1. Supervisor Agent
- **Agent ID**: `5529ab2d-b69d-40e8-a0af-78655396c3e5`
- **Environment ID**: `87dcb805-67f1-4d94-a1b4-469a8f0f4dad`
- **Purpose**: Orchestrates multi-agent workflow using ReAct reasoning framework
- **Color Theme**: Indigo

#### 2. Disruption Analyzer
- **Agent ID**: `6b049d85-126a-4545-9292-a8f4ec290b02`
- **Environment ID**: `2da4dc33-42b2-414d-8e57-085b6d9dda02`
- **Purpose**: Scans ReliefWeb crisis data and identifies supply chain vulnerabilities
- **Color Theme**: Purple

#### 3. Root Cause Investigator
- **Agent ID**: `2a9d1b56-81d7-4eb4-b3bf-aa1c26b33e8d`
- **Environment ID**: `88eea2ad-ef89-41b2-ab4f-231ad6ede49a`
- **Purpose**: Analyzes transportation, weather, and inventory data to identify root causes
- **Color Theme**: Blue

#### 4. Mitigation Recommender
- **Agent ID**: `9acc7c17-0f8f-4206-ba71-ae7cad029b0b`
- **Environment ID**: `908dc7a8-831d-4110-846b-2afeafca61c0`
- **Purpose**: Generates actionable mitigation strategies with cost and risk assessments
- **Color Theme**: Teal

#### 5. Communicator Agent
- **Agent ID**: `b9b35094-185e-4aed-a537-b4dc8435cae8`
- **Environment ID**: `208dc747-4863-4d1e-810d-44b66a605c52`
- **Purpose**: Generates targeted communications for stakeholders and leadership
- **Color Theme**: Green

## Implementation

### Files Created

1. **`/services/watsonx-config.ts`**
   - Centralized configuration for all watsonx agents
   - Type-safe agent definitions
   - Helper functions for getting agent configurations

2. **`/components/WatsonXChat.tsx`**
   - React component wrapper for IBM watsonx Orchestrate embedded webchat
   - Handles script loading and initialization
   - Custom event handlers for styling and feedback
   - Error and loading states with premium UI

3. **`/components/ChainAISupervisor.tsx` (Updated)**
   - Added dual-mode support: Live Chat and Demo Mode
   - Live Chat: Real-time connection to watsonx agents
   - Demo Mode: Simulated multi-agent orchestration workflow
   - Agent selector in Live Mode
   - Seamless mode switching

### Features

#### Live Chat Mode
- **Real-time AI Responses**: Direct connection to IBM watsonx Orchestrate agents
- **Agent Selection**: Switch between 5 specialized AI agents
- **Custom Styling**: Premium glassmorphic design matching Chain AI theme
- **Event Handlers**: 
  - `chat:ready` - Fires when chat is initialized
  - `pre:receive` - Custom message processing and feedback injection
  - `receive` - Message logging
  - `send` - Outgoing message tracking
  - `feedback` - User feedback capture (thumbs up/down)

#### Demo Mode
- **Simulated Workflow**: Multi-agent orchestration demonstration
- **Visual Progress**: Real-time status updates for each agent
- **ReliefWeb Integration**: Fetches actual humanitarian crisis data
- **Step-by-Step Execution**: Shows how agents collaborate

### Security Configuration

The current implementation uses **API Key authentication** since this is an IBM Cloud instance. For production deployments with security requirements:

1. Run the `wxO-embed-chat-security-tool.sh` script (provided in documentation)
2. Generate IBM and client key pairs
3. Configure JWT-based authentication
4. See documentation for full security setup

**Current Status**: Security is enabled but not configured (anonymous access for development/testing)

### Custom Styling

The embedded webchat is styled to match Chain AI's premium design:

```javascript
style: {
  headerColor: '#4f46e5',              // Indigo primary
  userMessageBackgroundColor: '#6366f1', // User message bubbles
  primaryColor: '#0f62fe',             // IBM Blue for interactive elements
  showBackgroundGradient: false        // Disabled for custom background
}
```

Additional styling through CSS and custom layout:
- **Form**: Custom (embedded in specific container)
- **Header**: Hidden (using Chain AI's custom header)
- **Container**: Glassmorphic background with dark/light theme support

### Event Customization

#### Feedback Integration
Every message automatically includes feedback options:

```javascript
message_options: {
  feedback: {
    is_on: true,
    show_positive_details: false,
    show_negative_details: true,
    positive_options: {
      categories: ['Helpful', 'Accurate', 'Fast'],
      disclaimer: 'Your feedback helps improve Chain AI.',
    },
    negative_options: {
      categories: ['Inaccurate', 'Incomplete', 'Too slow', 'Irrelevant', 'Other'],
      disclaimer: 'Your feedback helps improve Chain AI.',
    },
  },
}
```

## Usage

### Starting the Application

1. The Chain AI Supervisor component now defaults to **Live Chat mode**
2. Select an AI agent from the left panel
3. Start chatting with the real watsonx agent
4. Switch to Demo Mode to see the simulated multi-agent workflow

### Switching Modes

Use the toggle in the top banner:
- **Live Chat**: Connects to real IBM watsonx agents
- **Demo Mode**: Shows simulated multi-agent orchestration

### Agent Selection (Live Mode)

Click any agent card in the left panel to switch active agents:
- Supervisor Agent
- Disruption Analyzer  
- Root Cause Investigator
- Mitigation Recommender
- Communicator Agent

## API Reference

### WatsonXChat Component Props

```typescript
interface WatsonXChatProps {
  agent: WatsonXAgent;        // Agent configuration
  onLoad?: () => void;        // Called when chat instance loads
  onChatReady?: () => void;   // Called when chat is ready for user input
  className?: string;         // Additional CSS classes
}
```

### WatsonXAgent Type

```typescript
interface WatsonXAgent {
  id: string;                   // Internal ID (supervisor, analyzer, etc.)
  name: string;                 // Display name
  agentId: string;              // IBM watsonx agent ID
  agentEnvironmentId: string;   // Agent environment ID
  description: string;          // Agent description
  color: string;                // Theme color
}
```

## Configuration Management

All watsonx configuration is centralized in `/services/watsonx-config.ts`:

```typescript
export const WATSONX_CONFIG = {
  orchestrationID: "...",
  hostURL: "https://us-south.watson-orchestrate.cloud.ibm.com",
  deploymentPlatform: "ibmcloud",
  crn: "...",
  apiKey: "...",  // Stored in config (move to env vars for production)
  apiUrl: "..."
};

export const AGENTS: WatsonXAgent[] = [
  // All 5 agents defined here
];
```

### Production Recommendations

For production deployment:

1. **Environment Variables**: Move API key to environment variable
2. **Security**: Enable JWT-based authentication (see security script)
3. **Error Handling**: Add retry logic and fallback mechanisms
4. **Monitoring**: Log all agent interactions for analytics
5. **Rate Limiting**: Implement client-side rate limiting if needed

## Troubleshooting

### Chat Not Loading
- Check browser console for errors
- Verify API key is valid
- Ensure `hostURL` is correct for your region
- Check network connectivity to `*.watson-orchestrate.cloud.ibm.com`

### Agent Not Responding
- Verify agent ID and environment ID are correct
- Check agent is deployed in watsonx Orchestrate console
- Review agent configuration and tool availability

### Styling Issues
- Embedded webchat uses Shadow DOM, some styles may not apply
- Use watsonx configuration `style` object for theme customization
- Custom elements can be styled through the parent container

## Next Steps

1. **Context Variables**: Add context to messages (user ID, session data, etc.)
2. **Advanced Security**: Implement full JWT authentication
3. **Analytics**: Track agent performance and user satisfaction
4. **Custom Responses**: Add user-defined response handlers for rich UI
5. **Thread Management**: Support conversation history and thread switching

## Resources

- [IBM watsonx Orchestrate Documentation](https://www.ibm.com/docs/en/watsonx/watson-orchestrate)
- [Embedded Webchat Security Guide](https://www.ibm.com/docs/en/watsonx/watson-orchestrate/base?topic=experience-using-agents-in-embedded-webchat)
- Chain AI Design System: `/guidelines/Guidelines.md`
- Data Sources: `/DATA_SOURCES.md`

---

**Last Updated**: November 3, 2025  
**Integration Status**: ✅ Complete - Live watsonx agents active  
**Security Status**: ⚠️ Development mode (anonymous access)
