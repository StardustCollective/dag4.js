import {arrayUtils, DagDi, RestApi as _RestApi, RestApiOptionsRequest as _RestApiOptionsRequest} from '@stardust-collective/dag4-core';
import {DagNetwork, Transaction as _Transaction} from '@stardust-collective/dag4-network';
import {keyStore} from '@stardust-collective/dag4-keystore';
import {PendingTx as _PendingTx, NetworkInfo as _NetworkInfo} from '@stardust-collective/dag4-network/types';
import {DagAccount} from './dag-account';

export namespace DagTypes {
  export type RestApi = _RestApi;
  export type Transaction = _Transaction;
  export type PendingTx = _PendingTx;
  export type NetworkInfo = _NetworkInfo;
  export type RestApiOptionsRequest = _RestApiOptionsRequest;
}

const account = new DagAccount();

export const dag = {
  keyStore,
  di: new DagDi(),
  account,
  network: new DagNetwork(),
  utils: arrayUtils
}
