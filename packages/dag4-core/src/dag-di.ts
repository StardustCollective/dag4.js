import {RestApi} from './cross-platform/api/rest.api';
import {IHttpClient} from './cross-platform/i-http-client';
import {crossPlatformDi} from './cross-platform/cross-platform-di';
import {IKeyValueDb} from './cross-platform/i-key-value-db';
import {FetchRestService} from './cross-platform/clients/fetch.http';
import {IStateStorageClient} from './cross-platform/clients/state-storage-db';


export class DagDi {

  createRestApi(baseUrl: string) {
    return new RestApi(baseUrl);
  }

  useFetchHttpClient(fetchClient?) {
    this.registerHttpClient(new FetchRestService(fetchClient));
  }

  useLocalStorageClient(storageClient?) {
    crossPlatformDi.registerStorageClient(storageClient);
  }

  registerHttpClient (client: IHttpClient, baseUrl?: string) {
    crossPlatformDi.registerHttpClient(client, baseUrl);
  }

  registerStorageClient (client: IStateStorageClient) {
    crossPlatformDi.registerStorageClient(client);
  }

  getStateStorageDb(): IKeyValueDb {
    return crossPlatformDi.getStateStorageDb();
  }
}

export const dagDi = new DagDi();
