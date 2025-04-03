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

/**
 * Type representing the serialized vault data.
 */
type VaultSerialized = {
  wallets: KeyringWalletSerialized[]
}

/**
 * Type representing the state of the keyring vault.
 */
export type KeyringVaultState = {
  isUnlocked: boolean
  wallets: KeyringWalletState[]
};

/**
 * Main class for managing wallets and accounts.
 * Handles wallet creation, encryption, and persistence.
 */
export class KeyringManager extends SafeEventEmitter  {

  //Encrypted State
  private storage = dag4.dagDi.getStateStorageDb();

  private encryptor;
  private wallets: IKeyringWallet[];

  private memStore: ObservableStore<KeyringVaultState>;
  private password: string;

  /**
   * Creates a new instance of the KeyringManager.
   * @param options - Configuration options
   * @param options.encryptor - Optional custom encryptor instance
   */
  constructor ({ encryptor }) {
    super()

    this.memStore = new ObservableStore<KeyringVaultState>({
      isUnlocked: false,
      wallets: [],
    })

    this.encryptor = encryptor || new Encryptor<VaultSerialized>();

    this.wallets = []
  }

  /**
   * Checks if the keyring is unlocked.
   * @returns True if the keyring is unlocked, false otherwise
   */
  isUnlocked () {
    return !!this.password;
  }

  /**
   * Generates a new BIP39 seed phrase.
   * @returns The generated seed phrase
   */
  generateSeedPhrase () {
    return Bip39Helper.generateMnemonic();
  }

  /**
   * Updates all wallets and persists them to storage.
   */
  private async fullUpdate () {
    await this.persistAllWallets(this.password);
    this.updateMemStoreWallets();
    this.notifyUpdate();
  }

  /**
   * Notifies listeners of state updates.
   */
  notifyUpdate () {
    this.emit('update', this.memStore.getState())
  }

  /**
   * Sets the label for a wallet.
   * @param walletId - The ID of the wallet
   * @param label - The new label
   */
  setWalletLabel(walletId: string, label: string) {
    this.getWalletById(walletId).setLabel(label);
    this.fullUpdate();
  }

  /**
   * Removes a wallet by its ID.
   * @param id - The ID of the wallet to remove
   */
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

  /**
   * Creates a new vault or restores an existing one.
   * @param label - The label for the vault
   * @param seed - Optional seed phrase for restoring
   * @param password - Optional password for the vault
   * @returns The created or restored wallet
   */
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

  /**
   * Creates a multi-account wallet for a specific chain.
   * @param label - The wallet label
   * @param seed - The seed phrase
   * @param chain - The blockchain network
   * @param numOfAccounts - Number of accounts to create (default: 1)
   * @returns The created wallet
   */
  async createMultiAccountWallet(label: string, seed: string, chain: KeyringNetwork, numOfAccounts = 1) {
    const wallet = new MultiAccountWallet();
    label = label || 'Wallet #' + (this.wallets.length+1);
    wallet.create(chain, seed, label, numOfAccounts);
    this.wallets.push(wallet);

    await this.fullUpdate();

    return wallet;
  }

  /**
   * Creates a multi-key wallet for a specific chain.
   * @param label - The wallet label
   * @param chain - The blockchain network
   * @returns The created wallet
   */
  async createMultiKeyWallet(label: string, chain: KeyringNetwork) {
    const wallet = new MultiKeyWallet();
    label = label || 'Wallet #' + (this.wallets.length+1);
    wallet.create(chain, label);
    this.wallets.push(wallet);

    await this.fullUpdate();

    return wallet;
  }

  /**
   * Creates a multi-chain HD wallet.
   * @param label - The wallet label
   * @param seed - Optional seed phrase
   * @returns The created wallet
   */
  async createMultiChainHdWallet(label: string, seed?: string) {
    const wallet = this.newMultiChainHdWallet(label, seed);

    await this.fullUpdate();

    return wallet;
  }

  /**
   * Creates a single account wallet.
   * @param label - The wallet label
   * @param network - The blockchain network
   * @param privateKey - Optional private key
   * @returns The created wallet
   */
  async createSingleAccountWallet(label: string, network: KeyringNetwork, privateKey?: string) {

    const wallet = new SingleAccountWallet();
    label = label || network + ' #' + (this.wallets.length+1);
    wallet.create(network, privateKey, label);
    this.wallets.push(wallet);

    await this.fullUpdate();

    return wallet;
  }

  /**
   * Adds a token to an account.
   * @param walletId - The wallet ID
   * @param accountAddress - The account address
   * @param address - The token address
   * @returns The updated account
   */
  addTokenToAccount(walletId: string, accountAddress: string, address: string) {
    const account = this.getWalletById(walletId).getAccountByAddress(accountAddress);
    account.saveTokenInfo(address);
    this.fullUpdate();
    return account;
  }

  /**
   * Creates a new multi-chain HD wallet.
   * @param label - The wallet label
   * @param seed - Optional seed phrase
   * @returns The created wallet
   */
  private newMultiChainHdWallet(label: string, seed?: string) {
    const wallet = new MultiChainWallet();
    label = label || 'Wallet #' + (this.wallets.length+1);
    wallet.create(label, seed);
    this.wallets.push(wallet);
    return wallet;
  }

  /**
   * Logs out and locks the keyring.
   */
  logout () {
    // Reset ID counter that used to enumerate wallet IDs.
    MultiChainWallet.prototype.resetSid();
    SingleAccountWallet.prototype.resetSid();
    this.password = null;
    this.memStore.updateState({ isUnlocked: false });
    this.emit('lock');
    this.notifyUpdate();
  }

  /**
   * Logs in and unlocks the keyring.
   * @param password - The password to unlock with
   */
  async login (password: string) {
    this.wallets = await this.unlockWallets(password);
    this.updateUnlocked();
    this.notifyUpdate();
  }

  /**
   * Sets the password for the keyring.
   * @param password - The new password
   */
  setPassword (password) {
    this.password = password;
  }

  /**
   * Checks if the provided password matches the current password.
   * @param password - The password to check
   * @returns True if the password matches, false otherwise
   */
  checkPassword (password) {
    return this.password === password;
  }

  /**
   * Removes wallets that have no accounts.
   */
  removeEmptyWallets () {
    this.wallets = this.wallets.filter(keyring => keyring.getAccounts().length > 0);
  }

  /**
   * Exports the private key for an account.
   * @param address - The account address
   * @returns The private key
   */
  exportAccountPrivateKey (address: string) {
    return this.findAccount(address).getPrivateKey()
  }

  /**
   * Imports an account using a private key.
   * @param walletId - The wallet ID
   * @param secret - The private key
   * @param label - The account label
   * @returns The imported account
   */
  async importAccountPrivateKey (walletId: string, secret: string, label: string) {
    const wallet = this.wallets.find(w => w.id === walletId);

    const account = wallet.importAccount(secret, label);

    await this.persistAllWallets();
    this.updateMemStoreWallets();
    this.notifyUpdate();

    return account;
  }

  /**
   * Exports the secret key or seed phrase for a wallet.
   * @param walletId - The wallet ID
   * @returns The secret key or seed phrase
   */
  exportWalletSecretKeyOrPhrase (walletId: string) {
    const wallet = this.wallets.find(w => w.id === walletId);

    return wallet.exportSecretKey();

  }

  /**
   * Removes an account.
   * @param address - The account address
   */
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

  /**
   * Signs a transaction.
   * @param tx - The transaction to sign
   * @param fromAddress - The address to sign from
   * @param opts - Additional options
   */
  signTransaction (tx, fromAddress: string, opts = {}) {
    this.findAccount(fromAddress).signTransaction(fromAddress, tx, opts);
  }

  /**
   * Signs a message.
   * @param msgParams - Message parameters
   * @param msgParams.from - The address to sign from
   * @param msgParams.data - The message data
   * @param opts - Additional options
   * @returns The signature
   */
  signMessage (msgParams: { from: string, data: string }, opts?: any) {
    return this.findAccount(msgParams.from).signMessage(msgParams.from, msgParams.data, opts);
  }

  /**
   * Unlocks wallets using a password.
   * @param password - The password to unlock with
   * @returns The unlocked wallets
   */
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

  /**
   * Gets all accounts from all wallets.
   * @returns An array of accounts
   */
  getAccounts () {
    return this.wallets.reduce<IKeyringAccount[]>((res, kr) => res.concat(kr.getAccounts()), []);
  }

  /**
   * Gets all wallets, optionally filtered by type.
   * @param filterByType - Optional wallet type to filter by
   * @returns An array of wallets
   */
  getWallets (filterByType?: KeyringWalletType) {
    if (filterByType) {
      return this.wallets.filter(w => w.type === filterByType);
    }

    return this.wallets;
  }

  /**
   * Gets a wallet by its ID.
   * @param id - The wallet ID
   * @returns The wallet
   * @throws Error if the wallet is not found
   */
  getWalletById (id: string) {
    const wallet = this.wallets.find(w => w.id === id);
    if (wallet) {
      return wallet;
    }
    throw new Error('No wallet found with the id: ' + id);
  }

  /**
   * Gets the wallet that contains a specific account.
   * @param address - The account address
   * @returns The wallet
   * @throws Error if the wallet is not found
   */
  getWalletForAccount (address: string) {

    const winner = this.wallets.find((keyring) => {
      return keyring.getAccounts().find(a => a.getAddress() === address)
    });

    if (winner) {
      return winner;
    }

    throw new Error('No keyring found for the requested account.')
  }

  /**
   * Finds an account by its address.
   * @param address - The account address
   * @returns The account
   */
  findAccount (address: string) {
    return this.getWalletForAccount(address).getAccountByAddress(address);
  }

  /**
   * Persists all wallets to storage.
   * @param password - The password to encrypt with
   */
  private async persistAllWallets (password = this.password) {

    if (typeof password !== 'string') {
      return new Error('KeyringManager - password is not a string')
    }

    this.password = password;

    const sWallets = this.wallets.map(w => w.serialize());

    const encryptedString = await this.encryptor.encrypt(this.password, { wallets: sWallets })

    await this.storage.set('vault', encryptedString);
  }

  /**
   * Restores a wallet from serialized data.
   * @param wData - The serialized wallet data
   * @returns The restored wallet
   * @throws Error if the wallet type is unknown
   */
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

  /**
   * Updates the unlocked state.
   */
  private updateUnlocked () {
    this.memStore.updateState({ isUnlocked: true });
    this.emit('unlock');
  }

  /**
   * Clears all wallets from memory.
   */
  private clearWallets () {
    // clear wallets from memory
    this.wallets = []
    this.memStore.updateState({
      wallets: [],
    })
  }

  /**
   * Updates the memory store with current wallet states.
   */
  private updateMemStoreWallets () {
    const wallets = this.wallets.map(w => w.getState());
    return this.memStore.updateState({ wallets })
  }
}

