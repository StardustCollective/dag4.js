import { BlockExplorerApi } from './api/v1/block-explorer-api';
import { LoadBalancerApi } from './api/v1/load-balancer-api';
import { DagNetwork } from './dag-network';
import { PeerNodeApi } from './api';
export declare class GlobalDagNetwork extends DagNetwork {
    loadBalancerApi: LoadBalancerApi;
    blockExplorerApi: BlockExplorerApi;
    validatorNode(host: string): PeerNodeApi;
    blockExplorer(host: string): BlockExplorerApi;
    loadBalancer(host: string): LoadBalancerApi;
}
export declare const globalDagNetwork: GlobalDagNetwork;
