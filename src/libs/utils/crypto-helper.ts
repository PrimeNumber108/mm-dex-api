import CryptoJS from 'crypto-js';
import { env } from 'src/config';

export namespace CryptoHelper {
  export const encrypt = (text: string, secret?: string) => {
    const passphrase = secret ?? env.keys.passphrase;
    return CryptoJS.AES.encrypt(text, passphrase).toString();
  };

  export const decrypt = (ciphertext: string, secret?: string) => {
    const passphrase = secret ?? env.keys.passphrase;
    const bytes = CryptoJS.AES.decrypt(ciphertext, passphrase);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    return originalText;
  };
}