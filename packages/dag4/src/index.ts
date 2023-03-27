import fetch from "cross-fetch";
import {
  arrayUtils,
  dagDi,
  IHttpClient as _IHttpClient,
  IKeyValueDb as _IKeyValueDb,
  RestApi as _RestApi,
  RestApiOptionsRequest as _RestApiOptionsRequest,
} from "@stardust-collective/dag4-core";
import {
  globalDagNetwork,
  Snapshot as _Snapshot,
  Transaction as _Transaction,
  PendingTx as _PendingTx,
  NetworkInfo as _NetworkInfo,
  MetagraphNetworkInfo as _MetagraphNetworkInfo,
  MetagraphNetworkInfo,
} from "@stardust-collective/dag4-network";
import {
  keyStore,
  HDKey as _HDKey,
  DERIVATION_PATH as _DERIVATION_PATH,
} from "@stardust-collective/dag4-keystore";
import {
  MetagraphTokenClient,
  DagAccount,
  DagMonitor,
} from "@stardust-collective/dag4-wallet";

export namespace Dag4Types {
  export type HDKey = _HDKey;
  export type DERIVATION_PATH = _DERIVATION_PATH;
  export type RestApi = _RestApi;
  export type IKeyValueDb = _IKeyValueDb;
  export type IHttpClient = _IHttpClient;
  export type Transaction = _Transaction;
  export type PendingTx = _PendingTx;
  export type NetworkInfo = _NetworkInfo;
  export type MetagraphNetworkInfo = _MetagraphNetworkInfo;
  export type Snapshot = _Snapshot;
  export type RestApiOptionsRequest = _RestApiOptionsRequest;
}

class Dag4Packages {
  private account: DagAccount;
  private monitor: DagMonitor;

  createAccount(privateKey?: string) {
    const account = new DagAccount(globalDagNetwork);

    if (privateKey) {
      account.loginPrivateKey(privateKey);
    }

    return account;
  }

  createMetagraphTokenClient(
    account: DagAccount,
    networkInfo: MetagraphNetworkInfo
  ) {
    return new MetagraphTokenClient(account, networkInfo);
  }

  createOrGetGlobalAccount() {
    if (!this.account) {
      this.account = new DagAccount(globalDagNetwork);
    }
    return this.account;
  }

  createOrGetGlobalMonitor() {
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
  createAccount(privateKey?: string) {
    return dag4Packages.createAccount(privateKey);
  },
  createMetagraphTokenClient(
    account: DagAccount,
    networkInfo: MetagraphNetworkInfo
  ) {
    return dag4Packages.createMetagraphTokenClient(account, networkInfo);
  },
  get account() {
    return dag4Packages.createOrGetGlobalAccount();
  },
  get monitor() {
    return dag4Packages.createOrGetGlobalMonitor();
  },
  config: (config: Dag4Config) => {
    dagDi.getStateStorageDb().setPrefix(config.appId);
    globalDagNetwork.config(config.network);
  },
  network: globalDagNetwork,
  arrayUtils,
};

type Dag4Config = {
  appId: string;
  network: Dag4Types.NetworkInfo;
};

// default config
dag4.di.useFetchHttpClient(fetch);
