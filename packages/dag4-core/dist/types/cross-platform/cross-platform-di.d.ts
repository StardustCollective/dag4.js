import { IHttpClient } from './i-http-client';
import { IKeyValueDb } from './i-key-value-db';
import { IStateStorageClient } from './clients/state-storage-db';
declare class CrossPlatformDi {
    private httpClient;
    private httpClientBaseUrl;
    registerHttpClient(client: IHttpClient, baseUrl?: string): void;
    getHttpClient(): IHttpClient;
    getHttpClientBaseUrl(): string;
    private stateStorageDb;
    useBrowserLocalStorage(): void;
    registerStorageClient(client: IStateStorageClient): void;
    getStateStorageDb(): IKeyValueDb;
}
export declare const crossPlatformDi: CrossPlatformDi;
export {};
