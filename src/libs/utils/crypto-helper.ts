import * as crypto from 'crypto';
import { env } from 'src/config';

export namespace CryptoHelper {
  const ALGORITHM = 'aes-256-cbc';
  const SALT_LENGTH = 16;
  const IV_LENGTH = 16;
  const KEY_LENGTH = 32;
  const ITERATIONS = 100000;

  export const encrypt = (text: string, secret?: string): string => {
    const passphrase = secret ?? env.keys.passphrase;
    const salt = crypto.randomBytes(SALT_LENGTH);
    const key = crypto.pbkdf2Sync(passphrase, salt, ITERATIONS, KEY_LENGTH, 'sha256');
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${salt.toString('hex')}:${iv.toString('hex')}:${encrypted}`;
  };

  export const decrypt = (ciphertext: string, secret?: string): string => {
    const passphrase = secret ?? env.keys.passphrase;
    const parts = ciphertext.split(':');
    if (parts.length !== 3) {
      // Fallback for legacy ciphertext if needed
      return ciphertext;
    }
    const salt = Buffer.from(parts[0], 'hex');
    const iv = Buffer.from(parts[1], 'hex');
    const encryptedText = parts[2];
    const key = crypto.pbkdf2Sync(passphrase, salt, ITERATIONS, KEY_LENGTH, 'sha256');
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  };
}