import axios from "axios";
import * as CryptoJS from "crypto-js";
import { env } from "src/config";

export namespace ExecutorSDK {
    const passphrase = env.executor.passphrase;
    export const client = axios.create({
        baseURL: env.executor.endPoint,
        headers: {
            'x-api-secret': env.executor.apiSecret,
            'username': env.executor.apiUsername,
            'Accept': 'application/json'
        }
    });

    export const encryptPayload = (raw: any) => {
        return CryptoJS.AES.encrypt(JSON.stringify(raw), passphrase).toString();
    }
    export const decryptPayload = (encrypted: string) => {
        const bytes = (CryptoJS.AES.decrypt(encrypted, passphrase))
        const originalText = bytes.toString(CryptoJS.enc.Utf8);
        return JSON.parse(originalText);
    }
}