import {RestApi} from './cross-platform/api/rest.api';
import {IHttpClient} from './cross-platform/i-http-client';
import {crossPlatformDi} from './cross-platform/cross-platform-di';
import {IKeyValueDb} from './cross-platform/i-key-value-db';

export enum DagDiLibrary {
  ACCOUNT,
  NETWORK,
  KEYSTORE
}

type ObjectMap = {
  [key: string]: any
}

export class DagDi {

  private packages = [];
  private singletons = [];

  registerPackage(name: DagDiLibrary, diLib: any) {
    this.packages[name.valueOf()] = diLib;
  }

  createRestApi(baseUrl: string) {
    return new RestApi(baseUrl);
  }

  createAccountInstance(initObj?: ObjectMap) {
    this.checkLibrary('account', DagDiLibrary.ACCOUNT);

    const diLib = this.packages[DagDiLibrary.ACCOUNT];

    if (initObj) {
      diLib.init(initObj);
    }

    return diLib;
  }

  createNetwork() {
    this.checkLibrary('network', DagDiLibrary.NETWORK);

    return this.getOrCreateSingleton(DagDiLibrary.NETWORK);
  }

  createKeystore() {
    this.checkLibrary('keystore', DagDiLibrary.KEYSTORE);

    return this.getOrCreateSingleton(DagDiLibrary.KEYSTORE);
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

  private getOrCreateSingleton (lib: DagDiLibrary) {
    let instance = this.singletons[lib];

    if (instance) {
      return instance;
    }

    const diLib = this.packages[lib];

    instance = new diLib();

    this.singletons[lib] = instance;

    return instance;
  }

  private checkLibrary(name: string, index: number) {
    if (!this.packages[index]) {
      throw new Error('Missing dependency injection for library "dag4-' + name + '"');
    }
  }
}

export const dagDi = new DagDi();

