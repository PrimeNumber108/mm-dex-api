// import sodium from 'libsodium-wrappers';
const sodium = require('libsodium-wrappers-sumo');


export class CryptoFEHelper {
    private static sodiumReady = sodium.ready.then(() => sodium); // Ensure libsodium is ready
    private static x25519KeyPair: { publicKey: string; privateKey: string } | null = null;

    static async generateKeypair(): Promise<{ publicKey: string; privateKey: string }> {
        const sodiumInstance = await this.sodiumReady;
        const keyPair = sodiumInstance.crypto_box_keypair();

        this.x25519KeyPair = {
            publicKey: sodiumInstance.to_base64(keyPair.publicKey, sodiumInstance.base64_variants.ORIGINAL),
            privateKey: sodiumInstance.to_base64(keyPair.privateKey, sodiumInstance.base64_variants.ORIGINAL)
        };

        return this.x25519KeyPair;
    }

    static async encryptMessage(message: string, publicKeyBase64: string): Promise<string> {
        await sodium.ready;
        
        const publicKey = sodium.from_base64(publicKeyBase64, sodium.base64_variants.ORIGINAL);
        const sealed = sodium.crypto_box_seal(sodium.from_string(message), publicKey);
        
        return sodium.to_base64(sealed, sodium.base64_variants.ORIGINAL);
    }

    static async decryptMessage(sealedBase64: string, privKeyBase64: string, pubKeyBase64: string): Promise<string> {
        await sodium.ready; 
    
        const privKey = sodium.from_base64(privKeyBase64, sodium.base64_variants.ORIGINAL);
        const pubKey = sodium.from_base64(pubKeyBase64, sodium.base64_variants.ORIGINAL);
        const sealed = sodium.from_base64(sealedBase64, sodium.base64_variants.ORIGINAL);
    
        const decrypted = sodium.crypto_box_seal_open(sealed, pubKey, privKey);
        
        if (!decrypted) {
            throw new Error("Decryption failed");
        }
    
        return sodium.to_string(decrypted);
    }
    

}
