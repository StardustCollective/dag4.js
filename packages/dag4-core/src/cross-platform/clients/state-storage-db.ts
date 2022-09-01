declare let window;
const defaultStorage = typeof window !== 'undefined' ? window.localStorage : undefined;

export class StateStorageDb {

  private keyPrefix = 'dag4-';

  constructor (private storageClient: IStateStorageClient = defaultStorage) {}

  setClient (client: IStateStorageClient) {
    this.storageClient = client || defaultStorage;
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
