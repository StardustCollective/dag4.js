"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalDagNetwork = exports.GlobalDagNetwork = void 0;
const block_explorer_api_1 = require("./api/v1/block-explorer-api");
const load_balancer_api_1 = require("./api/v1/load-balancer-api");
const dag_network_1 = require("./dag-network");
const api_1 = require("./api");
class GlobalDagNetwork extends dag_network_1.DagNetwork {
    loadBalancerApi = load_balancer_api_1.loadBalancerApi;
    blockExplorerApi = block_explorer_api_1.blockExplorerApi;
    validatorNode(host) {
        return new api_1.PeerNodeApi(host);
    }
    blockExplorer(host) {
        return new block_explorer_api_1.BlockExplorerApi(host);
    }
    loadBalancer(host) {
        return new load_balancer_api_1.LoadBalancerApi(host);
    }
}
exports.GlobalDagNetwork = GlobalDagNetwork;
exports.globalDagNetwork = new GlobalDagNetwork();
//# sourceMappingURL=global-dag-network.js.map