/**
 * Interface for key-value database implementations
 * Provides a standard way to store and retrieve data across different platforms
 */
export interface IKeyValueDb {
  /**
   * Sets a prefix for all keys in the database
   * @param {string} prefix - The prefix to use for all keys
   */
  setPrefix (prefix: string);
  
  /**
   * Sets a value in the database for the specified key
   * @param {string} key - The key to store the value under
   * @param {any} value - The value to store
   */
  set (key: string, value: any);
  
  /**
   * Gets a value from the database for the specified key
   * @param {string} key - The key to retrieve
   * @returns {any} The value stored under the key, or undefined if not found
   */
  get (key: string): any;
  
  /**
   * Deletes a value from the database for the specified key
   * @param {string} key - The key to delete
   */
  delete (key: string);
}
