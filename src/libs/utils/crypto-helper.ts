import * as dotenv from 'dotenv';


dotenv.config();

const elliptic = require('elliptic');
const crypto = require('crypto');
const ec = new elliptic.ec('secp256k1');
const AES_KEY_SIZE = 32;   //byte

//ECIES
export class CryptoHelper {
    private static keyPair = ec.genKeyPair();
    static encrypt(data: string): string {
        try {
            const pubKey = this.keyPair.getPublic('hex');

            const recipientPublicKey = ec.keyFromPublic(pubKey, 'hex');
            const sharedSecret = this.keyPair.derive(recipientPublicKey.getPublic()).toString('hex');

            // Use the shared secret as the AES key (in practice, you may hash it or use a KDF)
            const aesKey = crypto.createHash('sha256').update(sharedSecret).digest().slice(0, AES_KEY_SIZE);

            //encrypt
            const iv = crypto.randomBytes(16);  
            const cipher = crypto.createCipheriv('aes-256-cbc', aesKey, iv);
            let encrypted = cipher.update(data, 'utf8', 'base64');
            encrypted += cipher.final('base64');

            return `${pubKey}:${iv.toString('hex')}:${encrypted}`;
        } catch (error) {
            throw new Error(`Encryption failed: ${error.message}`);
        }
    }

    static decrypt(encrypted: string): string {
        try {
            const [pubKey, ivHex, encryptedData] = encrypted.split(':');
            const iv = Buffer.from(ivHex, 'hex');

            //Get privatekey
            const recipientKeyPair = ec.keyFromPrivate(process.env.PRIVATE_KEY);  
            const recipientPublicKey = ec.keyFromPublic(pubKey, 'hex');

            const sharedSecret = recipientKeyPair.derive(recipientPublicKey.getPublic()).toString('hex');
            const aesKey = crypto.createHash('sha256').update(sharedSecret).digest().slice(0, AES_KEY_SIZE);

            // Decrypt the data with AES
            const decipher = crypto.createDecipheriv('aes-256-cbc', aesKey, iv);
            let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
            decrypted += decipher.final('utf8');

            return decrypted;
        } catch (error) {
            throw new Error(`Decryption failed: ${error.message}`);
        }
    }
}