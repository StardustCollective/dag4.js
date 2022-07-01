import { BlockExplorerApi, LoadBalancerApi } from "../api";
import { globalDagNetwork } from "../global-dag-network";
export class DefaultDagWeb3Provider {
    constructor(netInfo) {
        this.loadBalancerApi = new LoadBalancerApi();
        this.blockExplorerApi = new BlockExplorerApi();
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
                this.loadBalancerApi = new LoadBalancerApi();
                this.blockExplorerApi = new BlockExplorerApi();
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
        return this.loadBalancerApi || globalDagNetwork.loadBalancerApi;
    }
    getBlockExplorerApi() {
        return this.blockExplorerApi || globalDagNetwork.blockExplorerApi;
    }
}
//# sourceMappingURL=default-dag-web3-provider.js.map