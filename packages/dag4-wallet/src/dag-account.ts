import {keyStore, KeyTrio} from '@stardust-collective/dag4-keystore';
import {Subject} from 'rxjs';

import {loadBalancerApi, blockExplorerApi, Transaction} from '@stardust-collective/dag4-network';
import {PendingTx} from '@stardust-collective/dag4-network/types';

export class DagAccount {

  private m_keyTrio: KeyTrio;

  private sessionChange$ = new Subject<boolean>();
  private txs: Transaction[];

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

  async getTransactions () {
    this.txs = await blockExplorerApi.getTransactionsByAddress(this.address);

    return this.txs;
  }

  async getTransactionsCache () {
    return this.txs || this.getTransactions();
  }

  validateDagAddress (address: string) {
    return keyStore.validateDagAddress(address)
  }

  async getBalance () {

    let result = 0;

    if (this.address) {

      const addressObj = await loadBalancerApi.getAddressBalance(this.address);

      if (addressObj && !isNaN(addressObj.balance)) {
        result = addressObj.balance / 1e8;
      }
    }

    return result;
  }

  async generateSignedTransaction (toAddress: string, amount: number, fee = 0) {
    const lastRef = await loadBalancerApi.getAddressLastAcceptedTransactionRef(this.address);
    const tx = await keyStore.generateTransaction(amount, toAddress, this.keyTrio, lastRef);

    return tx;
  }

  async transferDag (toAddress: string, amount: number, fee = 0) {

    const lastRef = await loadBalancerApi.getAddressLastAcceptedTransactionRef(this.address);
    const tx = await keyStore.generateTransaction(amount, toAddress, this.keyTrio, lastRef);
    const txHash = await loadBalancerApi.postTransaction(tx);

    if (txHash) {
      //this.memPool.addToMemPoolMonitor({ timestamp: Date.now(), hash: txHash, amount: amount * 1e8, receiver: toAddress, sender: this.address });
      return { timestamp: Date.now(), hash: txHash, amount: amount * 1e8, receiver: toAddress, sender: this.address } as PendingTx;
    }
  }

  transferDagBatch(transfers: TransferBatchItem[]) {

  }

}



type TransferBatchItem = {
  address: string,
  amount: number,
  fee?: number
}

// export const walletSession = new WalletAccount();
