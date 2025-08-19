import argon2 from 'argon2';

// Environment configuration with secure defaults
const PEPPER = process.env.PASSWORD_PEPPER || '';
const TIME_COST = Number(process.env.ARGON2_TIME_COST || 3);
const MEMORY_COST = Number(process.env.ARGON2_MEMORY_COST || 65536);
const PARALLELISM = Number(process.env.ARGON2_PARALLELISM || 1);

if (!PEPPER) {
  console.warn('WARNING: PASSWORD_PEPPER not set in environment variables. Using empty pepper.');
}

const argon2Options = {
  type: argon2.argon2id,
  timeCost: TIME_COST,
  memoryCost: MEMORY_COST,
  parallelism: PARALLELISM,
};

/**
 * Hash a password using Argon2id with server-side pepper
 * @param plainPassword - The plain text password
 * @returns Promise<string> - The hashed password
 */
export async function hashPassword(plainPassword: string): Promise<string> {
  if (!plainPassword) {
    throw new Error('Password cannot be empty');
  }
  
  try {
    // Add pepper before hashing
    const pepperedPassword = plainPassword + PEPPER;
    return await argon2.hash(pepperedPassword, argon2Options);
  } catch (error) {
    console.error('Password hashing failed:', error);
    throw new Error('Password hashing failed');
  }
}

/**
 * Verify a password against its hash
 * @param hash - The stored password hash
 * @param candidatePassword - The password to verify
 * @returns Promise<boolean> - True if password matches
 */
export async function verifyPassword(hash: string, candidatePassword: string): Promise<boolean> {
  if (!hash || !candidatePassword) {
    return false;
  }
  
  try {
    // Add pepper before verification
    const pepperedPassword = candidatePassword + PEPPER;
    return await argon2.verify(hash, pepperedPassword);
  } catch (error) {
    console.error('Password verification failed:', error);
    return false;
  }
}

/**
 * Check if a password hash needs to be updated (algorithm/parameters changed)
 * @param hash - The stored password hash
 * @returns boolean - True if hash needs updating
 */
export function needsRehash(hash: string): boolean {
  if (!hash) return true;
  
  try {
    // Parse the hash to check parameters
    const parts = hash.split('$');
    if (parts.length < 6) return true;
    
    // Check if it's Argon2id
    if (parts[1] !== 'argon2id') return true;
    
    // Parse parameters
    const params = parts[3].split(',');
    const currentTimeCost = parseInt(params[0].split('=')[1]);
    const currentMemoryCost = parseInt(params[1].split('=')[1]);
    const currentParallelism = parseInt(params[2].split('=')[1]);
    
    // Check if parameters are weaker than current settings
    return (
      currentTimeCost < TIME_COST ||
      currentMemoryCost < MEMORY_COST ||
      currentParallelism < PARALLELISM
    );
  } catch (error) {
    // If we can't parse the hash, assume it needs updating
    return true;
  }
}

/**
 * Verify a plaintext password directly (for migration purposes only)
 * @param storedPassword - The stored plaintext password
 * @param candidatePassword - The password to verify
 * @returns boolean - True if passwords match
 */
export function verifyPlaintextPassword(storedPassword: string, candidatePassword: string): boolean {
  return storedPassword === candidatePassword;
}