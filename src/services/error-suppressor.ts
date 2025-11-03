/**
 * Global Error Suppressor
 * Suppresses known errors and warnings from watsonx widget and dependencies
 * This must be loaded FIRST before any other imports
 */

// Save original console methods
const originalError = console.error;
const originalWarn = console.warn;

// Known error patterns to suppress
const SUPPRESSED_ERROR_PATTERNS = [
  'authTokenNeeded',
  'AxiosError',
  'Request failed with status code 401',
  'display_name',
  'agent details',
  'WxOChat',
  'Failed to fetch agent details',
  'Cannot read properties of null',
];

// Known warning patterns to suppress
const SUPPRESSED_WARNING_PATTERNS = [
  'Multiple instances of Three.js',
  'Three.js',
  'react-i18next',
  'initReactI18next',
  'i18next instance',
];

// Override console.error
console.error = (...args: any[]) => {
  const message = String(args[0] || '');
  
  // Check if this error should be suppressed
  const shouldSuppress = SUPPRESSED_ERROR_PATTERNS.some(pattern => 
    message.includes(pattern)
  );
  
  if (shouldSuppress) {
    // Optionally log to a separate debug channel if needed
    // console.debug('[Suppressed Error]', ...args);
    return;
  }
  
  // Log all other errors normally
  originalError.apply(console, args);
};

// Override console.warn
console.warn = (...args: any[]) => {
  const message = String(args[0] || '');
  
  // Check if this warning should be suppressed
  const shouldSuppress = SUPPRESSED_WARNING_PATTERNS.some(pattern => 
    message.includes(pattern)
  );
  
  if (shouldSuppress) {
    // Optionally log to a separate debug channel if needed
    // console.debug('[Suppressed Warning]', ...args);
    return;
  }
  
  // Log all other warnings normally
  originalWarn.apply(console, args);
};

// Export a function to restore original console if needed
export const restoreConsole = () => {
  console.error = originalError;
  console.warn = originalWarn;
};

// Log that suppressor is active
console.log(
  '%c🔇 Error Suppressor Active',
  'color: #6366f1; font-size: 11px; font-style: italic;',
  '| Filtering known watsonx widget messages'
);

export {};
