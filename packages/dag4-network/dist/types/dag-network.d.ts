import { Subject } from 'rxjs';
import { NetworkInfo } from './types/network-info';
import { LoadBalancerApi } from './api/v1/load-balancer-api';
import { BlockExplorerApi } from './api/v1/block-explorer-api';
import { L0Api } from './api/v2/l0-api';
import { L1Api } from './api/v2/l1-api';
import { BlockExplorerV2Api } from './api/v2/block-explorer-api';
import { PostTransactionV2 } from './dto/v2';
import { PostTransaction } from './dto/v1';
export declare class DagNetwork {
    private connectedNetwork;
    private networkChange$;
    loadBalancerApi: LoadBalancerApi;
    blockExplorerApi: BlockExplorerApi;
    blockExplorerV2Api: BlockExplorerV2Api;
    l0Api: L0Api;
    l1Api: L1Api;
    constructor(netInfo?: NetworkInfo);
    config(netInfo?: NetworkInfo): NetworkInfo;
    observeNetworkChange(): Subject<NetworkInfo>;
    setNetwork(netInfo: NetworkInfo): void;
    getNetwork(): NetworkInfo;
    getNetworkVersion(): string;
    getAddressBalance(address: string): Promise<import("./dto/v1").AddressBalance | import("./dto/v2").L0AddressBalance>;
    getAddressLastAcceptedTransactionRef(address: string): Promise<import("./dto/v1").AddressLastAcceptedTransaction | import("./dto/v2").TransactionReference>;
    getPendingTransaction(hash: string | null): Promise<import("./dto/v1").CbTransaction>;
    postTransaction(tx: PostTransaction | PostTransactionV2): Promise<string>;
}
