declare let window;

/**
 * Database for storing state across sessions
 * Provides a key-value storage interface with prefix support
 */
export class StateStorageDb {

  private keyPrefix = 'dag4-';
  private storageClient: IStateStorageClient;
  private defaultStorage: any;

  /**
   * Creates a new state storage database
   * @param {IStateStorageClient} storageClient - The storage client implementation
   */
  constructor (storageClient: IStateStorageClient) {
    this.defaultStorage = (typeof window !== 'undefined' && window.hasOwnProperty('localStorage')) ? window.localStorage : undefined;
    this.storageClient = storageClient || this.defaultStorage;
  }

  /**
   * Sets the storage client to use
   * @param {IStateStorageClient} client - The storage client implementation
   */
  setClient (client: IStateStorageClient) {
    this.storageClient = client || this.defaultStorage;
  }

  /**
   * Sets a prefix for all keys in the database
   * @param {string} prefix - The prefix to use for all keys
   */
  setPrefix (prefix: string) {
    if (!prefix) {
      prefix = 'dag4-';
    }
    else if (prefix.charAt(prefix.length - 1) !== '-') {
      prefix += '-';
    }
    this.keyPrefix = prefix;
  }

  /**
   * Sets a value in the database for the specified key
   * @param {string} key - The key to store the value under
   * @param {any} value - The value to store
   */
  async set (key: string, value: any) {
    await this.storageClient.setItem(this.keyPrefix + key, JSON.stringify(value));
  }

  /**
   * Gets a value from the database for the specified key
   * @param {string} key - The key to retrieve
   * @returns {any} The value stored under the key, or undefined if not found
   */
  async get (key: string) {
    const value = await this.storageClient.getItem(this.keyPrefix + key);
    if (value) {
      return JSON.parse(value);
    }
  }

  /**
   * Deletes a value from the database for the specified key
   * @param {string} key - The key to delete
   */
  delete (key: string) {
    this.storageClient.removeItem(this.keyPrefix + key);
  }
}

/**
 * Interface for state storage client implementations
 * Provides a standard way to store and retrieve data across different platforms
 */
export interface IStateStorageClient {
  /**
   * Gets a value from the storage for the specified key
   * @param {string} key - The key to retrieve
   * @returns {string|null} The value stored under the key, or null if not found
   */
  getItem(key: string): string | null;
  
  /**
   * Removes a value from the storage for the specified key
   * @param {string} key - The key to remove
   */
  removeItem(key: string): void;
  
  /**
   * Sets a value in the storage for the specified key
   * @param {string} key - The key to store the value under
   * @param {string} value - The value to store
   */
  setItem(key: string, value: string): void;
}
