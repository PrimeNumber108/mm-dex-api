import EC from 'elliptic';
const ec = new EC.ec('secp256k1'); // Use secp256k1 (Bitcoin, Ethereum standard) or secp256r1

export class CryptoHelper {
    private static keyPair = ec.genKeyPair(); // Generate a key pair (can be pre-generated & stored securely)

    static encrypt(data: string): string {
        const pubKey = this.keyPair.getPublic('hex');
        const encrypted = ec.encrypt(pubKey, Buffer.from(data));
        return JSON.stringify(encrypted);
    }

    static decrypt(encrypted: string): string {
        const privKey = this.keyPair.getPrivate('hex');
        const decrypted = ec.decrypt(privKey, JSON.parse(encrypted));
        return decrypted.toString();
    }
}
