import {IStateStorageClient} from './state-storage-db';

/**
 * In-memory storage client implementation
 * Provides a simple key-value storage that persists only in memory
 */
export class MemoryStorageClient implements IStateStorageClient {

  private memory = {};

  /**
   * Sets a value in the storage for the specified key
   * @param {string} key - The key to store the value under
   * @param {any} value - The value to store
   */
  setItem (key: string, value: any) {
    this.memory[key] = value;
  }

  /**
   * Gets a value from the storage for the specified key
   * @param {string} key - The key to retrieve
   * @returns {any} The value stored under the key, or null if not found
   */
  getItem (key: string): any {
    return this.memory[key];
  }

  /**
   * Removes a value from the storage for the specified key
   * @param {string} key - The key to remove
   */
  removeItem (key: string) {
    this.memory[key] = null;
  }
}

