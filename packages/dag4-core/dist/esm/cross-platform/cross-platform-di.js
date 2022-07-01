import { StateStorageDb } from './clients/state-storage-db';
import { MemoryStorageClient } from './clients/memory-storage-client';
// Cross Platform Dependency Injection
class CrossPlatformDi {
    constructor() {
        this.httpClientBaseUrl = '';
        //======================
        //= State Storage =
        //======================
        this.stateStorageDb = new StateStorageDb(new MemoryStorageClient());
    }
    // Register the platform implementation for http service requests
    registerHttpClient(client, baseUrl) {
        this.httpClient = client;
        this.httpClientBaseUrl = baseUrl || '';
    }
    getHttpClient() {
        return this.httpClient;
    }
    getHttpClientBaseUrl() {
        return this.httpClientBaseUrl;
    }
    useBrowserLocalStorage() {
        this.stateStorageDb.setClient(null);
    }
    registerStorageClient(client) {
        this.stateStorageDb.setClient(client);
    }
    getStateStorageDb() {
        return this.stateStorageDb;
    }
}
export const crossPlatformDi = new CrossPlatformDi();
//# sourceMappingURL=cross-platform-di.js.map