import {RestApi} from './cross-platform/api/rest.api';
import {IHttpClient} from './cross-platform/i-http-client';
import {crossPlatformDi} from './cross-platform/cross-platform-di';
import {IKeyValueDb} from './cross-platform/i-key-value-db';


export class DagDi {

  createRestApi(baseUrl: string) {
    return new RestApi(baseUrl);
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

