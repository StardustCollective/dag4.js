import { RestApi } from './cross-platform/api/rest.api';
import { IHttpClient } from './cross-platform/i-http-client';
import { IKeyValueDb } from './cross-platform/i-key-value-db';
import { IStateStorageClient } from './cross-platform/clients/state-storage-db';
export declare class DagDi {
    createRestApi(baseUrl: string): RestApi;
    useFetchHttpClient(fetchClient?: any): void;
    useLocalStorageClient(storageClient?: any): void;
    registerHttpClient(client: IHttpClient, baseUrl?: string): void;
    registerStorageClient(client: IStateStorageClient): void;
    getStateStorageDb(): IKeyValueDb;
}
export declare const dagDi: DagDi;
