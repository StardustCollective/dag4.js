import { IHttpClient } from './i-http-client';
import {IKeyValueDb} from './i-key-value-db';
import {StateStorageDb} from './clients/state-storage-db';
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
  private keyValueDb: IKeyValueDb = new StateStorageDb(new MemoryStorageClient());

  registerKeyValueDbClient (db: IKeyValueDb) {
    this.keyValueDb = db;
  }

  getKeyValueDbClient (): IKeyValueDb {
    return this.keyValueDb;
  }
}

export const crossPlatformDi = new CrossPlatformDi();

