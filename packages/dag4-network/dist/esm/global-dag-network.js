import { BlockExplorerApi, blockExplorerApi } from './api/v1/block-explorer-api';
import { LoadBalancerApi, loadBalancerApi } from './api/v1/load-balancer-api';
import { DagNetwork } from './dag-network';
import { PeerNodeApi } from './api';
export class GlobalDagNetwork extends DagNetwork {
    constructor() {
        super(...arguments);
        this.loadBalancerApi = loadBalancerApi;
        this.blockExplorerApi = blockExplorerApi;
    }
    validatorNode(host) {
        return new PeerNodeApi(host);
    }
    blockExplorer(host) {
        return new BlockExplorerApi(host);
    }
    loadBalancer(host) {
        return new LoadBalancerApi(host);
    }
}
export const globalDagNetwork = new GlobalDagNetwork();
//# sourceMappingURL=global-dag-network.js.map