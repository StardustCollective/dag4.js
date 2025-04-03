import { IHttpClient } from './i-http-client';
import {IKeyValueDb} from './i-key-value-db';
import {IStateStorageClient, StateStorageDb} from './clients/state-storage-db';
import {MemoryStorageClient} from './clients/memory-storage-client';

/**
 * Cross Platform Dependency Injection container
 * Manages HTTP clients and state storage implementations across different platforms
 */
class CrossPlatformDi {

  //======================
  //   = HTTP Client =
  //======================
  private httpClient: IHttpClient;
  private httpClientBaseUrl = '';

  /**
   * Registers the platform implementation for HTTP service requests
   * @param {IHttpClient} client - The HTTP client implementation
   * @param {string} [baseUrl] - Optional base URL for the HTTP client
   */
  registerHttpClient (client: IHttpClient, baseUrl?: string) {
    this.httpClient = client;
    this.httpClientBaseUrl = baseUrl || '';
  }

  /**
   * Gets the registered HTTP client
   * @returns {IHttpClient} The HTTP client implementation
   */
  getHttpClient (): IHttpClient {
    return this.httpClient;
  }

  /**
   * Gets the base URL for the HTTP client
   * @returns {string} The base URL
   */
  getHttpClientBaseUrl (): string {
    return this.httpClientBaseUrl;
  }

  //======================
  //= State Storage =
  //======================
  private stateStorageDb: StateStorageDb = new StateStorageDb(new MemoryStorageClient());

  /**
   * Configures the state storage to use browser localStorage
   */
  useBrowserLocalStorage () {
    this.stateStorageDb.setClient(null);
  }

  /**
   * Registers a storage client for state persistence
   * @param {IStateStorageClient} client - The storage client implementation
   */
  registerStorageClient (client: IStateStorageClient) {
    this.stateStorageDb.setClient(client);
  }

  /**
   * Gets the state storage database instance
   * @returns {IKeyValueDb} The state storage database
   */
  getStateStorageDb (): IKeyValueDb {
    return this.stateStorageDb;
  }
}

export const crossPlatformDi = new CrossPlatformDi();

