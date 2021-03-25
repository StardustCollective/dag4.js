import {keyStore, KeyTrio} from '@stardust-collective/dag4-keystore';
import {Subject} from 'rxjs';

import {loadBalancerApi, blockExplorerApi} from '@stardust-collective/dag4-network';
import {PendingTx} from '@stardust-collective/dag4-network/types';
import {BigNumber} from 'bignumber.js';

export class DagAccount {

  private m_keyTrio: KeyTrio;

  private sessionChange$ = new Subject<boolean>();

  constructor() {

  }

  get address () {
    return this.m_keyTrio && this.m_keyTrio.address;
  }

  get keyTrio () {
    return this.m_keyTrio;
  }

  loginSeedPhrase (words: string) {
    const privateKey = keyStore.getPrivateKeyFromMnemonic(words);

    this.loginPrivateKey(privateKey);
  }

  loginPrivateKey (privateKey: string) {
    const publicKey = keyStore.getPublicKeyFromPrivate(privateKey);
    const address = keyStore.getDagAddressFromPublicKey(publicKey);

    this.setKeysAndAddress(privateKey, publicKey, address);
  }

  isActive () {
    return !!this.m_keyTrio;
  }

  logout () {
    this.m_keyTrio = null;
    this.sessionChange$.next(true);
  }

  observeSessionChange() {
    return this.sessionChange$;
  }

  setKeysAndAddress (privateKey: string, publicKey: string, address: string) {
    this.m_keyTrio = new KeyTrio(privateKey, publicKey, address);
    this.sessionChange$.next(true);
  }

  getTransactions (limit?: number, searchAfter?: string) {
    return blockExplorerApi.getTransactionsByAddress(this.address, limit, searchAfter);
  }

  validateDagAddress (address: string) {
    return keyStore.validateDagAddress(address)
  }

  async getBalance () {

    let result = 0;

    if (this.address) {

      const addressObj = await loadBalancerApi.getAddressBalance(this.address);

      if (addressObj && !isNaN(addressObj.balance)) {
        result = new  BigNumber(addressObj.balance).dividedBy(1e8).toNumber();
      }
    }

    return result;
  }

  async getFeeRecommendation () {

    //Get last tx ref
    const lastRef = await loadBalancerApi.getAddressLastAcceptedTransactionRef(this.address);
    if (!lastRef.prevHash) {
      return 0;
    }

    //Check for pending TX
    const lastTx = await loadBalancerApi.getTransaction(lastRef.prevHash);
    if (!lastTx) {
      return 0;
    }

    return 1 / 1e8;
  }

  async generateSignedTransaction (toAddress: string, amount: number, fee = 0) {
    const lastRef = await loadBalancerApi.getAddressLastAcceptedTransactionRef(this.address);
    const tx = await keyStore.generateTransaction(amount, toAddress, this.keyTrio, lastRef);

    return tx;
  }

  async transferDag (toAddress: string, amount: number, fee = 0): Promise<PendingTx> {

    const lastRef = await loadBalancerApi.getAddressLastAcceptedTransactionRef(this.address);
    const tx = await keyStore.generateTransaction(amount, toAddress, this.keyTrio, lastRef, fee);
    const txHash = await loadBalancerApi.postTransaction(tx);

    if (txHash) {
      //this.memPool.addToMemPoolMonitor({ timestamp: Date.now(), hash: txHash, amount: amount * 1e8, receiver: toAddress, sender: this.address });
      amount = Math.floor(new BigNumber(amount).multipliedBy(1e8).toNumber());
      return { timestamp: Date.now(), hash: txHash, amount: amount, receiver: toAddress, sender: this.address, ordinal: lastRef.ordinal, pending: true, status: 'POSTED' } ;
    }
  }

  transferDagBatch(transfers: TransferBatchItem[]) {

  }

}

// function normalizeMult (num: number) {
//   return Math.floor(new BigNumber(num).multipliedBy(1e8).toNumber());
// }
//
// function normalizeDiv (num: number) {
//   return (new BigNumber(num).dividedBy(1e8).toNumber());
// }



type TransferBatchItem = {
  address: string,
  amount: number,
  fee?: number
}

// export const walletSession = new WalletAccount();
