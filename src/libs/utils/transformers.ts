import { ValueTransformer } from "typeorm";
import { CryptoHelper } from "./crypto-helper";
import { decodePairData, encodePairData } from "src/modules/token/token-dto";

export namespace TypeormTransformers {
  export const encryptionTransformer: ValueTransformer = {
    to(value: string) {
      return CryptoHelper.encrypt(value);
    },
    from(value: string) {
      return CryptoHelper.decrypt(value);
    }
  }

  export const pairDataTransformer: ValueTransformer = {
    to(value) {
      return encodePairData(value)
    },
    from(value: string) {
      return decodePairData(value)
    }
  }

  export const timestampTransformer: ValueTransformer = {
    to: (value: number | Date) => (value instanceof Date ? value : new Date(value)), // Ensure Date for DB
    from: (value: Date) => value?.getTime() ?? null, // Convert DB Date to milliseconds
  };
}