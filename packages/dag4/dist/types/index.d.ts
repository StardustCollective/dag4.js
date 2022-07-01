import { IHttpClient as _IHttpClient, IKeyValueDb as _IKeyValueDb, RestApi as _RestApi, RestApiOptionsRequest as _RestApiOptionsRequest } from '@stardust-collective/dag4-core';
import { Snapshot as _Snapshot, Transaction as _Transaction, PendingTx as _PendingTx, NetworkInfo as _NetworkInfo } from '@stardust-collective/dag4-network';
import { HDKey as _HDKey, DERIVATION_PATH as _DERIVATION_PATH } from '@stardust-collective/dag4-keystore';
import { DagAccount, DagMonitor } from '@stardust-collective/dag4-wallet';
export declare namespace Dag4Types {
    type HDKey = _HDKey;
    type DERIVATION_PATH = _DERIVATION_PATH;
    type RestApi = _RestApi;
    type IKeyValueDb = _IKeyValueDb;
    type IHttpClient = _IHttpClient;
    type Transaction = _Transaction;
    type PendingTx = _PendingTx;
    type NetworkInfo = _NetworkInfo;
    type Snapshot = _Snapshot;
    type RestApiOptionsRequest = _RestApiOptionsRequest;
}
export declare const dag4: {
    keyStore: import("@stardust-collective/dag4-keystore").KeyStore;
    di: import("@stardust-collective/dag4-core").DagDi;
    createAccount(privateKey?: string): DagAccount;
    readonly account: DagAccount;
    readonly monitor: DagMonitor;
    config: (config: Dag4Config) => void;
    network: import("@stardust-collective/dag4-network").GlobalDagNetwork;
    arrayUtils: import("@stardust-collective/dag4-core").ArrayUtils;
};
declare type Dag4Config = {
    appId: string;
    network: Dag4Types.NetworkInfo;
};
export {};
