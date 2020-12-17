import { IHttpClient } from './i-http-client';
import {IKeyValueDb} from './i-key-value-db';

const empty = () => {};

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
  //= Persistent Storage =
  //======================
  private keyValueDbClient: IKeyValueDb = { get: empty, set: empty, delete: empty };

  registerKeyValueDbClient (client: IKeyValueDb) {
    this.keyValueDbClient = client;
  }

  getKeyValueDbClient (): IKeyValueDb {
    return this.keyValueDbClient;
  }
}

export const crossPlatformDi = new CrossPlatformDi();

