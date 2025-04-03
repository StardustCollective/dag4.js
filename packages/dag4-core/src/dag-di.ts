import {RestApi} from './cross-platform/api/rest.api';
import {IHttpClient} from './cross-platform/i-http-client';
import {crossPlatformDi} from './cross-platform/cross-platform-di';
import {IKeyValueDb} from './cross-platform/i-key-value-db';
import {FetchRestService} from './cross-platform/clients/fetch.http';
import {IStateStorageClient} from './cross-platform/clients/state-storage-db';

/**
 * Dependency injection container for DAG-related services
 * Provides methods to register and retrieve HTTP clients and storage clients
 */
export class DagDi {

  /**
   * Creates a new REST API instance with the specified base URL
   * @param {string} baseUrl - The base URL for the REST API
   * @returns {RestApi} A new REST API instance
   */
  createRestApi(baseUrl: string) {
    return new RestApi(baseUrl);
  }

  /**
   * Registers a Fetch-based HTTP client for making API requests
   * @param {any} [fetchClient] - Optional custom fetch implementation
   */
  useFetchHttpClient(fetchClient?) {
    this.registerHttpClient(new FetchRestService(fetchClient));
  }

  /**
   * Registers a localStorage-based storage client
   * @param {any} [storageClient] - Optional custom storage client implementation
   */
  useLocalStorageClient(storageClient?) {
    crossPlatformDi.registerStorageClient(storageClient);
  }

  /**
   * Registers an HTTP client for making API requests
   * @param {IHttpClient} client - The HTTP client implementation
   * @param {string} [baseUrl] - Optional base URL for the HTTP client
   */
  registerHttpClient (client: IHttpClient, baseUrl?: string) {
    crossPlatformDi.registerHttpClient(client, baseUrl);
  }

  /**
   * Registers a storage client for state persistence
   * @param {IStateStorageClient} client - The storage client implementation
   */
  registerStorageClient (client: IStateStorageClient) {
    crossPlatformDi.registerStorageClient(client);
  }

  /**
   * Gets the state storage database instance
   * @returns {IKeyValueDb} The state storage database
   */
  getStateStorageDb(): IKeyValueDb {
    return crossPlatformDi.getStateStorageDb();
  }
}

export const dagDi = new DagDi();
