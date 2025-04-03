import {SimpleKeyring} from '../rings';
import {
  IKeyringAccount,
  IKeyringWallet,
  KeyringAssetType,
  KeyringNetwork,
  KeyringWalletSerialized,
  KeyringWalletType
} from '../kcs';
import Wallet from "ethereumjs-wallet";

let SID = 0;

/**
 * A wallet implementation that manages a single account.
 * This wallet type is designed for simple use cases where only one account is needed.
 * It uses a SimpleKeyring internally to manage the account.
 */
export class SingleAccountWallet implements IKeyringWallet {

  /**
   * The type of this wallet.
   */
  readonly type = KeyringWalletType.SingleAccountWallet;

  /**
   * Unique identifier for this wallet instance.
   */
  readonly id = this.type + (++SID);

  /**
   * List of asset types supported by this wallet.
   */
  readonly supportedAssets = [];

  /**
   * The keyring instance managing the account.
   */
  private keyring: SimpleKeyring;

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
   * @param network - The network to create the wallet for
   * @param privateKey - The private key for the account (optional, will generate one if not provided)
   * @param label - The label for the wallet
   */
  create (network: KeyringNetwork, privateKey: string, label: string) {
    if (!privateKey) {
      privateKey = Wallet.generate().getPrivateKey().toString('hex');
    }
    this.deserialize({ type: this.type, label, network, secret: privateKey });
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
   * @returns The network
   */
  getNetwork () {
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
      accounts: this.getAccounts().map(a => {
        return {
          address: a.getAddress(),
          network: a.getNetwork(),
          tokens: a.getTokens()
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
      secret: this.exportSecretKey()
    }
  }

  /**
   * Deserializes wallet data from storage.
   * @param data - The serialized wallet data to restore
   */
  deserialize (data: KeyringWalletSerialized) {
    this.label = data.label;
    this.network = data.network || KeyringNetwork.Ethereum;
    this.keyring = new SimpleKeyring();

    this.keyring.deserialize({network: this.network, accounts: [{ privateKey: data.secret }]});

    if (this.network === KeyringNetwork.Ethereum) {
      this.supportedAssets.push(KeyringAssetType.ETH);
      this.supportedAssets.push(KeyringAssetType.ERC20);
    }
    else if (this.network === KeyringNetwork.Constellation) {
      this.supportedAssets.push(KeyringAssetType.DAG);
    }
  }

  /**
   * Attempts to import an account using a secret.
   * This method is not supported in SingleAccountWallet and will throw an error.
   * @param secret - The secret to import
   * @param label - The label for the account
   * @throws Error indicating that importAccount is not supported
   * @returns Never returns due to throwing an error
   */
  importAccount (secret: string, label: string): IKeyringAccount {
    throw new Error('SimpleChainWallet does not support importAccount');
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
   * @returns The account if found, null otherwise
   */
  getAccountByAddress (address: string): IKeyringAccount {
    return this.keyring.getAccountByAddress(address);
  }

  /**
   * Attempts to remove an account from the wallet.
   * This method is not supported in SingleAccountWallet.
   * @param account - The account to remove
   */
  removeAccount (account: IKeyringAccount) {
    //Does not support removing account
  }

  /**
   * Exports the secret key of the account.
   * @returns The private key as a hex string
   */
  exportSecretKey(): string {
    return this.keyring.getAccounts()[0].getPrivateKey();
  }

  /**
   * Resets the SID counter used for generating wallet IDs.
   * This is primarily used for testing purposes.
   */
  resetSid() {
    SID = 0;
  }
}
