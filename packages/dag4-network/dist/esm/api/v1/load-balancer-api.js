import { RestApi } from '@stardust-collective/dag4-core';
import { DNC } from '../../DNC';
import { PeerMetrics } from '../../dto/v1/peer-metrics';
export class LoadBalancerApi {
    constructor(host) {
        this.service = new RestApi(DNC.LOAD_BALANCER_URL);
        if (host) {
            this.config().baseUrl(host);
        }
    }
    config() {
        return this.service.configure();
    }
    async getMetrics() {
        return this.service.$get('/metrics').then(rawData => PeerMetrics.parse(rawData.metrics, 0));
    }
    async getAddressBalance(address) {
        return this.service.$get('/address/' + address);
    }
    async getAddressLastAcceptedTransactionRef(address) {
        return this.service.$get('/transaction/last-ref/' + address);
    }
    async getTotalSupply() {
        return this.service.$get('/total-supply');
    }
    async postTransaction(tx) {
        return this.service.$post('/transaction', tx);
    }
    async getTransaction(hash) {
        return this.service.$get('/transaction/' + hash);
    }
    async checkTransactionStatus(hash) {
        const tx = await this.service.$get('/transaction/' + hash);
        if (tx) {
            if (tx.cbBaseHash) {
                return { accepted: true, inMemPool: false };
            }
            return { accepted: false, inMemPool: true };
        }
        return null;
    }
    async getClusterInfo() {
        return this.service.$get('/cluster/info').then(info => this.processClusterInfo(info));
    }
    async getClusterInfoWithRetry() {
        return this.service.$get('/cluster/info', null, { retry: 5 }).then(info => this.retryClusterInfo(info));
    }
    //Returns number of connected Nodes in Cluster
    async activeNodeCount() {
        return this.service.$get('/utils/health');
    }
    retryClusterInfo(info) {
        if (info && info.map) {
            return this.processClusterInfo(info);
        }
        else {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve(this.getClusterInfoWithRetry());
                }, 1000);
            });
        }
    }
    processClusterInfo(info) {
        return info && info.map && info.map(d => ({ alias: d.alias, walletId: d.id.hex, ip: d.ip.host, status: d.status, reputation: d.reputation }));
    }
}
export const loadBalancerApi = new LoadBalancerApi();
//# sourceMappingURL=load-balancer-api.js.map