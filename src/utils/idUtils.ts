/**
 * Generates a unique identifier by combining the current timestamp
 * with a random string.
 * 
 * @returns A unique string ID
 */
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}; 