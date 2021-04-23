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
    const address = this.m_keyTrio && this.m_keyTrio.address;

    if (!address) {
      throw new Error('Need to login before calling methods on dag4.account');
    }

    return address;
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

    let result: number = undefined;

    const addressObj = await loadBalancerApi.getAddressBalance(this.address);

    if (addressObj && !isNaN(addressObj.balance)) {
      result = new  BigNumber(addressObj.balance).dividedBy(1e8).toNumber();
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

  async transferDag (toAddress: string, amount: number, fee = 0, autoEstimateFee = false): Promise<PendingTx> {

    let normalizedAmount = Math.floor(new BigNumber(amount).multipliedBy(1e8).toNumber());
    const lastRef = await loadBalancerApi.getAddressLastAcceptedTransactionRef(this.address);

    if (fee === 0 && autoEstimateFee) {
      const tx = await loadBalancerApi.getTransaction(lastRef.prevHash);

      if (tx) {

        const addressObj = await loadBalancerApi.getAddressBalance(this.address);

        //Check to see if sending max amount
        if (addressObj.balance === normalizedAmount) {
          amount -= 1e-8
          normalizedAmount--;
        }

        fee = 1e-8;
      }
    }

    const tx = await keyStore.generateTransaction(amount, toAddress, this.keyTrio, lastRef, fee);
    const txHash = await loadBalancerApi.postTransaction(tx);

    if (txHash) {
      //this.memPool.addToMemPoolMonitor({ timestamp: Date.now(), hash: txHash, amount: amount * 1e8, receiver: toAddress, sender: this.address });
      return { timestamp: Date.now(), hash: txHash, amount: normalizedAmount, receiver: toAddress, fee, sender: this.address, ordinal: lastRef.ordinal, pending: true, status: 'POSTED' } ;
    }
  }

  async waitForCheckPointAccepted (hash: string) {

    let attempts = 0;

    for (let i = 1; ; i++) {

      const result = await loadBalancerApi.checkTransactionStatus(hash);

      if (result) {
        if (result.accepted) {
          break;
        }
      }
      else {
        attempts++;

        if (attempts > 20) {
          throw new Error('Unable to find transaction');
        }
      }

      await this.wait(2.5);
    }

    return true;
  }

  async waitForBalanceChange (initialValue?: number) {

    if (initialValue === undefined) {
      initialValue = await this.getBalance();
      await this.wait(5);
    }

    let changed = false;

    //Run for a max of 2 minutes (5 * 24 times)
    for (let i = 1; i < 24; i++) {

      const result = await this.getBalance();

      if (result !== undefined) {
        if(result !== initialValue) {
          changed = true;
          break;
        }
      }

      await this.wait(5);
    }

    return changed;
  }

  private wait (time = 5): Promise<void> {
   return new Promise(resolve => setTimeout(resolve, time * 1000));
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
