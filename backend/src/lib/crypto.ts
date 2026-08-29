import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 12;  // 96 bits for GCM
const TAG_LENGTH = 16; // 128 bits auth tag

function getKey(): Buffer {
  const raw = process.env.ENCRYPTION_KEY || '';
  if (!raw) {
    console.warn('[crypto] ENCRYPTION_KEY not set — using insecure fallback. Set it in .env!');
  }
  // Derive a 32-byte key from whatever string is provided
  return crypto.createHash('sha256').update(raw || 'insecure-dev-key-change-me').digest();
}

/**
 * Encrypts a plaintext string using AES-256-GCM.
 * Returns a colon-delimited string: iv:authTag:ciphertext (all hex).
 */
export function encrypt(plaintext: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, { authTagLength: TAG_LENGTH });

  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return [iv.toString('hex'), authTag.toString('hex'), encrypted.toString('hex')].join(':');
}

/**
 * Decrypts a string previously produced by encrypt().
 */
export function decrypt(encryptedStr: string): string {
  const key = getKey();
  const [ivHex, tagHex, ciphertextHex] = encryptedStr.split(':');
  if (!ivHex || !tagHex || !ciphertextHex) throw new Error('Invalid encrypted string format');

  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(tagHex, 'hex');
  const ciphertext = Buffer.from(ciphertextHex, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, { authTagLength: TAG_LENGTH });
  decipher.setAuthTag(authTag);

  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
}

// Aliases for token encryption/decryption
export const encryptToken = encrypt;
export const decryptToken = decrypt;

