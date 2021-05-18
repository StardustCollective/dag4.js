import {
  arrayUtils,
  dagDi,
  IHttpClient as _IHttpClient,
  IKeyValueDb as _IKeyValueDb,
  RestApi as _RestApi,
  RestApiOptionsRequest as _RestApiOptionsRequest
} from '@stardust-collective/dag4-core';
import {dagNetwork, Snapshot as _Snapshot, Transaction as _Transaction} from '@stardust-collective/dag4-network';
import {keyStore, HDKey as _HDKey, DERIVATION_PATH as _DERIVATION_PATH} from '@stardust-collective/dag4-keystore';
import {PendingTx as _PendingTx, NetworkInfo as _NetworkInfo} from '@stardust-collective/dag4-network/types';
import {DagAccount, DagMonitor} from '@stardust-collective/dag4-wallet';
import {globalDagNetwork} from '@stardust-collective/dag4-network';


export namespace Dag4Types {
  export type HDKey = _HDKey;
  export type DERIVATION_PATH = _DERIVATION_PATH;
  export type RestApi = _RestApi;
  export type IKeyValueDb = _IKeyValueDb;
  export type IHttpClient = _IHttpClient;
  export type Transaction = _Transaction;
  export type PendingTx = _PendingTx;
  export type NetworkInfo = _NetworkInfo;
  export type Snapshot = _Snapshot;
  export type RestApiOptionsRequest = _RestApiOptionsRequest;
}

class Dag4Packages {
  private account: DagAccount;
  private monitor: DagMonitor;

  createAccount (privateKey?: string) {

    const account =  new DagAccount();

    if (privateKey) {
      account.loginPrivateKey(privateKey);
    }

    return account;
  }

  createOrGetGlobalAccount () {
    if (!this.account) {
      this.account = new DagAccount();
    }
    return this.account;
  }

  createOrGetGlobalMonitor () {
    if (!this.monitor) {
      this.monitor = new DagMonitor(this.createOrGetGlobalAccount());
    }
    return this.monitor;
  }
}

const dag4Packages = new Dag4Packages();

export const dag4 = {
  keyStore,
  di: dagDi,
  createAccount (privateKey?: string) {
    return dag4Packages.createAccount(privateKey);
  },
  get account () {
    return dag4Packages.createOrGetGlobalAccount();
  },
  get monitor () {
    return dag4Packages.createOrGetGlobalMonitor();
  },
  config: (config: Dag4Config) => {
    dagDi.getStateStorageDb().setPrefix(config.appId);
    dagNetwork.config(config.network);
  },
  network: globalDagNetwork,
  arrayUtils
}

type Dag4Config = {
  appId: string;
  network: Dag4Types.NetworkInfo
}

// dag4.config({
//   appId: 'stargazer',
//   network: {
//     id: 'main',
//     beUrl: '',
//     lbUrl: ''
//   }
// })

//
