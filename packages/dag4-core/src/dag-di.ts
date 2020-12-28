import {RestApi} from './cross-platform/api/rest.api';
import {IHttpClient} from './cross-platform/i-http-client';
import {crossPlatformDi} from './cross-platform/cross-platform-di';
import {IKeyValueDb} from './cross-platform/i-key-value-db';
import {FetchRestService} from './cross-platform/clients/fetch.http';
import {LocalStorageDb} from './cross-platform/clients/local-storage-db';


export class DagDi {

  createRestApi(baseUrl: string) {
    return new RestApi(baseUrl);
  }

  useFetchHttpClient(fetchClient?) {
    this.registerHttpClient(new FetchRestService(fetchClient));
  }

  useLocalStorageClient(storageClient?) {
    this.registerKeyValueDbClient(new LocalStorageDb(storageClient));
  }

  registerHttpClient (client: IHttpClient, baseUrl?: string) {
    crossPlatformDi.registerHttpClient(client, baseUrl);
  }

  registerKeyValueDbClient (client: IKeyValueDb) {
    crossPlatformDi.registerKeyValueDbClient(client);
  }

  getKeyValueDbClient(): IKeyValueDb {
    return crossPlatformDi.getKeyValueDbClient();
  }
}

export const dagDi = new DagDi();
