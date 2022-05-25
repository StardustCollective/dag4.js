
import {BlockExplorerApi, blockExplorerApi} from './api/v1/block-explorer-api';
import {LoadBalancerApi, loadBalancerApi} from './api/v1/load-balancer-api';
import {DagNetwork} from './dag-network';
import {PeerNodeApi} from './api';

export class GlobalDagNetwork extends DagNetwork {

  loadBalancerApi = loadBalancerApi;
  blockExplorerApi = blockExplorerApi;

  validatorNode (host: string) {
    return new PeerNodeApi(host);
  }

  blockExplorer (host: string) {
    return new BlockExplorerApi(host);
  }

  loadBalancer (host: string) {
    return new LoadBalancerApi(host);
  }
}

export const globalDagNetwork = new GlobalDagNetwork();


