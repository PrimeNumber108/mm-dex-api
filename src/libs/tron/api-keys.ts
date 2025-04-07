import { apiKeys } from "src/secrets/tron-api-keys"
export class ApiKeysRotator {
  private static index: number = 0;
  static getApiKey() {
    const apiKey = apiKeys[this.index];
    this.index = (this.index + 1) % apiKeys.length;
    return apiKey;
  }
}