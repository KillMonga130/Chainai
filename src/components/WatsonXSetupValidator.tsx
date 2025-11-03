/**
 * watsonx Orchestrate Setup Validator
 * Validates configuration and provides setup guidance
 */

import { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { WATSONX_CONFIG, AGENTS } from '../services/watsonx-config';
import { CheckCircle2, XCircle, AlertTriangle, Eye, EyeOff } from 'lucide-react';

interface ValidationResult {
  isValid: boolean;
  message: string;
  severity: 'success' | 'warning' | 'error';
}

export function WatsonXSetupValidator() {
  const [showApiKey, setShowApiKey] = useState(false);
  const [results, setResults] = useState<Record<string, ValidationResult>>({});

  const validateSetup = () => {
    const newResults: Record<string, ValidationResult> = {};

    // 1. Validate Orchestration ID format
    const orchestrationIdValid = WATSONX_CONFIG.orchestrationID.length > 0 &&
      WATSONX_CONFIG.orchestrationID.includes('_');
    newResults.orchestrationId = {
      isValid: orchestrationIdValid,
      message: orchestrationIdValid
        ? 'Valid orchestration ID format'
        : 'Invalid orchestration ID - should contain account ID and instance ID separated by underscore',
      severity: orchestrationIdValid ? 'success' : 'error',
    };

    // 2. Validate Host URL
    const hostUrlValid = WATSONX_CONFIG.hostURL.startsWith('https://') &&
      WATSONX_CONFIG.hostURL.includes('watson-orchestrate');
    newResults.hostUrl = {
      isValid: hostUrlValid,
      message: hostUrlValid
        ? 'Valid watsonx Orchestrate host URL'
        : 'Invalid host URL - should be https://*.watson-orchestrate.*.ibm.com',
      severity: hostUrlValid ? 'success' : 'error',
    };

    // 3. Validate API URL
    const apiUrlValid = WATSONX_CONFIG.apiUrl.startsWith('https://api.') &&
      WATSONX_CONFIG.apiUrl.includes('/instances/');
    newResults.apiUrl = {
      isValid: apiUrlValid,
      message: apiUrlValid
        ? 'Valid API URL format'
        : 'Invalid API URL - should be https://api.*.watson-orchestrate.*.ibm.com/instances/{id}',
      severity: apiUrlValid ? 'success' : 'error',
    };

    // 4. Validate API Key format
    const apiKeyValid = WATSONX_CONFIG.apiKey.length > 20;
    newResults.apiKey = {
      isValid: apiKeyValid,
      message: apiKeyValid
        ? 'API key present (format appears valid)'
        : 'API key missing or too short',
      severity: apiKeyValid ? 'success' : 'error',
    };

    // 5. Validate CRN format
    const crnValid = WATSONX_CONFIG.crn.startsWith('crn:v1:bluemix:public:watsonx-orchestrate:');
    newResults.crn = {
      isValid: crnValid,
      message: crnValid
        ? 'Valid IBM Cloud CRN format'
        : 'Invalid CRN - should start with crn:v1:bluemix:public:watsonx-orchestrate:',
      severity: crnValid ? 'success' : 'error',
    };

    // 6. Validate deployment platform
    const platformValid = WATSONX_CONFIG.deploymentPlatform === 'ibmcloud';
    newResults.platform = {
      isValid: platformValid,
      message: platformValid
        ? 'Deployment platform correctly set to ibmcloud'
        : 'Deployment platform should be "ibmcloud" for IBM Cloud instances',
      severity: platformValid ? 'success' : 'warning',
    };

    // 7. Validate agents configuration
    const agentsValid = AGENTS.length > 0 && AGENTS.every(agent =>
      agent.agentId.length > 0 && agent.agentEnvironmentId.length > 0
    );
    newResults.agents = {
      isValid: agentsValid,
      message: agentsValid
        ? `${AGENTS.length} agents configured correctly`
        : 'One or more agents missing required IDs',
      severity: agentsValid ? 'success' : 'error',
    };

    // 8. Validate URL consistency
    const instanceId = WATSONX_CONFIG.apiUrl.split('/instances/')[1];
    const orchestrationInstanceId = WATSONX_CONFIG.orchestrationID.split('_')[1];
    const urlConsistent = instanceId === orchestrationInstanceId;
    newResults.urlConsistency = {
      isValid: urlConsistent,
      message: urlConsistent
        ? 'Instance IDs are consistent across configuration'
        : 'Instance ID mismatch between API URL and Orchestration ID',
      severity: urlConsistent ? 'success' : 'error',
    };

    setResults(newResults);
  };

  const getIcon = (severity: string, isValid: boolean) => {
    if (severity === 'success' && isValid) {
      return <CheckCircle2 className="w-5 h-5 text-green-500" />;
    } else if (severity === 'warning') {
      return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    } else {
      return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const allValid = Object.values(results).every(r => r.isValid);
  const hasErrors = Object.values(results).some(r => r.severity === 'error' && !r.isValid);

  return (
    <div className="space-y-4">
      <Alert className="backdrop-blur-sm dark:bg-slate-900/80 light:bg-white/80 border-slate-700/50">
        <AlertTitle className="flex items-center justify-between mb-4">
          <span>Configuration Validator</span>
          <Button onClick={validateSetup} size="sm" variant="outline">
            Run Validation
          </Button>
        </AlertTitle>
        <AlertDescription>
          {Object.keys(results).length === 0 ? (
            <p className="dark:text-slate-400 light:text-slate-600">
              Click "Run Validation" to check your watsonx Orchestrate configuration.
            </p>
          ) : (
            <div className="space-y-3">
              {/* Overall Status */}
              <div className={`p-3 rounded-lg ${allValid ? 'dark:bg-green-900/20 light:bg-green-50' : hasErrors ? 'dark:bg-red-900/20 light:bg-red-50' : 'dark:bg-yellow-900/20 light:bg-yellow-50'}`}>
                <p className={`${allValid ? 'dark:text-green-200 light:text-green-900' : hasErrors ? 'dark:text-red-200 light:text-red-900' : 'dark:text-yellow-200 light:text-yellow-900'}`}>
                  <strong>
                    {allValid ? '✓ All checks passed!' : hasErrors ? '✗ Configuration errors detected' : '⚠ Configuration warnings detected'}
                  </strong>
                </p>
              </div>

              {/* Individual Results */}
              {Object.entries(results).map(([key, result]) => (
                <div
                  key={key}
                  className="flex items-start gap-3 p-3 rounded-lg dark:bg-slate-800/50 light:bg-slate-50"
                >
                  {getIcon(result.severity, result.isValid)}
                  <div className="flex-1">
                    <p className="dark:text-slate-200 light:text-slate-900 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </p>
                    <p className="text-sm dark:text-slate-400 light:text-slate-600 mt-1">
                      {result.message}
                    </p>
                  </div>
                  <Badge
                    variant={result.isValid ? 'default' : 'destructive'}
                    className="capitalize"
                  >
                    {result.severity}
                  </Badge>
                </div>
              ))}

              {/* Configuration Details */}
              <div className="mt-6 p-4 rounded-lg dark:bg-slate-800/30 light:bg-slate-100 border dark:border-slate-700 light:border-slate-300">
                <h4 className="dark:text-slate-200 light:text-slate-900 mb-3">
                  Current Configuration
                </h4>
                <div className="space-y-2 text-sm font-mono">
                  <div>
                    <span className="dark:text-slate-400 light:text-slate-600">Host URL:</span>{' '}
                    <span className="dark:text-blue-400 light:text-blue-600">{WATSONX_CONFIG.hostURL}</span>
                  </div>
                  <div>
                    <span className="dark:text-slate-400 light:text-slate-600">API URL:</span>{' '}
                    <span className="dark:text-blue-400 light:text-blue-600">{WATSONX_CONFIG.apiUrl}</span>
                  </div>
                  <div>
                    <span className="dark:text-slate-400 light:text-slate-600">Orchestration ID:</span>{' '}
                    <span className="dark:text-blue-400 light:text-blue-600">{WATSONX_CONFIG.orchestrationID}</span>
                  </div>
                  <div>
                    <span className="dark:text-slate-400 light:text-slate-600">Platform:</span>{' '}
                    <span className="dark:text-blue-400 light:text-blue-600">{WATSONX_CONFIG.deploymentPlatform}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="dark:text-slate-400 light:text-slate-600">API Key:</span>{' '}
                    <span className="dark:text-blue-400 light:text-blue-600">
                      {showApiKey
                        ? WATSONX_CONFIG.apiKey
                        : '••••••••••••••••••••••••••••••••••••••••'}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="h-6 w-6 p-0"
                    >
                      {showApiKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    </Button>
                  </div>
                  <div>
                    <span className="dark:text-slate-400 light:text-slate-600">Agents:</span>{' '}
                    <span className="dark:text-blue-400 light:text-blue-600">{AGENTS.length} configured</span>
                  </div>
                </div>
              </div>

              {/* Troubleshooting Guide */}
              {hasErrors && (
                <div className="mt-4 p-4 rounded-lg dark:bg-blue-900/20 light:bg-blue-50 border dark:border-blue-800 light:border-blue-200">
                  <p className="dark:text-blue-200 light:text-blue-900 mb-2">
                    <strong>Troubleshooting Guide:</strong>
                  </p>
                  <ol className="text-sm dark:text-blue-300 light:text-blue-800 space-y-2 list-decimal list-inside">
                    <li>Log into your IBM watsonx Orchestrate instance</li>
                    <li>Go to Settings → API Details</li>
                    <li>Copy the Service instance URL (e.g., https://api.us-south.watson-orchestrate.cloud.ibm.com/instances/YOUR-INSTANCE-ID)</li>
                    <li>Generate a new API key if needed</li>
                    <li>Update watsonx-config.ts with the correct values</li>
                    <li>Ensure your IBM Cloud account has active watsonx Orchestrate access</li>
                  </ol>
                </div>
              )}
            </div>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
}
