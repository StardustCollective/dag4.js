declare let window;

export class StateStorageDb {

  private keyPrefix = 'dag4-';
  private storageClient: IStateStorageClient;
  private defaultStorage: any;

  constructor (storageClient: IStateStorageClient) {
    this.defaultStorage = (typeof window !== 'undefined' && window.hasOwnProperty('localStorage')) ? window.localStorage : undefined;
    this.storageClient = storageClient || this.defaultStorage;
  }

  setClient (client: IStateStorageClient) {
    this.storageClient = client || this.defaultStorage;
  }

  setPrefix (prefix: string) {
    if (!prefix) {
      prefix = 'dag4-';
    }
    else if (prefix.charAt(prefix.length - 1) !== '-') {
      prefix += '-';
    }
    this.keyPrefix = prefix;
  }

  async set (key: string, value: any) {
    await this.storageClient.setItem(this.keyPrefix + key, JSON.stringify(value));
  }

  async get (key: string) {
    const value = await this.storageClient.getItem(this.keyPrefix + key);
    if (value) {
      return JSON.parse(value);
    }
  }

  delete (key: string) {
    this.storageClient.removeItem(this.keyPrefix + key);
  }
}

export interface IStateStorageClient {
  getItem(key: string): string | null;
  removeItem(key: string): void;
  setItem(key: string, value: string): void;
}
