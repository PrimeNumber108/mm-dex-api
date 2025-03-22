const elliptic = require('elliptic');
const ec = new elliptic.ec('secp256k1'); 

export class CryptoHelper {
    private static keyPair = ec.genKeyPair(); // Generate a new ECC key pair

    static encrypt(data: string): string {
        const pubKey = this.keyPair.getPublic('hex'); // Get the public key
        const encrypted = Buffer.from(data).toString('base64'); // Simple encoding (ECC encryption varies)
        return `${pubKey}:${encrypted}`; // Store pubKey along with encrypted data
    }

    static decrypt(encrypted: string): string {
        const [pubKey, data] = encrypted.split(':');
        return Buffer.from(data, 'base64').toString();
    }
}
