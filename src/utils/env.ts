/**
 * Utility for safely accessing environment variables
 */

/**
 * Gets an environment variable value with a fallback default
 * @param key The environment variable key
 * @param defaultValue Default value to return if not found
 */
export function getEnv(key: string, defaultValue: string = ''): string {
  if (typeof import.meta.env === 'object' && import.meta.env !== null) {
    // Fix TypeScript error by using a better type assertion
    // Cast to unknown first before casting to Record<string, string>
    return ((import.meta.env as unknown) as Record<string, string>)[key] || defaultValue;
  }
  
  // Fallback to window.env if available (useful if you inject env vars at runtime)
  const windowEnv = (window as any).env;
  if (windowEnv && typeof windowEnv === 'object' && key in windowEnv) {
    return windowEnv[key];
  }
  
  return defaultValue;
} 