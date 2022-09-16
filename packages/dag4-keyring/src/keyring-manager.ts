import {ObservableStore} from '@metamask/obs-store'
import SafeEventEmitter from '@metamask/safe-event-emitter';
import {Encryptor} from './encryptor'

import {
  IKeyringWallet,
  KeyringNetwork,
  KeyringWalletSerialized,
  KeyringWalletState,
  KeyringWalletType
} from './kcs';
import {MultiChainWallet, SingleAccountWallet, MultiAccountWallet, MultiKeyWallet} from './wallets';
import {IKeyringAccount} from './kcs';
import * as dag4 from '@stardust-collective/dag4-core';
import {Bip39Helper} from './bip39-helper';


// type WalletState = {
//   type: KeyringWalletType, data: any
// }

// type VaultEncrypted = {
//   salt: string, iv: string, vault: string
// }

//TODO - migration support for persisted state

type VaultSerialized = {
  wallets: KeyringWalletSerialized[]
}

export type KeyringVaultState = {
  isUnlocked: boolean
  wallets: KeyringWalletState[]
};

export class KeyringManager extends SafeEventEmitter  {

  //Encrypted State
  private storage = dag4.dagDi.getStateStorageDb();

  private encryptor;
  private wallets: IKeyringWallet[];

  private memStore: ObservableStore<KeyringVaultState>;
  private password: string;

  constructor ({ encryptor }) {
    super()

    this.memStore = new ObservableStore<KeyringVaultState>({
      isUnlocked: false,
      wallets: [],
    })

    this.encryptor = encryptor || new Encryptor<VaultSerialized>();

    this.wallets = []
  }

  isUnlocked () {
    return !!this.password;
  }

  generateSeedPhrase () {
    return Bip39Helper.generateMnemonic();
  }

  private async fullUpdate () {
    await this.persistAllWallets(this.password);
    this.updateMemStoreWallets();
    this.notifyUpdate();
  }

  notifyUpdate () {
    this.emit('update', this.memStore.getState())
  }

  setWalletLabel(walletId: string, label: string) {
    this.getWalletById(walletId).setLabel(label);
    this.fullUpdate();
  }

  async removeWalletById (id: string) {
    const keep = this.wallets.filter(w => w.id !== id);

    if (keep.length < this.wallets.length) {
      this.wallets = keep;
      await this.fullUpdate();
    }
    else {
      throw new Error('Unable to find Wallet');
    }
  }

  async createOrRestoreVault (label: string, seed?: string, password?: string) {

    if (password) {
      if (typeof password !== 'string') {
        new Error('Password has invalid format.')
      }
      this.password = password;
    }
    else if (!this.password) {
      new Error('A password is required to create or restore a Vault')
    }

    if (seed && !Bip39Helper.validateMnemonic(seed)) {
      new Error('Seed phrase is invalid.')
    }

    this.clearWallets();
    const wallet = this.newMultiChainHdWallet(label, seed);
    await this.fullUpdate();

    return wallet;
  }

  // - creates a single wallet with multiple chains, creates first account by default, one per chain.
  private createCrossChainHdWallet(seed: string) {

  }

  // - creates a multiple account wallet with one chain, creates first account by default.
  async createMultiAccountWallet(label: string, seed: string, chain: KeyringNetwork, numOfAccounts = 1) {
    const wallet = new MultiAccountWallet();
    label = label || 'Wallet #' + (this.wallets.length+1);
    wallet.create(chain, seed, label, numOfAccounts);
    this.wallets.push(wallet);

    await this.fullUpdate();

    return wallet;
  }

  async createMultiKeyWallet(label: string, chain: KeyringNetwork) {
    const wallet = new MultiKeyWallet();
    label = label || 'Wallet #' + (this.wallets.length+1);
    wallet.create(chain, label);
    this.wallets.push(wallet);

    await this.fullUpdate();

    return wallet;
  }

  // - creates a single wallet with multiple chains, each with their own account.
  async createMultiChainHdWallet(label: string, seed?: string) {
    const wallet = this.newMultiChainHdWallet(label, seed);

    //this.emit('newWallet', wallet);

    await this.fullUpdate();

    return wallet;
  }

  // - creates a single wallet with one chain, creates first account by default, one per chain.
  async createSingleAccountWallet(label: string, network: KeyringNetwork, privateKey?: string) {

    const wallet = new SingleAccountWallet();
    label = label || network + ' #' + (this.wallets.length+1);
    wallet.create(network, privateKey, label);
    this.wallets.push(wallet);

    //this.emit('newAccount', wallet.getAccounts()[0]);

    await this.fullUpdate();

    return wallet;
  }

  addTokenToAccount(walletId: string, accountAddress: string, address: string) {
    const account = this.getWalletById(walletId).getAccountByAddress(accountAddress);
    account.saveTokenInfo(address);
    this.fullUpdate();
    return account;
  }

  private newMultiChainHdWallet(label: string, seed?: string) {
    const wallet = new MultiChainWallet();
    label = label || 'Wallet #' + (this.wallets.length+1);
    wallet.create(label, seed);
    this.wallets.push(wallet);
    return wallet;
  }

  logout () {
    // Reset ID counter that used to enumerate wallet IDs.
    MultiChainWallet.prototype.resetSid();
    SingleAccountWallet.prototype.resetSid();
    this.password = null;
    this.memStore.updateState({ isUnlocked: false });
    this.emit('lock');
    this.notifyUpdate();
  }

  async login (password: string) {
    this.wallets = await this.unlockWallets(password);
    this.updateUnlocked();
    this.notifyUpdate();
  }

  setPassword (password) {
    this.password = password;
  }

  checkPassword (password) {
    return this.password === password;
  }

  // async verifyPassword (password) {
  //   const encryptedVault = this.store.getState().vault;
  //   if (!encryptedVault) {
  //     throw new Error('Cannot unlock without a previous vault.')
  //   }
  //   await this.encryptor.decrypt(password, encryptedVault)
  // }

  removeEmptyWallets () {
    this.wallets = this.wallets.filter(keyring => keyring.getAccounts().length > 0);
  }

  exportAccountPrivateKey (address: string) {
    return this.findAccount(address).getPrivateKey()
  }

  async importAccountPrivateKey (walletId: string, secret: string, label: string) {
    const wallet = this.wallets.find(w => w.id === walletId);

    const account = wallet.importAccount(secret, label);

    await this.persistAllWallets();
    this.updateMemStoreWallets();
    this.notifyUpdate();

    return account;
  }

  exportWalletSecretKeyOrPhrase (walletId: string) {
    const wallet = this.wallets.find(w => w.id === walletId);

    return wallet.exportSecretKey();

  }

  async removeAccount (address) {
    const walletForAccount = this.getWalletForAccount(address)

    walletForAccount.removeAccount(address);
    this.emit('removedAccount', address);
    const accounts = walletForAccount.getAccounts();

    if (accounts.length === 0) {
      this.removeEmptyWallets()
    }

    await this.persistAllWallets();
    this.updateMemStoreWallets();
    this.notifyUpdate();
  }

  signTransaction (tx, fromAddress: string, opts = {}) {
    this.findAccount(fromAddress).signTransaction(fromAddress, tx, opts);
  }

  signMessage (msgParams: { from: string, data: string }, opts?: any) {
    return this.findAccount(msgParams.from).signMessage(msgParams.from, msgParams.data, opts);
  }

  private async unlockWallets (password: string) {
    const encryptedVault = await this.storage.get('vault');
    if (!encryptedVault) {
      //Support recovering wallets from migration
      this.password = password;
      return [];
    }

    await this.clearWallets();
    const vault: VaultSerialized = await this.encryptor.decrypt(password, encryptedVault);
    this.password = password;
    vault.wallets.map(w => this._restoreWallet(w));
    await this.updateMemStoreWallets();
    return this.wallets;
  }

  getAccounts () {
    return this.wallets.reduce<IKeyringAccount[]>((res, kr) => res.concat(kr.getAccounts()), []);
  }

  getWallets (filterByType?: KeyringWalletType) {
    if (filterByType) {
      return this.wallets.filter(w => w.type === filterByType);
    }

    return this.wallets;
  }

  getWalletById (id: string) {
    const wallet = this.wallets.find(w => w.id === id);
    if (wallet) {
      return wallet;
    }
    throw new Error('No wallet found with the id: ' + id);
  }

  getWalletForAccount (address: string) {

    const winner = this.wallets.find((keyring) => {
      return keyring.getAccounts().find(a => a.getAddress() === address)
    });

    if (winner) {
      return winner;
    }

    throw new Error('No keyring found for the requested account.')
  }

  findAccount (address: string) {
    return this.getWalletForAccount(address).getAccountByAddress(address);
  }

  private async persistAllWallets (password = this.password) {

    if (typeof password !== 'string') {
      return new Error('KeyringManager - password is not a string')
    }

    this.password = password;

    const sWallets = this.wallets.map(w => w.serialize());

    const encryptedString = await this.encryptor.encrypt(this.password, { wallets: sWallets })

    await this.storage.set('vault', encryptedString);
  }

  private async _restoreWallet (wData: KeyringWalletSerialized) {

    let wallet: IKeyringWallet;

    if (wData.type === KeyringWalletType.MultiChainWallet) {
      wallet = new MultiChainWallet();
      wallet.deserialize(wData);
    }
    else if (wData.type === KeyringWalletType.SingleAccountWallet) {
      wallet = new SingleAccountWallet();
      wallet.deserialize(wData);
    }
    else if (wData.type === KeyringWalletType.MultiAccountWallet) {
      wallet = new MultiAccountWallet();
      wallet.deserialize(wData);
    }
    else if (wData.type === KeyringWalletType.MultiKeyWallet) {
      wallet = new MultiKeyWallet();
      wallet.deserialize(wData);
    }
    else {
      throw new Error('Unknown Wallet type - ' + wData.type + ', support types are [' + KeyringWalletType.MultiChainWallet +',' + KeyringWalletType.SingleAccountWallet + ']');
    }

    this.wallets.push(wallet)

    return wallet;
  }

  private updateUnlocked () {
    this.memStore.updateState({ isUnlocked: true });
    this.emit('unlock');
  }

  private clearWallets () {
    // clear wallets from memory
    this.wallets = []
    this.memStore.updateState({
      wallets: [],
    })
  }

  private updateMemStoreWallets () {
    const wallets = this.wallets.map(w => w.getState());
    return this.memStore.updateState({ wallets })
  }


}

