import {BIP_44_PATHS, HdKeyring, SimpleKeyring} from '../rings';
import {
  IKeyringWallet,
  IKeyringAccount,
  KeyringAssetType,
  KeyringNetwork,
  KeyringWalletSerialized,
  KeyringWalletType, KeyringAssetInfo
} from '../kcs';
import {BIP39_WORD_COUNT, Bip39Helper} from '../bip39-helper';

let SID = 0;

/**
 * A wallet implementation that supports multiple accounts within a single network.
 * This wallet type manages multiple accounts using a single HD keyring for a specific network.
 */
export class MultiAccountWallet implements IKeyringWallet {

  /**
   * The type of this wallet.
   */
  readonly type = KeyringWalletType.MultiAccountWallet;

  /**
   * Unique identifier for this wallet instance.
   */
  readonly id = this.type + (++SID);

  /**
   * List of asset types supported by this wallet.
   */
  readonly supportedAssets = [];

  /**
   * The label for this wallet.
   */
  private label: string;

  /**
   * The HD keyring used to manage accounts.
   */
  private keyring: HdKeyring;

  /**
   * The mnemonic phrase used to generate keys.
   */
  private mnemonic: string;

  /**
   * The network this wallet operates on.
   */
  private network: KeyringNetwork;

  /**
   * Creates a new wallet instance.
   * @param network - The network to operate on
   * @param mnemonic - The mnemonic phrase or word count to generate one
   * @param label - The label for the wallet
   * @param numOfAccounts - Number of accounts to create initially (default: 1)
   */
  create (network: KeyringNetwork, mnemonic: string | BIP39_WORD_COUNT, label: string, numOfAccounts = 1) {
    if (mnemonic) {
      if (typeof(mnemonic) === 'number') {
        mnemonic = Bip39Helper.generateMnemonic(mnemonic);
      }
    }
    else {
      mnemonic = Bip39Helper.generateMnemonic();
    }

    this.deserialize({ secret: mnemonic, type: this.type, label, network, numOfAccounts })
  }

  /**
   * Sets the wallet label.
   * @param val - The new label
   */
  setLabel(val: string) {
    this.label = val;
  }

  /**
   * Gets the wallet label.
   * @returns The wallet label
   */
  getLabel(): string {
    return this.label;
  }

  /**
   * Gets the network this wallet operates on.
   * @returns The network identifier
   */
  getNetwork (): string {
    return this.network;
  }

  /**
   * Gets the current state of the wallet.
   * @returns An object containing wallet state information
   */
  getState () {
    return {
      id: this.id,
      type: this.type,
      label: this.label,
      supportedAssets: this.supportedAssets,
      accounts: this.getAccounts().map(a => a.getState())
    }
  }

  /**
   * Serializes the wallet data for storage.
   * @returns The serialized wallet data
   */
  serialize (): KeyringWalletSerialized {
    return {
      type: this.type,
      label: this.label,
      network: this.network,
      secret: this.exportSecretKey(),
      rings: [this.keyring.serialize()]
    }
  }

  /**
   * Deserializes wallet data from storage.
   * @param data - The serialized wallet data to restore
   */
  deserialize (data: KeyringWalletSerialized) {
    this.label = data.label;
    this.network = data.network || KeyringNetwork.Ethereum;
    this.mnemonic = data.secret;

    let bip44Path: string;

    if (this.network === KeyringNetwork.Constellation) {
      this.supportedAssets.push(KeyringAssetType.DAG);
      bip44Path = BIP_44_PATHS.CONSTELLATION_PATH;
    }
    else {
      this.supportedAssets.push(KeyringAssetType.ETH);
      this.supportedAssets.push(KeyringAssetType.ERC20);
      bip44Path = BIP_44_PATHS.ETH_WALLET_PATH;
    }

    this.keyring = HdKeyring.create(this.mnemonic, bip44Path, this.network, data.numOfAccounts);

    if (data.rings) {
      this.keyring.deserialize(data.rings[0]);
    }
  }

  /**
   * Attempts to import an account using an HD path.
   * This method is not supported in MultiAccountWallet and will throw an error.
   * @param hdPath - The HD derivation path
   * @param label - The label for the account
   * @throws Error indicating that importAccount is not supported
   * @returns Never returns due to throwing an error
   */
  importAccount (hdPath: string, label: string): IKeyringAccount {
    throw new Error('MultiAccountWallet does not support importAccount');
  }

  /**
   * Gets all accounts managed by this wallet.
   * @returns Array of accounts
   */
  getAccounts (): IKeyringAccount[] {
    return this.keyring.getAccounts();
  }

  /**
   * Gets an account by its address.
   * @param address - The address to look up
   * @returns The account if found, undefined otherwise
   */
  getAccountByAddress (address: string): IKeyringAccount {
    return this.keyring.getAccountByAddress(address);
  }

  /**
   * Adds a new account to the wallet.
   * The account will be added at the next available index.
   */
  addAccount () {
    this.keyring.addAccountAt();
  }

  /**
   * Sets the number of accounts in the wallet.
   * This will recreate the keyring with the specified number of accounts.
   * @param num - The number of accounts to create
   */
  setNumOfAccounts(num: number) {
    this.keyring = HdKeyring.create(this.mnemonic, this.keyring.getHdPath(), this.network, num);
  }

  /**
   * Removes an account from the wallet.
   * @param account - The account to remove
   */
  removeAccount (account: IKeyringAccount) {
    this.keyring.removeAccount(account);
  }

  /**
   * Exports the mnemonic phrase used by this wallet.
   * @returns The mnemonic phrase
   */
  exportSecretKey () {
    return this.mnemonic;
  }
}
