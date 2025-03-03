import { ValueTransformer } from "typeorm";
import { CryptoHelper } from "./crypto-helper";

export namespace TypeormTransformers {
    export const encryptionTransformer: ValueTransformer = {
        to(value: string) {
          return CryptoHelper.encrypt(value);
        },
        from(value: string) {
          return CryptoHelper.decrypt(value);
        }
      }
}