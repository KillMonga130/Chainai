# Chain AI Agent Integration Guide

## Overview

Chain AI now features a complete multi-agent system with 5 specialized agents, all powered by IBM watsonx Orchestrate and enriched with live crisis data from ReliefWeb and OpenWeather APIs.

## Agent Architecture

### 1. **Supervisor Agent** (Orchestrator)
- **Agent ID**: `5529ab2d-b69d-40e8-a0af-78655396c3e5`
- **Environment ID**: `87dcb805-67f1-4d94-a1b4-469a8f0f4dad`
- **Role**: Master orchestrator using ReAct reasoning framework
- **Coordinates**: All 4 specialized agents in sequence
- **Special Features**: Human approval gate for high-cost decisions

### 2. **Disruption Analyzer**
- **Agent ID**: `6b049d85-126a-4545-9292-a8f4ec290b02`
- **Environment ID**: `2da4dc33-42b2-414d-8e57-085b6d9dda02`
- **Role**: Classifies supply chain disruptions by severity
- **Outputs**: Severity (High/Medium/Low), humanitarian flag, affected people count

### 3. **Root Cause Investigator**
- **Agent ID**: `2a9d1b56-81d7-4eb4-b3bf-aa1c26b33e8d`
- **Environment ID**: `88eea2ad-ef89-41b2-ab4f-231ad6ede49a`
- **Role**: Diagnoses root cause of disruptions
- **Analyzes**: Port status, weather, carrier status, customs data

### 4. **Mitigation Recommender**
- **Agent ID**: `9acc7c17-0f8f-4206-ba71-ae7cad029b0b`
- **Environment ID**: `908dc7a8-831d-4110-846b-2afeafca61c0`
- **Role**: Generates ranked mitigation strategies
- **Strategies**: Emergency Airlift, Reroute, Split Shipment, Expedite Customs, Wait

### 5. **Communicator Agent**
- **Agent ID**: `b9b35094-185e-4aed-a537-b4dc8435cae8`
- **Environment ID**: `208dc747-4863-4d1e-810d-44b66a605c52`
- **Role**: Creates stakeholder-specific messages
- **Audiences**: Clinic Directors, NGO Ops Lead, Logistics Teams

---

## Live Data Integration

### How Data Flows to Agents

**All agents automatically receive enriched context** from the Live Crisis Feed through IBM watsonx's context injection system.

#### Data Sources

1. **ReliefWeb API**
   - Real-time humanitarian crisis reports
   - Supply chain disruption alerts
   - Affected population statistics
   - Geographic crisis locations

2. **OpenWeather API**
   - Current weather conditions at crisis locations
   - Logistics impact assessment (port delays, road closures)
   - Weather-based risk factors

#### Context Injection Implementation

Located in: `src/components/WatsonXChat.tsx`

```typescript
instance.on('pre:send', async (event: any) => {
  // Fetch live data when user sends a message
  const contextData = await fetchLiveDataForContext(userMessage);
  
  // Inject into watsonx context variables
  event.data.context = {
    ...event.data.context,
    skills: {
      ...event.data.context?.skills,
      'main skill': {
        ...event.data.context?.skills?.['main skill'],
        user_defined: {
          reliefweb_reports: contextData.reports,   // Array of crisis reports
          weather_data: contextData.weather,         // Weather + logistics impact
          crisis_context: contextData.summary        // Formatted summary
        }
      }
    }
  };
});
```

### What Each Agent Receives

Every agent interaction includes:

```json
{
  "reliefweb_reports": [
    {
      "title": "Crisis title",
      "summary": "Crisis description",
      "country": "Affected country",
      "source": "Report source",
      "date": "2025-01-15",
      "url": "https://reliefweb.int/...",
      "theme": ["Food and Nutrition", "Health"],
      "format": ["News and Press Release"]
    }
  ],
  "weather_data": {
    "location": "City, Country",
    "temperature": 25.3,
    "conditions": "Clear sky",
    "wind_speed": 3.5,
    "visibility": 10000,
    "logistics_impact": {
      "port_delays": "Low risk - Good visibility, calm winds",
      "road_conditions": "Favorable - No precipitation",
      "air_freight": "Optimal - Clear skies"
    }
  },
  "crisis_context": "Haiti earthquake: 2.3M affected. Weather: Clear, 25°C. Port status: Operational."
}
```

---

## Agent Collaboration Flow

### Supervisor-Orchestrated Workflow

The Supervisor agent coordinates the analysis in 4 sequential phases:

```
User Input
    ↓
[Supervisor Agent]
    ↓
Phase 1: Disruption Analyzer
    → Receives: reliefweb_reports, weather_data
    → Classifies: severity, humanitarian_flag, affected_people
    ↓
Phase 2: Root Cause Investigator  
    → Receives: Phase 1 output + live data
    → Diagnoses: root_cause, confidence, resolution_time
    ↓
Phase 3: Mitigation Recommender
    → Receives: Phase 1 & 2 outputs + live data
    → Generates: 3 ranked mitigation strategies
    ↓
Phase 4: Communicator Agent
    → Receives: All previous outputs + live data
    → Creates: 3 audience-specific messages + KPIs
    ↓
[Human Approval Gate]
    → IF cost > $10K AND humanitarian_flag = true
    → THEN: Display approval card, wait for decision
    ↓
Final Output
```

---

## Using the Agent Selector

### UI Components

1. **AgentSelector** (`src/components/AgentSelector.tsx`)
   - Displays all 5 agents with descriptions
   - Color-coded by agent type
   - Shows active agent status
   - Context injection indicator

2. **ChainAISupervisor** (`src/components/ChainAISupervisor.tsx`)
   - Now accepts `agent` prop
   - Dynamically loads selected agent
   - Maintains chat history per agent

### How to Switch Agents

Users can interact with any agent directly:

1. **Supervisor Agent** (Default)
   - Full orchestrated workflow
   - Coordinates all 4 specialized agents
   - Human approval for high-stakes decisions

2. **Individual Specialized Agents**
   - Direct access to specific agent capabilities
   - Still receive full Live Crisis Feed context
   - Useful for testing specific agent behaviors

### Example Use Cases

#### Use Supervisor for:
- "Haiti earthquake - vaccines stuck at port - 350 patients waiting"
- Complete end-to-end crisis analysis
- Multi-step mitigation planning

#### Use Disruption Analyzer for:
- "Classify this crisis: blood supplies delayed, 1000 units"
- Quick severity assessment
- Humanitarian flag determination

#### Use Root Cause Investigator for:
- "Port congestion at Rotterdam - diagnose cause"
- Deep-dive root cause analysis
- Evidence-based diagnosis

#### Use Mitigation Recommender for:
- "Weather delays - what's fastest low-cost option?"
- Strategy comparison
- ROI calculations

#### Use Communicator for:
- "Airlift approved - generate stakeholder messages"
- Message creation only
- KPI reporting

---

## Configuration Checklist

### ✅ Already Configured

- [x] All 5 agents added to `src/services/watsonx-config.ts`
- [x] Agent IDs and environment IDs from IBM watsonx
- [x] Security disabled on server (confirmed via script)
- [x] Live data context injection in `WatsonXChat.tsx`
- [x] ReliefWeb API integration
- [x] OpenWeather API integration
- [x] Agent selector UI component
- [x] Dynamic agent switching

### 🔧 On IBM watsonx Side

Each agent should be configured with:

1. **Knowledge Sources**
   - Upload crisis response guidelines
   - Add supply chain best practices documents
   - Include humanitarian logistics procedures

2. **Agent Dependencies** (for Supervisor)
   - DisruptionAnalyzer → added as tool
   - RootCauseInvestigator → added as tool
   - MitigationRecommender → added as tool
   - Communicator → added as tool

3. **Instructions**
   - Already configured per your screenshots
   - Each agent has clear role definition
   - JSON output formats specified

---

## Testing the System

### Test Scenario 1: Full Workflow
```
1. Select "Supervisor Agent"
2. Send: "Haiti - vaccines at port - 350 patients - 4 days delayed - help"
3. Expect:
   - Disruption analysis (High severity, humanitarian_flag=true)
   - Root cause diagnosis (port congestion)
   - 3 mitigation options (Airlift, Reroute, Split)
   - Human approval request (cost > $10K)
   - Stakeholder messages (3 audiences)
```

### Test Scenario 2: Individual Agent
```
1. Select "Disruption Analyzer"
2. Send: "Blood products held at customs - 1000 units - emergency surgery scheduled"
3. Expect:
   - Severity classification only
   - Humanitarian flag determination
   - Confidence score
   - No orchestration to other agents
```

### Test Scenario 3: Live Data Enrichment
```
1. Send any message mentioning a location
2. Check console logs for:
   - "[Chain AI] Pre-send event - enriching with live data"
   - "[Chain AI] Injected context variables"
3. Verify agent receives:
   - reliefweb_reports array
   - weather_data object
   - crisis_context summary
```

---

## Monitoring & Debugging

### Console Logs to Watch

```javascript
[Chain AI] Security disabled – proceeding without token
[Chain AI] Auth ready! Security disabled: false Auth token present: false
[Chain AI] Configuring watsonx Orchestrate...
[Chain AI] watsonx Orchestrate chat loaded
[Chain AI] ✅ Chat ready
[Chain AI] Pre-send event - enriching with live data
[Chain AI] Injected context variables: { skills: {...} }
```

### Common Issues

1. **Chat not loading**
   - Hard reload: Ctrl+Shift+R
   - Check security disabled server-side
   - Verify agent IDs match IBM watsonx

2. **Context not injecting**
   - Check `pre:send` event fires
   - Verify API keys for ReliefWeb/OpenWeather
   - Check console for context injection logs

3. **Agent not responding**
   - Verify agent published on IBM side
   - Check agent environment ID
   - Ensure instructions configured

---

## Next Steps

### Enhance Knowledge Base
Upload domain-specific documents to each agent:
- Supply chain logistics procedures
- Humanitarian response protocols
- Historical crisis case studies
- Mitigation strategy templates

### Add Custom Tools
Create watsonx tools for:
- Real-time inventory lookup
- Carrier tracking integration
- Cost calculation APIs
- Approval workflow system

### Improve Context
Enrich context variables with:
- Historical crisis data
- Supply chain metrics
- Partner capabilities database
- Resource availability status

---

## Support & Resources

- **IBM watsonx Orchestrate Docs**: https://cloud.ibm.com/docs/watson-orchestrate
- **ReliefWeb API**: https://apidoc.reliefweb.int/
- **OpenWeather API**: https://openweathermap.org/api
- **Project Repository**: https://github.com/KillMonga130/Chainai

---

**Built with ❤️ for Call for Code Global Challenge 2025**
