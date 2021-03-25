
import {dag, DagTypes} from '@stardust-collective/dag4';
import {DagWalletMonitorUpdate} from '@stardust-collective/dag4-wallet';
import {Subscription} from 'rxjs';

const PASSWORD = 'test123';
const FAUCET_ADDRESS = 'DAG4So5o9ACx5BFQha9FAMgvzkJAjrbh3zotdDax';
const FAUCET_URL = 'https://us-central1-dag-faucet.cloudfunctions.net/main/api/v1/faucet/'

export class ExampleWallet {

  private wallet1PrivateKey: string;
  private wallet2PrivateKey: string;
  private wallet1DAGAddress: string;
  private wallet2DAGAddress: string;
  private subscription: Subscription;

  constructor () {
    this.subscription = dag.monitor.observeMemPoolChange().subscribe((U) => this.pollPendingTxs(U));
  }

  async createEncryptedWalletsAB () {
    //Create Wallet A using JsonPrivateKey. Encrypted JsonPrivateKey requires password to later decrypt.
    const jsonPrivateKey: JSONPrivateKey = await dag.keyStore.generateEncryptedPrivateKey(PASSWORD);

    //decrypt JSON to extract the private key
    this.wallet1PrivateKey = await dag.keyStore.decryptPrivateKey(jsonPrivateKey, PASSWORD);
    this.wallet1DAGAddress = await dag.keyStore.getDagAddressFromPrivateKey(this.wallet1PrivateKey);
  }


  async createWallets1and2 () {

    //decrypt JSON to extract the private key
    this.wallet1PrivateKey = await dag.keyStore.generatePrivateKey();
    this.wallet1DAGAddress = await dag.keyStore.getDagAddressFromPrivateKey(this.wallet1PrivateKey);

    //Create Wallet B using generatePrivateKey
    this.wallet2PrivateKey = await dag.keyStore.generatePrivateKey();
    this.wallet2DAGAddress = await dag.keyStore.getDagAddressFromPrivateKey(this.wallet2PrivateKey);

    console.log('Wallet 1: ' + this.wallet1DAGAddress);
    console.log('Wallet 2: ' + this.wallet2DAGAddress);
  }

  async tapFaucet (address: string) {

    if (dag.keyStore.validateDagAddress(address)) {

      console.log('tapFaucet (' + address + ')');

      const networkId = dag.network.getNetwork().id || 'ceres';

      const faucetApi = dag.di.createRestApi(FAUCET_URL);

      const pendingTx = await faucetApi.$get<DagTypes.PendingTx>(networkId + '/' + address, {amount: 1});

      console.log(JSON.stringify(pendingTx,null,2));

      return true;
    }

    throw new Error('invalid DAG address');
  }

  async checkBalance (address: string, label: string, maxCycles = 8) {

    for (let i = 1; ; i++) {

      console.log('Check Balance ' + label + '(' + i + ')');

      const balanceObj = await dag.network.loadBalancerApi.getAddressBalance(address);

      if (balanceObj && balanceObj.balance) {
        console.log('Check Balance - SUCCESS');
        break;
      }

      if (i > maxCycles) {
        throw new Error(label + ' Failed. Try again.')
      }

      await this.wait();
    }
  }

  async run () {

    await this.createWallets1and2();

    dag.account.loginPrivateKey(this.wallet1PrivateKey);

    await this.tapFaucet(dag.account.address);

    await this.checkBalance(dag.account.address, 'Faucet');

    const fee = await dag.account.getFeeRecommendation();

    let pendingTx = await dag.account.transferDag(this.wallet2DAGAddress, 1, fee);

    console.log('Transfer Dag, from Wallet 1 to Wallet 2');
    console.log(JSON.stringify(pendingTx,null,2));

    dag.monitor.addToMemPoolMonitor(pendingTx);

    await dag.monitor.waitForTransaction(pendingTx.hash);

    pendingTx = await dag.account.transferDag(FAUCET_ADDRESS, 1);

    console.log('Transfer Dag from Wallet 2 back to Faucet');
    console.log(JSON.stringify(pendingTx,null,2));

    await this.checkCheckPointBlockStatus(pendingTx.hash);

    console.log('DONE');

    return true;
  }

  private async checkCheckPointBlockStatus (hash: string) {

    for (let i = 1; ; i++) {

      const result = await dag.network.loadBalancerApi.checkTransactionStatus(hash);

      if (result.accepted) {
        console.log('Checkpoint Block Status - ACCEPTED');
        break;
      }
      else if (result.inMemPool) {
        console.log('Checkpoint Block Status - MEM_POOL' + '(' + i + ')');
      }

      await this.wait();
    }


  }


  private async wait (time = 5): Promise<boolean> {

    let waitPromiseResolve: (val: boolean) => void;

    const p = new Promise<boolean>(resolve => waitPromiseResolve = resolve);

    setTimeout(() => {
      waitPromiseResolve(true);
    }, time * 1000);

    return p;
  }

  private async pollPendingTxs (update: DagWalletMonitorUpdate) {

    if (update.txChanged) {
      console.log('pollPendingTxs');
      console.log(JSON.stringify(update, null, 2));
    }
    else {
      console.log('pollPendingTxs - No Change, Last status: [', update.transTxs.map(tx => tx.status).join(', '),']');
    }
  }


}

type JSONPrivateKey = {
  crypto: {
    cipher: string;
    cipherparams: {
      iv: string;
    };
    ciphertext: string;
    kdf: string;
    kdfparams: any;
    mac: string;
  };
  id: string;
  version: number;
}
