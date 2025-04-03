import {SimpleKeyring} from '../rings';
import {IKeyringWallet, IKeyringAccount, KeyringAssetType, KeyringNetwork, KeyringWalletSerialized, KeyringWalletType} from '../kcs';

let SID = 0;

/**
 * A wallet implementation that supports multiple private keys.
 * This wallet type manages multiple accounts using individual private keys,
 * each stored in a separate SimpleKeyring instance.
 */
export class MultiKeyWallet implements IKeyringWallet {

  /**
   * The type of this wallet.
   */
  readonly type = KeyringWalletType.MultiKeyWallet;

  /**
   * Unique identifier for this wallet instance.
   */
  readonly id = this.type + (++SID);

  /**
   * List of asset types supported by this wallet.
   */
  readonly supportedAssets = [];

  /**
   * Array of SimpleKeyring instances, each managing a single private key.
   */
  private keyRings: SimpleKeyring[];

  /**
   * The network this wallet operates on.
   */
  private network: KeyringNetwork;

  /**
   * The label for this wallet.
   */
  private label: string;

  /**
   * Creates a new wallet instance.
   * @param network - The network to operate on
   * @param label - The label for the wallet
   */
  create (network: KeyringNetwork, label: string) {
    this.deserialize({ type: this.type, label, network });
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
      network: this.network,
      supportedAssets: this.supportedAssets,
      accounts: this.getAccounts().map(a => {
        return {
          address: a.getAddress(),
          label: a.getLabel()
        }
      })
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
      accounts: this.keyRings.map(k => k.getAccounts()[0].serialize(true))
    }
  }

  /**
   * Deserializes wallet data from storage.
   * @param data - The serialized wallet data to restore
   */
  deserialize (data: KeyringWalletSerialized) {
    this.label = data.label;
    this.network = data.network;
    this.keyRings = [];

    if (data.accounts && data.accounts.length) {
      data.accounts.forEach(a => this.importAccount(a.privateKey, a.label));
    }

    if (this.network === KeyringNetwork.Ethereum) {
      this.supportedAssets.push(KeyringAssetType.ETH);
      this.supportedAssets.push(KeyringAssetType.ERC20);
    }
    else if (this.network === KeyringNetwork.Constellation) {
      this.supportedAssets.push(KeyringAssetType.DAG);
    }
  }

  /**
   * Imports an account using a private key.
   * @param secret - The private key to import
   * @param label - The label for the account
   * @returns The imported account
   */
  importAccount (secret: string, label: string): IKeyringAccount {
    const keyring = new SimpleKeyring();
    keyring.deserialize({network: this.network, accounts: [{ privateKey: secret, label }]});
    this.keyRings.push(keyring);
    return keyring.getAccounts()[0];
  }

  /**
   * Gets all accounts managed by this wallet.
   * @returns Array of accounts
   */
  getAccounts (): IKeyringAccount[] {
    return this.keyRings.reduce<IKeyringAccount[]>((res, w) => res.concat(w.getAccounts()), []);
  }

  /**
   * Gets an account by its address.
   * @param address - The address to look up
   * @returns The account if found, undefined otherwise
   */
  getAccountByAddress (address: string): IKeyringAccount {
    let account: IKeyringAccount;
    this.keyRings.some(w => account = w.getAccountByAddress(address));
    return account;
  }

  /**
   * Attempts to remove an account from the wallet.
   * This method is not supported in MultiKeyWallet and does nothing.
   * @param account - The account to remove
   */
  removeAccount (account: IKeyringAccount) {
    //Does not support removing account
  }

  /**
   * Attempts to export the secret key.
   * This method is not supported in MultiKeyWallet and will throw an error.
   * @throws Error indicating that exportSecretKey is not supported
   * @returns Never returns due to throwing an error
   */
  exportSecretKey(): string {
    throw new Error('MultiKeyWallet does not allow exportSecretKey');
  }
}
