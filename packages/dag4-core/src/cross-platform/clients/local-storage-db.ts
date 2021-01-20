
export class LocalStorageDb {

  private keyPrefix = 'dag4-';

  constructor (private storageClient: ILocalStorageDb) {}

  setPrefix (prefix: string) {
    this.keyPrefix = prefix;
  }

  set (key: string, value: any) {
    this.storageClient.setItem(this.keyPrefix + key, JSON.stringify(value));
  }

  get (key: string): any {
    return JSON.parse(this.storageClient.getItem(this.keyPrefix + key));
  }

  delete (key: string) {
    this.storageClient.removeItem(this.keyPrefix + key);
  }
}

export interface ILocalStorageDb {
  getItem(key: string): string | null;
  removeItem(key: string): void;
  setItem(key: string, value: string): void;
}
