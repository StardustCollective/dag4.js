
export class StateStorageDb {

  private keyPrefix = 'dag4-';

  constructor (private storageClient: IStateStorageClient) {}

  setPrefix (prefix: string) {
    if (!prefix) {
      prefix = 'dag4-';
    }
    else if (prefix.charAt(prefix.length - 1) !== '-') {
      prefix += '-';
    }
    this.keyPrefix = prefix;
  }

  set (key: string, value: any) {
    this.storageClient.setItem(this.keyPrefix + key, JSON.stringify(value));
  }

  get (key: string): any {
    const value = this.storageClient.getItem(this.keyPrefix + key);
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
