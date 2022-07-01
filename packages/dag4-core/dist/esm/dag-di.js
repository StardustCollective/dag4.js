import { RestApi } from './cross-platform/api/rest.api';
import { crossPlatformDi } from './cross-platform/cross-platform-di';
import { FetchRestService } from './cross-platform/clients/fetch.http';
export class DagDi {
    createRestApi(baseUrl) {
        return new RestApi(baseUrl);
    }
    useFetchHttpClient(fetchClient) {
        this.registerHttpClient(new FetchRestService(fetchClient));
    }
    useLocalStorageClient(storageClient) {
        crossPlatformDi.registerStorageClient(storageClient);
    }
    registerHttpClient(client, baseUrl) {
        crossPlatformDi.registerHttpClient(client, baseUrl);
    }
    registerStorageClient(client) {
        crossPlatformDi.registerStorageClient(client);
    }
    getStateStorageDb() {
        return crossPlatformDi.getStateStorageDb();
    }
}
export const dagDi = new DagDi();
//# sourceMappingURL=dag-di.js.map