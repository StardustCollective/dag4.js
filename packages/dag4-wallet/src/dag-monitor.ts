import {crossPlatformDi, arrayUtils} from '@stardust-collective/dag4-core';
import {blockExplorerApi, loadBalancerApi, Transaction} from '@stardust-collective/dag4-network';
import {Subject} from 'rxjs';
import {PendingTx} from '@stardust-collective/dag4-network/types';
import {dagNetwork} from '@stardust-collective/dag4-network';

type WalletParent = {
  getTransactions (limit?: number, searchAfter?: string): Promise<Transaction[]>;
  address: string;
}

export class DagMonitor {

  private memPoolChange$ = new Subject<DagWalletMonitorUpdate>();
  private pollPendingTxsId: any;
  private txsCache: Transaction[];

  constructor (private walletParent: WalletParent) {}

  observeMemPoolChange() {
    return this.memPoolChange$;
  }

  addToMemPoolMonitor (value: PendingTx) {

    const key =  `network-${dagNetwork.getNetwork().id}-mempool`;

    const payload: any[] = this.cacheUtils.get(key) || [];

    payload.push(value);

    this.cacheUtils.set(key, payload);

    // const pool = this.getMemPoolFromMonitor();
    //
    // this.memPoolChange$.next( {
    //   txChanged: true, transTxs: pool, pendingHasConfirmed: true
    // });

    setTimeout(() => this.pollPendingTxs(), 1000);
  }

  getMemPoolFromMonitor(): PendingTx[] {
    const key =  `network-${dagNetwork.getNetwork().id}-mempool`;

    const txs: PendingTx[]  = this.cacheUtils.get(key) || [];

    return txs.filter(tx => tx.receiver === this.walletParent.address || tx.sender === this.walletParent.address);
  }

  setToMemPoolMonitor(pool: PendingTx[]) {
    const key =  `network-${dagNetwork.getNetwork().id}-mempool`;

    this.cacheUtils.set(key, pool);
  }

  async pollPendingTxs () {

    const txHistoryList = await this.getTransactionHistoryFromExplorer();
    const pool = this.getMemPoolFromMonitor();
    const transTxs: Transaction[] = [];
    const nextPool: PendingTx[] = [];

    let pendingHasConfirmed = false;
    let txChanged = false;

    for (let index = 0; index < pool.length; index++) {
      const pendingTx = pool[index];
      const txHash = pendingTx.hash;
      const txHistoryListItem = txHistoryList && arrayUtils.findItemByFieldValue(txHistoryList, 'hash', txHash);

      if (!txHistoryListItem || txHistoryListItem.pending) {

        nextPool.push(pendingTx);

        let mTx: Transaction;

        try {
          mTx = await loadBalancerApi.checkTransaction(txHash);
        } catch(e) {}

        if (mTx) {
          //if memPollTx already in history we do nothing
          if (!txHistoryListItem) {
            mTx = {...mTx, ...pendingTx} as any;
            mTx.pending = true;
            mTx.pendingMsg = 'Pending...';
          }
        } else {

          try {
            mTx = await blockExplorerApi.getTransaction(txHash);
          } catch(e) {}

          if (mTx) {
            mTx = txHistoryListItem || mTx;
            mTx.pending = false;
            mTx.pendingMsg = 'Confirmed';
            pendingHasConfirmed = true;
            txChanged = true;
          } else {
            mTx = txHistoryListItem || ({ ...pendingTx } as any);
            //will be confirmed shortly
            mTx.pendingMsg = 'Will confirm shortly...';
            txChanged = true;
          }
        }

        if (!txHistoryListItem) {
          transTxs.push(mTx);
        }
      }
      else {
        if (!txHistoryListItem) {
          txChanged = true;
          pendingHasConfirmed = true;
          txHistoryListItem.pending = false;
          txHistoryListItem.pendingMsg = 'Confirmed';
          transTxs.push(txHistoryListItem);
        }
      }
    }

    //Has any memPollTxs pending
    if (nextPool.length) {

      //Is one or more memPollTx no longer pending. Happens after a resync or page load.
      if (pool.length > nextPool.length) {
        this.setToMemPoolMonitor(nextPool);
      }

      //As long as no memPollTx have been confirmed in this cycle, poll as usual
      if (!pendingHasConfirmed) {
        this.pollPendingTxsId = setTimeout(() => this.pollPendingTxs(), 10000) as any;
      }
    }
    else if (pool.length > 0) {
      //NOTE: All tx in persisted pool have completed
      this.setToMemPoolMonitor(nextPool);
    }

    this.memPoolChange$.next( {
      txChanged, transTxs, pendingHasConfirmed
    });

  }

  startMonitor () {
    this.pollPendingTxs();
  }

  private get cacheUtils() {
    return crossPlatformDi.getKeyValueDbClient();
  }

  private async getTransactionHistoryFromExplorer () {
    if (!this.txsCache) {
      this.txsCache = await this.walletParent.getTransactions(5);
    }

    return this.txsCache;
  }
}

type NetworkInfo = {
  id: string;
}

export type DagWalletMonitorUpdate = {
  pendingHasConfirmed: boolean;
  transTxs: Transaction[];
  txChanged: boolean;
}
