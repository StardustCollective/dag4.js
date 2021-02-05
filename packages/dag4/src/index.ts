import {
  arrayUtils,
  dagDi,
  IHttpClient as _IHttpClient,
  IKeyValueDb as _IKeyValueDb,
  RestApi as _RestApi,
  RestApiOptionsRequest as _RestApiOptionsRequest
} from '@stardust-collective/dag4-core';
import {dagNetwork, Transaction as _Transaction} from '@stardust-collective/dag4-network';
import {keyStore, HDKey as _HDKey} from '@stardust-collective/dag4-keystore';
import {PendingTx as _PendingTx, NetworkInfo as _NetworkInfo} from '@stardust-collective/dag4-network/types';
import {DagAccount, DagMonitor} from '@stardust-collective/dag4-wallet';


export namespace DagTypes {
  export type HDKey = _HDKey;
  export type RestApi = _RestApi;
  export type IKeyValueDb = _IKeyValueDb;
  export type IHttpClient = _IHttpClient;
  export type Transaction = _Transaction;
  export type PendingTx = _PendingTx;
  export type NetworkInfo = _NetworkInfo;
  export type RestApiOptionsRequest = _RestApiOptionsRequest;
}

const account = new DagAccount();
const monitor = new DagMonitor(account);

export const dag = {
  keyStore,
  di: dagDi,
  account,
  monitor,
  network: dagNetwork,
  arrayUtils
}
