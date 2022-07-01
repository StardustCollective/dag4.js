import { RestApi } from '@stardust-collective/dag4-core';
import { PeerMetrics } from '../../dto/v1/peer-metrics';
export class PeerNodeApi {
    constructor(mHost = '') {
        this.mHost = mHost;
        this.service = new RestApi('');
    }
    //health ping
    async getHealth() {
        return this.service.$get('health');
    }
    async getMetrics() {
        const startTime = Date.now();
        //, null, { retry: 1 }
        return this.service.$get('metrics').then(rawData => PeerMetrics.parse(rawData.metrics, Date.now() - startTime));
    }
    //micrometer-metrics
    async getMicroMetrics() {
        return this.service.$get('micrometer-metrics');
    }
    async getTotalSupply() {
        return this.service.$get('total-supply');
    }
    async getAddressBalance(address) {
        return this.service.$get('/address/' + address);
    }
    async getAddressLastAcceptedTransactionRef(address) {
        return this.service.$get('/transaction/last-ref/' + address);
    }
    async postTransaction(tx) {
        return this.service.$post('/transaction', tx);
    }
    async checkTransaction(hash) {
        return this.service.$get('/transaction/' + hash);
    }
    getClusterInfo() {
        return this.service.$get('cluster/info').then(info => this.processClusterInfo(info));
    }
    set host(val) {
        if (!val.startsWith('http')) {
            val = 'http://' + val;
        }
        if (!val.includes(':', 8)) {
            val = val + ':9000/';
        }
        this.mHost = val;
        this.service.configure().baseUrl(val);
    }
    get host() {
        return this.mHost;
    }
    processClusterInfo(info) {
        return info && info.map(d => ({ alias: d.alias, walletId: d.id.hex, ip: d.ip.host, status: d.status, reputation: d.reputation }));
    }
}
export const peerNodeApi = new PeerNodeApi();
//# sourceMappingURL=peer-node-api.js.map