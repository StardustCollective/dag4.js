"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultDagWeb3Provider = void 0;
const api_1 = require("../api");
const global_dag_network_1 = require("../global-dag-network");
class DefaultDagWeb3Provider {
    loadBalancerApi = new api_1.LoadBalancerApi();
    blockExplorerApi = new api_1.BlockExplorerApi();
    connectedNetwork;
    constructor(netInfo) {
        if (netInfo) {
            this.setNetwork(netInfo);
        }
    }
    config(netInfo) {
        if (netInfo) {
            this.setNetwork(netInfo);
        }
        else {
            return this.connectedNetwork;
        }
    }
    setNetwork(netInfo) {
        if (this.connectedNetwork !== netInfo) {
            this.connectedNetwork = netInfo;
            if (!this.blockExplorerApi) {
                this.loadBalancerApi = new api_1.LoadBalancerApi();
                this.blockExplorerApi = new api_1.BlockExplorerApi();
            }
            this.blockExplorerApi.config().baseUrl(netInfo.beUrl);
            this.loadBalancerApi.config().baseUrl(netInfo.lbUrl);
        }
    }
    async getBalance(address) {
        const balObj = await this.getLoadBalancerApi().getAddressBalance(address);
        return balObj.balance;
    }
    async getTransactionCount(address) {
        const balObj = await this.getLoadBalancerApi().getAddressLastAcceptedTransactionRef(address);
        return balObj.ordinal;
    }
    async getTransactionHistory(address, limit = 100) {
        return this.getBlockExplorerApi().getTransactionsByAddress(address, limit);
    }
    async getTokenTransactionHistory(address, limit = 100) {
        return [];
    }
    async getTokenAddressBalances(addresses, tokenContractAddress) {
        return {};
    }
    getLoadBalancerApi() {
        return this.loadBalancerApi || global_dag_network_1.globalDagNetwork.loadBalancerApi;
    }
    getBlockExplorerApi() {
        return this.blockExplorerApi || global_dag_network_1.globalDagNetwork.blockExplorerApi;
    }
}
exports.DefaultDagWeb3Provider = DefaultDagWeb3Provider;
//# sourceMappingURL=default-dag-web3-provider.js.map