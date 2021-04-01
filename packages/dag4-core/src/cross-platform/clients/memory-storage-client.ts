import {IStateStorageClient} from './state-storage-db';

export class MemoryStorageClient implements IStateStorageClient {

  private memory = {};

  setItem (key: string, value: any) {
    this.memory[key] = value;
  }

  getItem (key: string): any {
    return this.memory[key];
  }

  removeItem (key: string) {
    this.memory[key] = null;
  }
}

