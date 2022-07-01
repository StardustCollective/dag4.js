"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.crossPlatformDi = void 0;
const state_storage_db_1 = require("./clients/state-storage-db");
const memory_storage_client_1 = require("./clients/memory-storage-client");
// Cross Platform Dependency Injection
class CrossPlatformDi {
    //======================
    //   = HTTP Client =
    //======================
    httpClient;
    httpClientBaseUrl = '';
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
    //======================
    //= State Storage =
    //======================
    stateStorageDb = new state_storage_db_1.StateStorageDb(new memory_storage_client_1.MemoryStorageClient());
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
exports.crossPlatformDi = new CrossPlatformDi();
//# sourceMappingURL=cross-platform-di.js.map