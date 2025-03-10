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

  export const stringArrayTransformer: ValueTransformer = {
    to: (value: string[]) => (value ? value.join(',') : ''),
    from: (value: string) => (value ? value.split(',') : []),
  };

  export const timestampTransformer: ValueTransformer = {
    to: (value: number | Date) => (value instanceof Date ? value : new Date(value)), // Ensure Date for DB
    from: (value: Date) => value?.getTime() ?? null, // Convert DB Date to milliseconds
  };
}