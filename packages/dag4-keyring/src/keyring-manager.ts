import {ObservableStore} from '@metamask/obs-store'
import SafeEventEmitter from '@metamask/safe-event-emitter';
import {Encryptor} from './encryptor'

import {IKeyringChainWallet, KeyringChainId, KeyringChainWalletId} from './keyrings/kcs';
import {HdKeyring} from './keyrings/rings';
import {MultiChainWallet} from './keyrings/wallets/multi-chain-wallet';
import {IKeyringAccount} from './keyrings/keyring-account';
import {SimpleChainWallet} from './keyrings/wallets/simple-chain-wallet';

type WalletState = {
  type: KeyringChainWalletId, data: any
}

type VaultEncrypted = {
  salt: string, iv: string, vault: string
}

type VaultState = {
  wallets: WalletState[]
}

type VaultMemoryState = VaultState & {
  isUnlocked: boolean
};

export class KeyringManager extends SafeEventEmitter  {

  private encryptor = new Encryptor<VaultState>();
  private wallets: IKeyringChainWallet[];
  //Encrypted State
  private store: ObservableStore<VaultEncrypted>;
  private memStore: ObservableStore<VaultMemoryState>;
  private password: string;

  constructor (opts = {} as { initState: any }) {
    super()

    const initState = opts.initState || {}

    this.store = new ObservableStore<VaultEncrypted>(initState)
    this.memStore = new ObservableStore<VaultMemoryState>({
      isUnlocked: false,
      wallets: [],
    })

    this.wallets = []
  }

  fullUpdate () {
    this.emit('update', this.memStore.getState())
    return this.memStore.getState()
  }

  // - creates a single wallet with multiple chains, each with their own account.
  createMultiChainHdWallet(seed?: string) {
    const wallet = new MultiChainWallet();
    wallet.deserialize({ mnemonic: seed });
    this.wallets.push(wallet);
    return wallet;
  }

  // - creates a single wallet with one chain, creates first account by default.
  createSingleChainHdWallet(seed: string, chain: KeyringChainId) {

  }

  // - creates a single wallet with multiple chains, creates first account by default, one per chain.
  createCrossChainHdWallet(seed: string) {

  }

  // - creates a single wallet with one chain, creates first account by default, one per chain.
  createSimpleWallet(chain: KeyringChainId, privateKey?: string) {

  }
  
  async createNewVault (password: string) {
    if (typeof password !== 'string') {
      return new Error('Password must be text.')
    }
    
    this.clearWallets()
    this.createMultiChainHdWallet();
    await this.persistAllWallets(password);
    this.updateUnlocked();
    this.fullUpdate();
  }
  
  async restoreVault (password: string, seed: string) {
    if (typeof password !== 'string') {
      return new Error('Password must be text.')
    }

    if (!HdKeyring.validateMnemonic(seed)) {
      return new Error('Seed phrase is invalid.')
    }

    this.clearWallets()
    this.createMultiChainHdWallet(seed);
    await this.persistAllWallets(password);
    this.updateUnlocked();
    this.fullUpdate();
  }

  createNewPrivateKeyAccount(chain: KeyringChainId) {
    this.createSimpleWallet(chain);
  }

  importPrivateKeyAccount(chain: KeyringChainId, privateKey: string) {
    this.createSimpleWallet(chain, privateKey);
  }

  /**
   * Set Locked
   * This method deallocates all secrets, and locks the Vault
   */
  async setLocked () {
    this.password = null;
    this.memStore.updateState({ isUnlocked: false });
    this.wallets = [];
    await this.updateMemStoreWallets();
    this.emit('lock');
    return this.fullUpdate();
  }

  async login (password: string) {
    this.wallets = await this.unlockWallets(password);
    this.updateUnlocked();
    this.fullUpdate();
  }

  async verifyPassword (password) {
    const encryptedVault = this.store.getState().vault;
    if (!encryptedVault) {
      throw new Error('Cannot unlock without a previous vault.')
    }
    await this.encryptor.decrypt(password, encryptedVault)
  }

  removeEmptyWallets () {
    this.wallets = this.wallets.filter(keyring => keyring.getAccounts().length > 0);
  }
  
  exportAccount (address: string) {
    return this.findAccount(address).getPrivateKey()
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
    this.fullUpdate();
  }

  signTransaction (tx, fromAddress: string, opts = {}) {
    this.findAccount(fromAddress).signTransaction(fromAddress, tx, opts);
  }

  signMessage (msgParams: { from: string, data: string }, opts?: any) {
    return this.findAccount(msgParams.from).signMessage(msgParams.from, msgParams.data, opts);
  }

  private async unlockWallets (password: string) {
    const encryptedVault = this.store.getState().vault
    if (!encryptedVault) {
      throw new Error('Cannot unlock without a previous vault.')
    }

    await this.clearWallets()
    const vault: VaultState = await this.encryptor.decrypt(password, encryptedVault)
    this.password = password
    vault.wallets.map(w => this._restoreWallet(w))
    await this.updateMemStoreWallets()
    return this.wallets
  }

  getAccounts () {
    const wallets = this.wallets || []
    return wallets.reduce<IKeyringAccount[]>((res, kr) => res.concat(kr.getAccounts()), []);
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

  /**
   * Adds a healthy buffer of gas to an initial gas estimate.
   */
  // addGasBuffer (gas: string) {
  //   const gasBuffer = new BN('100000', 10)
  //   const bnGas = new BN(ethUtil.stripHexPrefix(gas), 16)
  //   const correct = bnGas.add(gasBuffer)
  //   return ethUtil.addHexPrefix(correct.toString(16))
  // }

  private async persistAllWallets (password = this.password) {

    if (typeof password !== 'string') {
      return new Error('KeyringManager - password is not a string')
    }

    this.password = password;

    const sWallets = this.wallets.map((keyring) => {
      return {
        type: keyring.type,
        data: keyring.serialize(),
      }
    })

    const encryptedString = await this.encryptor.encrypt(this.password, { wallets: sWallets })

    this.store.updateState({ vault: encryptedString });
  }

  // async restoreWallet (serialized: VaultState) {
  //   const keyring = await this._restoreWallet(serialized);
  //   await this.updateMemStoreWallets();
  //   return keyring;
  // }

  /**
   * Attempts to initialize a new keyring from the provided serialized payload.
   * On success, returns the resulting keyring instance.
   */
  private async _restoreWallet ({ type, data }) {

    let chainWallet: IKeyringChainWallet;

    if (type === KeyringChainWalletId.MultiChainWallet) {
      const wallet = chainWallet =new MultiChainWallet();
      wallet.deserialize(data);
    }
    else if (type === KeyringChainWalletId.SimpleChainWallet) {
      const wallet = chainWallet = new SimpleChainWallet();
      wallet.deserialize(data);
    }
    else {
      throw new Error('Unknown Wallet type - ' + type + ', support types are [' + KeyringChainWalletId.MultiChainWallet +',' + KeyringChainWalletId.SimpleChainWallet + ']');
    }

    this.wallets.push(chainWallet)
    return chainWallet;
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
    const wallets = this.wallets.map(w => this.serializeWallet(w));
    return this.memStore.updateState({ wallets })
  }

  private serializeWallet (wallet: IKeyringChainWallet) {
    return {
      type: wallet.type,
      data: wallet.getAccounts()
    }
  }


}

