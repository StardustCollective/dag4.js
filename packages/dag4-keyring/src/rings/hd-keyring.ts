import {hdkey} from 'ethereumjs-wallet'
import EthereumHDKey from 'ethereumjs-wallet/dist/hdkey';

import {keyringRegistry} from '../keyring-registry';
import {
  KeyringNetwork,
  IKeyring,
  IKeyringAccount,
  KeyringAssetInfo,
  KeyringWalletSerialized,
  KeyringAccountSerialized, KeyringRingSerialized
} from '../kcs';
import {Bip39Helper} from '../bip39-helper';
import {deserialize} from "v8";

const CONSTELLATION_PATH_INDEX = 1137;
const ETH_WALLET_PATH_INDEX = 60;

/**
 * BIP-44 derivation paths for different networks and wallet types.
 */
export const BIP_44_PATHS = {
  CONSTELLATION_PATH: `m/44'/${CONSTELLATION_PATH_INDEX}'/0'/0`,
  ETH_WALLET_PATH: `m/44'/${ETH_WALLET_PATH_INDEX}'/0'/0`,            //MetaMask and Trezor
  ETH_WALLET_LEDGER_PATH: `m/44'/${ETH_WALLET_PATH_INDEX}'`,          //Ledger Live
}

/**
 * Hierarchical Deterministic (HD) keyring implementation.
 * Manages multiple accounts derived from a single seed or extended key.
 * Supports both read-only (extended public key) and full access (mnemonic) modes.
 */
export class HdKeyring implements IKeyring {

  /**
   * List of accounts managed by this keyring.
   */
  private accounts: IKeyringAccount[] = [];

  /**
   * The HD derivation path used for account generation.
   */
  private hdPath: string;

  /**
   * The mnemonic phrase used to generate the master seed.
   */
  private mnemonic: string;

  /**
   * The extended public key for read-only access.
   */
  private extendedKey: string;

  /**
   * The root HD key used for derivation.
   */
  private rootKey: EthereumHDKey;

  /**
   * The network this keyring operates on.
   */
  private network: KeyringNetwork;

  /**
   * Creates a new HdKeyring instance from an extended public key.
   * This creates a read-only keyring that can't sign transactions.
   * @param extendedKey - The extended public key
   * @param network - The network to create accounts for
   * @param numberOfAccounts - Number of accounts to create
   * @returns A new HdKeyring instance
   */
  static createFromExtendedKey(extendedKey: string, network: KeyringNetwork, numberOfAccounts: number) {
    const inst = new HdKeyring();
    inst.extendedKey = extendedKey;
    inst._initFromExtendedKey(extendedKey);
    inst.deserialize({ network, accounts: inst.createAccounts(numberOfAccounts) });
    return inst;
  }

  /**
   * Creates a new HdKeyring instance from a mnemonic phrase.
   * This creates a full-access keyring that can sign transactions.
   * @param mnemonic - The mnemonic phrase
   * @param hdPath - The HD derivation path
   * @param network - The network to create accounts for
   * @param numberOfAccounts - Number of accounts to create
   * @returns A new HdKeyring instance
   */
  static create(mnemonic: string, hdPath: string, network: KeyringNetwork, numberOfAccounts: number) {
    const inst = new HdKeyring();
    inst.mnemonic = mnemonic;
    inst.hdPath = hdPath;
    inst._initFromMnemonic(mnemonic);
    inst.deserialize({ network, accounts: inst.createAccounts(numberOfAccounts) });
    return inst;
  }

  /**
   * Gets the network this keyring operates on.
   * @returns The network
   */
  getNetwork () {
    return this.network;
  }

  /**
   * Gets the HD derivation path used by this keyring.
   * @returns The HD path
   */
  getHdPath () {
    return this.hdPath;
  }

  /**
   * Gets the extended public key for this keyring.
   * @returns The extended public key as a hex string
   */
  getExtendedPublicKey () {
    if (this.mnemonic) {
      return this.rootKey.publicExtendedKey().toString('hex');
    }

    return this.extendedKey;
  }

  /**
   * Serializes the keyring data for storage.
   * @returns The serialized keyring data
   */
  serialize (): KeyringRingSerialized {
    return {
      network: this.network,
      accounts: this.accounts.map(a => a.serialize(false))
    }
  }

  /**
   * Deserializes keyring data from storage.
   * @param data - The serialized keyring data to restore
   */
  deserialize (data: KeyringRingSerialized) {
    if (data) {
      this.network = data.network;
      this.accounts = [];
      data.accounts.forEach((d, i) => {
        this.accounts[i] = this.addAccountAt(d.bip44Index);
        this.accounts[i].setTokens(d.tokens)
      })
    }
  }

  /**
   * Creates serialized account data for the specified number of accounts.
   * @param numberOfAccounts - Number of accounts to create
   * @returns Array of serialized account data
   */
  private createAccounts (numberOfAccounts = 0) {
    const accounts:KeyringAccountSerialized[] = [];
    for (let i = 0; i < numberOfAccounts; i++) {
      accounts[i] = { bip44Index: i }
    }
    return accounts;
  }

  /**
   * Removes the most recently added account from the keyring.
   */
  removeLastAddedAccount () {
    this.accounts.pop();
  }

  /**
   * Adds a new account at the specified index.
   * @param index - The index at which to add the account
   * @returns The newly created account
   * @throws Error if an account already exists at the specified index
   */
  addAccountAt (index?: number) {
    index = index >=0 ? index : this.accounts.length;

    if (this.accounts[index]) {
      throw new Error('HdKeyring - Trying to add an account to an index already populated')
    }

    let account: IKeyringAccount;
    const child = this.rootKey.deriveChild(index);
    const wallet = child.getWallet();
    if (this.mnemonic) {
      const privateKey = wallet.getPrivateKey().toString('hex');
      account = keyringRegistry.createAccount(this.network).deserialize({privateKey, bip44Index: index});
    } else {
      const publicKey = wallet.getPublicKey().toString('hex');
      account = keyringRegistry.createAccount(this.network).deserialize({publicKey, bip44Index: index});
    }

    this.accounts[index] = account;

    return account;
  }

  /**
   * Gets all accounts managed by this keyring.
   * @returns Array of accounts
   */
  getAccounts() {
    return this.accounts;
  }

  /**
   * Initializes the keyring from a mnemonic phrase.
   * @param mnemonic - The mnemonic phrase
   */
  private _initFromMnemonic (mnemonic) {
    this.mnemonic = mnemonic
    const seedBytes = Bip39Helper.mnemonicToSeedSync(mnemonic)
    const hdWallet = hdkey.fromMasterSeed(seedBytes)
    this.rootKey = hdWallet.derivePath(this.hdPath)
  }

  /**
   * Initializes the keyring from an extended public key.
   * @param extendedKey - The extended public key
   */
  private _initFromExtendedKey (extendedKey: string) {
    this.extendedKey = extendedKey
    this.rootKey = hdkey.fromExtendedKey(extendedKey);
  }

  /**
   * Exports the private key of an account.
   * @param account - The account to export
   * @returns The private key as a hex string
   */
  exportAccount (account:IKeyringAccount): string {
    return account.getPrivateKey();
  }

  /**
   * Gets an account by its address.
   * @param address - The address to look up
   * @returns The account if found, undefined otherwise
   */
  getAccountByAddress (address: string): IKeyringAccount {
    return this.accounts.find(a => a.getAddress().toLowerCase() === address.toLowerCase());
  }

  /**
   * Removes an account from the keyring.
   * @param account - The account to remove
   */
  removeAccount (account:IKeyringAccount) {
    this.accounts = this.accounts.filter(a => a === account);
  }
}

