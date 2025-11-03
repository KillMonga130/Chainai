/**
 * IBM watsonx Orchestrate Configuration
 * Chain AI - Multi-Agent Emergency Supply Chain Response Platform
 */

export interface WatsonXAgent {
  id: string;
  name: string;
  agentId: string;
  agentEnvironmentId: string;
  description: string;
  color: string;
}

export const WATSONX_CONFIG = {
  orchestrationID: "c139b03f7afb4bc7b617216e3046ac5b_6e4a398d-0f34-42ad-9706-1f16af156856",
  hostURL: "https://us-south.watson-orchestrate.cloud.ibm.com",
  deploymentPlatform: "ibmcloud" as const,
  crn: "crn:v1:bluemix:public:watsonx-orchestrate:us-south:a/c139b03f7afb4bc7b617216e3046ac5b:6e4a398d-0f34-42ad-9706-1f16af156856::",
  // Load API key from environment variable only
  apiKey: (import.meta as any)?.env?.VITE_WATSONX_API_KEY ?? "",
  apiUrl: "https://api.us-south.watson-orchestrate.cloud.ibm.com/instances/6e4a398d-0f34-42ad-9706-1f16af156856"
};

export const AGENTS: WatsonXAgent[] = [
  {
    id: 'supervisor',
    name: 'Supervisor Agent',
    agentId: '5529ab2d-b69d-40e8-a0af-78655396c3e5',
    agentEnvironmentId: '87dcb805-67f1-4d94-a1b4-469a8f0f4dad',
    description: 'Orchestrates multi-agent workflow using ReAct reasoning framework',
    color: 'indigo'
  },
  {
    id: 'analyzer',
    name: 'Disruption Analyzer',
    agentId: '6b049d85-126a-4545-9292-a8f4ec290b02',
    agentEnvironmentId: '2da4dc33-42b2-414d-8e57-085b6d9dda02',
    description: 'Scans ReliefWeb crisis data and identifies supply chain vulnerabilities',
    color: 'purple'
  },
  {
    id: 'investigator',
    name: 'Root Cause Investigator',
    agentId: '2a9d1b56-81d7-4eb4-b3bf-aa1c26b33e8d',
    agentEnvironmentId: '88eea2ad-ef89-41b2-ab4f-231ad6ede49a',
    description: 'Analyzes transportation, weather, and inventory data to identify root causes',
    color: 'blue'
  },
  {
    id: 'recommender',
    name: 'Mitigation Recommender',
    agentId: '9acc7c17-0f8f-4206-ba71-ae7cad029b0b',
    agentEnvironmentId: '908dc7a8-831d-4110-846b-2afeafca61c0',
    description: 'Generates actionable mitigation strategies with cost and risk assessments',
    color: 'teal'
  },
  {
    id: 'communicator',
    name: 'Communicator Agent',
    agentId: 'b9b35094-185e-4aed-a537-b4dc8435cae8',
    agentEnvironmentId: '208dc747-4863-4d1e-810d-44b66a605c52',
    description: 'Generates targeted communications for stakeholders and leadership',
    color: 'green'
  }
];

export function getAgentById(id: string): WatsonXAgent | undefined {
  return AGENTS.find(agent => agent.id === id);
}

export function getWatsonXConfig(agentId: string) {
  const agent = AGENTS.find(a => a.id === agentId);
  if (!agent) {
    throw new Error(`Agent not found: ${agentId}`);
  }

  return {
    orchestrationID: WATSONX_CONFIG.orchestrationID,
    hostURL: WATSONX_CONFIG.hostURL,
    deploymentPlatform: WATSONX_CONFIG.deploymentPlatform,
    crn: WATSONX_CONFIG.crn,
    chatOptions: {
      agentId: agent.agentId,
      agentEnvironmentId: agent.agentEnvironmentId,
    }
  };
}
