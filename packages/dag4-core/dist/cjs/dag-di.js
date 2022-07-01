"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dagDi = exports.DagDi = void 0;
const rest_api_1 = require("./cross-platform/api/rest.api");
const cross_platform_di_1 = require("./cross-platform/cross-platform-di");
const fetch_http_1 = require("./cross-platform/clients/fetch.http");
class DagDi {
    createRestApi(baseUrl) {
        return new rest_api_1.RestApi(baseUrl);
    }
    useFetchHttpClient(fetchClient) {
        this.registerHttpClient(new fetch_http_1.FetchRestService(fetchClient));
    }
    useLocalStorageClient(storageClient) {
        cross_platform_di_1.crossPlatformDi.registerStorageClient(storageClient);
    }
    registerHttpClient(client, baseUrl) {
        cross_platform_di_1.crossPlatformDi.registerHttpClient(client, baseUrl);
    }
    registerStorageClient(client) {
        cross_platform_di_1.crossPlatformDi.registerStorageClient(client);
    }
    getStateStorageDb() {
        return cross_platform_di_1.crossPlatformDi.getStateStorageDb();
    }
}
exports.DagDi = DagDi;
exports.dagDi = new DagDi();
//# sourceMappingURL=dag-di.js.map