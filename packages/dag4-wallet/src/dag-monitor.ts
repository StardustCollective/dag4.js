import {crossPlatformDi} from '@stardust-collective/dag4-core';
import {blockExplorerApi, loadBalancerApi, Transaction} from '@stardust-collective/dag4-network';
import {Subject} from 'rxjs';
import {PendingTx} from '@stardust-collective/dag4-network/types';
import {dagNetwork} from '@stardust-collective/dag4-network';
import {CbTransaction} from '@stardust-collective/dag4-network/types/dto/cb-transaction';

const TWELVE_MINUTES = 12 * 60 * 1000;

type WalletParent = {
  getTransactions (limit?: number, searchAfter?: string): Promise<Transaction[]>;
  address: string;
}

type WaitFor = {
  promise: Promise<boolean>,
  resolve: (val: boolean) => void
}

export class DagMonitor {

  private memPoolChange$ = new Subject<DagWalletMonitorUpdate>();
  private lastTimer: number;
  private pendingTimer = 0;
  private waitForMap: { [hash:string]: WaitFor } = {};

  constructor (private walletParent: WalletParent) {
    this.cacheUtils.setPrefix('stargazer-');
  }

  observeMemPoolChange() {
    return this.memPoolChange$;
  }

  addToMemPoolMonitor (value: PendingTx | string) {

    const key =  `network-${dagNetwork.getNetwork().id}-mempool`;

    const payload: any[] = this.cacheUtils.get(key) || [];

    let tx = value as PendingTx;

    if (typeof value === 'string') {
      tx = { hash: value, timestamp: Date.now() } as PendingTx;
    }

    if (!payload.some(p => p.hash === tx.hash)) {

      payload.push(value);

      this.cacheUtils.set(key, payload);

      this.lastTimer = Date.now();
      this.pendingTimer = 1000;
    }

    setTimeout(() => this.pollPendingTxs(), 1000);
  }

  getMemPoolFromMonitor(): PendingTx[] {
    const key =  `network-${dagNetwork.getNetwork().id}-mempool`;

    const txs: PendingTx[]  = this.cacheUtils.get(key) || [];

    return txs.filter(tx => !this.walletParent.address || tx.receiver === this.walletParent.address || tx.sender === this.walletParent.address);
  }

  setToMemPoolMonitor(pool: PendingTx[]) {
    const key =  `network-${dagNetwork.getNetwork().id}-mempool`;

    this.cacheUtils.set(key, pool);
  }

  async waitForTransaction (hash: string) {
    if (!this.waitForMap[hash]) {
      const waitFor = {} as WaitFor;
      waitFor.promise = new Promise<boolean>(resolve => waitFor.resolve = resolve);
      this.waitForMap[hash] = waitFor;
    }

    return this.waitForMap[hash].promise;
  }

  private async pollPendingTxs () {

    if (Date.now() - this.lastTimer + 1000 < this.pendingTimer) {
      console.log('canceling extra timer');
      return; //ignore any repeat timers that happen before the min timer
    }

    const pool = this.getMemPoolFromMonitor();
    const transTxs: PendingTx[] = [];
    const nextPool: PendingTx[] = [];

    let pendingHasConfirmed = false;
    let txChanged = false;

    for (let index = 0; index < pool.length; index++) {
      const pendingTx = pool[index];
      const txHash = pendingTx.hash;

      let cbTx: CbTransaction;

      try {
        cbTx = await loadBalancerApi.getTransaction(txHash);
      } catch(e) {}

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
            pendingTx.status = 'CHECKPOINT_ACCEPTED'
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

        let beTx: Transaction;

        try {
          beTx = await blockExplorerApi.getTransaction(txHash);
        } catch(e) {}

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
          pendingTx.status = 'CONFIRMED'
          pendingTx.pendingMsg = 'Confirmed';

          if (this.waitForMap[txHash]) {
            this.waitForMap[txHash].resolve(true);
            this.waitForMap[txHash] = null;
          }

        } else {

          if (pendingTx.status !== 'CHECKPOINT_ACCEPTED' && pendingTx.status !== 'GLOBAL_STATE_PENDING' && pendingTx.timestamp + TWELVE_MINUTES > Date.now()) {
            //TX has been dropped
            pendingTx.status = 'DROPPED';
            pendingTx.pending = false;
            txChanged = true;
          }
          else {

            if (pendingTx.status !== 'GLOBAL_STATE_PENDING') {
              pendingTx.status = 'GLOBAL_STATE_PENDING'
              pendingTx.pendingMsg = 'Will confirm shortly...';
              txChanged = true;
            }
            else if (!pendingTx.status) {
              pendingTx.status = 'UNKNOWN'
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

    //Has any memPollTxs pending
    if (nextPool.length) {

      this.setToMemPoolMonitor(nextPool);
      this.pendingTimer = 10000;
      this.lastTimer = Date.now();
      setTimeout(() => this.pollPendingTxs(), 10000);
    }
    else if (pool.length > 0) {
      //NOTE: All tx in persisted pool have completed
      this.setToMemPoolMonitor([]);
    }

    this.memPoolChange$.next( {
      txChanged, transTxs, pendingHasConfirmed
    });

  }

  startMonitor () {
    this.pollPendingTxs();
  }

  private get cacheUtils() {
    return crossPlatformDi.getStateStorageDb();
  }
}

type NetworkInfo = {
  id: string;
}

export type DagWalletMonitorUpdate = {
  pendingHasConfirmed: boolean;
  transTxs: PendingTx[];
  txChanged: boolean;
}

// class MonitorPendingTx {
//   hash: string;
//   sender: string;
//   receiver: string;
//   amount: number;
//   ordinal: number;
//   pending = true;
//   pendingMsg: string;
// }
