/**
 * i18next initialization
 * Suppress react-i18next warnings from dependencies
 */

// This file initializes i18next to prevent warnings from dependencies that expect it
// We don't actually use i18next in Chain AI, but some dependencies may check for it

if (typeof window !== 'undefined') {
  // Create a comprehensive mock i18next instance
  const mockI18n = {
    use: function(this: any, module: any) {
      return this;
    },
    init: function(options?: any, callback?: any) {
      if (callback) callback(null, () => {});
      return Promise.resolve(() => {});
    },
    t: (key: string) => key,
    exists: () => true,
    getFixedT: () => (key: string) => key,
    changeLanguage: (lng?: string, callback?: any) => {
      if (callback) callback(null, () => {});
      return Promise.resolve(() => {});
    },
    language: 'en',
    languages: ['en'],
    options: {},
    isInitialized: true,
    hasLoadedNamespace: () => true,
    loadNamespaces: () => Promise.resolve(),
    loadLanguages: () => Promise.resolve(),
    dir: () => 'ltr',
    format: (value: any) => value,
    on: () => {},
    off: () => {},
    emit: () => {},
    store: {},
    services: {
      resourceStore: {
        data: {}
      }
    }
  };

  // Attach to window and create global reference
  (window as any).i18next = mockI18n;
  (window as any).i18n = mockI18n;
  
  // Create a global object that react-i18next might look for
  if (!(window as any).__i18nextReactInstance) {
    (window as any).__i18nextReactInstance = mockI18n;
  }
}

export {};
