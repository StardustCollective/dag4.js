"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DagMonitor = void 0;
const dag4_core_1 = require("@stardust-collective/dag4-core");
const dag4_network_1 = require("@stardust-collective/dag4-network");
const rxjs_1 = require("rxjs");
const TWELVE_MINUTES = 12 * 60 * 1000;
class DagMonitor {
    walletParent;
    memPoolChange$ = new rxjs_1.Subject();
    lastTimer;
    pendingTimer = 0;
    waitForMap = {};
    constructor(walletParent) {
        this.walletParent = walletParent;
        this.cacheUtils.setPrefix('stargazer-');
    }
    observeMemPoolChange() {
        return this.memPoolChange$;
    }
    addToMemPoolMonitor(value) {
        const key = `network-${dag4_network_1.globalDagNetwork.getNetwork().id}-mempool`;
        const payload = this.cacheUtils.get(key) || [];
        let tx = value;
        if (typeof value === 'string') {
            tx = { hash: value, timestamp: Date.now() };
        }
        if (!payload.some(p => p.hash === tx.hash)) {
            payload.push(tx);
            this.cacheUtils.set(key, payload);
            this.lastTimer = Date.now();
            this.pendingTimer = 1000;
        }
        setTimeout(() => this.pollPendingTxs(), 1000);
        return this.transformPendingToTransaction(tx);
    }
    async getLatestTransactions(address, limit, searchAfter) {
        const cTxs = await dag4_network_1.globalDagNetwork.blockExplorerApi.getTransactionsByAddress(address, limit, searchAfter);
        const { pendingTxs } = await this.processPendingTxs();
        return pendingTxs.map(pending => this.transformPendingToTransaction(pending)).concat(cTxs);
    }
    getMemPoolFromMonitor(address) {
        address = address || this.walletParent.address;
        const txs = this.cacheUtils.get(`network-${dag4_network_1.globalDagNetwork.getNetwork().id}-mempool`) || [];
        return txs.filter(tx => !address || !tx.receiver || tx.receiver === address || tx.sender === address);
    }
    setToMemPoolMonitor(pool) {
        const key = `network-${dag4_network_1.globalDagNetwork.getNetwork().id}-mempool`;
        this.cacheUtils.set(key, pool);
    }
    async waitForTransaction(hash) {
        if (!this.waitForMap[hash]) {
            const waitFor = {};
            waitFor.promise = new Promise(resolve => waitFor.resolve = resolve);
            this.waitForMap[hash] = waitFor;
        }
        return this.waitForMap[hash].promise;
    }
    startMonitor() {
        this.pollPendingTxs();
    }
    transformPendingToTransaction(pending) {
        const { hash, amount, receiver, sender, timestamp, ordinal, fee, status } = pending;
        return { hash, amount, receiver, sender, fee, status, isDummy: false,
            timestamp: new Date(timestamp).toISOString(),
            lastTransactionRef: { ordinal, prevHash: '' },
            snapshotHash: '',
            checkpointBlock: '',
        };
    }
    async pollPendingTxs() {
        if (Date.now() - this.lastTimer + 1000 < this.pendingTimer) {
            console.log('canceling extra timer');
            return; //ignore any repeat timers that happen before the min timer
        }
        const { pendingTxs, txChanged, transTxs, pendingHasConfirmed, poolCount } = await this.processPendingTxs();
        //Has any memPollTxs pending
        if (pendingTxs.length) {
            this.setToMemPoolMonitor(pendingTxs);
            this.pendingTimer = 10000;
            this.lastTimer = Date.now();
            setTimeout(() => this.pollPendingTxs(), 10000);
        }
        else if (poolCount > 0) {
            //NOTE: All tx in persisted pool have completed
            this.setToMemPoolMonitor([]);
        }
        this.memPoolChange$.next({
            txChanged, transTxs, pendingHasConfirmed
        });
    }
    async processPendingTxs() {
        const pool = this.getMemPoolFromMonitor();
        const transTxs = [];
        const nextPool = [];
        let pendingHasConfirmed = false;
        let txChanged = false;
        for (let index = 0; index < pool.length; index++) {
            const pendingTx = pool[index];
            const txHash = pendingTx.hash;
            let cbTx;
            try {
                cbTx = await dag4_network_1.loadBalancerApi.getTransaction(txHash);
            }
            catch (e) { }
            if (cbTx) {
                if (!pendingTx.sender) {
                    const edge = cbTx.transaction.edge;
                    pendingTx.sender = edge.observationEdge.parents[0].hashReference;
                    pendingTx.receiver = edge.observationEdge.parents[1].hashReference;
                    pendingTx.amount = edge.data.amount;
                    pendingTx.fee = edge.data.fee;
                    pendingTx.ordinal = cbTx.transaction.lastTxRef.ordinal;
                }
                if (cbTx.cbBaseHash) {
                    if (pendingTx.status !== 'CHECKPOINT_ACCEPTED') {
                        txChanged = true;
                        pendingTx.status = 'CHECKPOINT_ACCEPTED';
                        pendingTx.pendingMsg = 'Accepted into check-point block...';
                    }
                }
                else if (pendingTx.status !== 'MEM_POOL') {
                    txChanged = true;
                    pendingTx.status = 'MEM_POOL';
                    pendingTx.pendingMsg = 'Accepted into mem-pool...';
                }
                pendingTx.timestamp = cbTx.rxTime;
                //pending-tx still waiting on Node
                nextPool.push(pendingTx);
            }
            else {
                let beTx;
                try {
                    beTx = await dag4_network_1.blockExplorerApi.getTransaction(txHash);
                }
                catch (e) { }
                if (beTx) {
                    //NOTE: not needed as it is already confirmed
                    // if (!pendingTx.sender) {
                    //   pendingTx.sender = beTx.sender;
                    //   pendingTx.receiver = beTx.receiver;
                    //   pendingTx.amount = beTx.amount;
                    //   pendingTx.fee = beTx.fee;
                    //   pendingTx.ordinal = beTx.lastTransactionRef.ordinal;
                    // }
                    pendingTx.timestamp = new Date(beTx.timestamp).valueOf();
                    pendingHasConfirmed = true;
                    txChanged = true;
                    pendingTx.pending = false;
                    pendingTx.status = 'CONFIRMED';
                    pendingTx.pendingMsg = 'Confirmed';
                    if (this.waitForMap[txHash]) {
                        this.waitForMap[txHash].resolve(true);
                        this.waitForMap[txHash] = null;
                    }
                }
                else {
                    if (pendingTx.status !== 'CHECKPOINT_ACCEPTED' && pendingTx.status !== 'GLOBAL_STATE_PENDING' && pendingTx.timestamp + TWELVE_MINUTES > Date.now()) {
                        //TX has been dropped
                        pendingTx.status = 'DROPPED';
                        pendingTx.pending = false;
                        txChanged = true;
                    }
                    else {
                        if (pendingTx.status !== 'GLOBAL_STATE_PENDING') {
                            pendingTx.status = 'GLOBAL_STATE_PENDING';
                            pendingTx.pendingMsg = 'Will confirm shortly...';
                            txChanged = true;
                        }
                        else if (!pendingTx.status) {
                            pendingTx.status = 'UNKNOWN';
                            pendingTx.pendingMsg = 'Transaction not found...';
                            txChanged = true;
                        }
                        //pending-tx transitioning from Node to BlockExplorer
                        nextPool.push(pendingTx);
                    }
                }
            }
            transTxs.push(pendingTx);
        }
        return { pendingTxs: nextPool, txChanged, transTxs, pendingHasConfirmed, poolCount: pool.length };
    }
    get cacheUtils() {
        return dag4_core_1.crossPlatformDi.getStateStorageDb();
    }
}
exports.DagMonitor = DagMonitor;
// class MonitorPendingTx {
//   hash: string;
//   sender: string;
//   receiver: string;
//   amount: number;
//   ordinal: number;
//   pending = true;
//   pendingMsg: string;
// }
//# sourceMappingURL=dag-monitor.js.map