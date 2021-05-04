import { IHttpClient } from './i-http-client';
import {IKeyValueDb} from './i-key-value-db';
import {IStateStorageClient, StateStorageDb} from './clients/state-storage-db';
import {MemoryStorageClient} from './clients/memory-storage-client';

// Cross Platform Dependency Injection
class CrossPlatformDi {

  //======================
  //   = HTTP Client =
  //======================
  private httpClient: IHttpClient;
  private httpClientBaseUrl = '';

  // Register the platform implementation for http service requests
  registerHttpClient (client: IHttpClient, baseUrl?: string) {
    this.httpClient = client;
    this.httpClientBaseUrl = baseUrl || '';
  }

  getHttpClient (): IHttpClient {
    return this.httpClient;
  }

  getHttpClientBaseUrl (): string {
    return this.httpClientBaseUrl;
  }

  //======================
  //= State Storage =
  //======================
  private stateStorageDb: StateStorageDb = new StateStorageDb(new MemoryStorageClient());

  useBrowserLocalStorage () {
    this.stateStorageDb.setClient(null);
  }

  registerStorageClient (client: IStateStorageClient) {
    this.stateStorageDb.setClient(client);
  }

  getStateStorageDb (): IKeyValueDb {
    return this.stateStorageDb;
  }
}

export const crossPlatformDi = new CrossPlatformDi();

