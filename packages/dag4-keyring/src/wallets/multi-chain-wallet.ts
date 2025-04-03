import {BIP_44_PATHS, HdKeyring} from '../rings';
import {
  IKeyringWallet,
  IKeyringAccount,
  KeyringAssetType,
  KeyringNetwork,
  KeyringWalletSerialized,
  KeyringWalletType
} from '../kcs';

import {Bip39Helper} from '../bip39-helper';

let SID = 0;

/**
 * A wallet implementation that supports multiple blockchain networks.
 * This wallet type manages accounts across different networks (e.g., Ethereum and Constellation)
 * using HD keyrings for each network.
 */
export class MultiChainWallet implements IKeyringWallet {

  /**
   * The type of this wallet.
   */
  readonly type = KeyringWalletType.MultiChainWallet;

  /**
   * Unique identifier for this wallet instance.
   */
  readonly id = this.type + (++SID);

  /**
   * List of asset types supported by this wallet.
   */
  readonly supportedAssets = [KeyringAssetType.DAG, KeyringAssetType.ETH, KeyringAssetType.ERC20];

  /**
   * The label for this wallet.
   */
  private label: string;

  /**
   * List of HD keyrings, one for each supported network.
   */
  private keyrings: HdKeyring[] = [];

  /**
   * The mnemonic phrase used to generate keys for all networks.
   */
  private mnemonic: string;

  /**
   * Creates a new wallet instance.
   * @param label - The label for the wallet
   * @param mnemonic - The mnemonic phrase (optional, will generate one if not provided)
   */
  create (label: string, mnemonic: string) {
    mnemonic = mnemonic || Bip39Helper.generateMnemonic();
    this.deserialize({ secret: mnemonic, type: this.type, label })
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
   * This method is not supported in MultiChainWallet as it operates on multiple networks.
   * @throws Error indicating that this method is not supported
   * @returns Never returns due to throwing an error
   */
  getNetwork (): string {
    throw new Error('MultiChainWallet does not support this method');
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
      secret: this.mnemonic,
      rings: this.keyrings.map(ring => ring.serialize())
    }
  }

  /**
   * Deserializes wallet data from storage.
   * @param data - The serialized wallet data to restore
   */
  deserialize (data: KeyringWalletSerialized) {
    this.label = data.label;
    this.mnemonic = data.secret;
    this.keyrings = [
      HdKeyring.create(this.mnemonic, BIP_44_PATHS.CONSTELLATION_PATH, KeyringNetwork.Constellation, 1),
      HdKeyring.create(this.mnemonic, BIP_44_PATHS.ETH_WALLET_PATH, KeyringNetwork.Ethereum, 1)
    ];
    if (data.rings) {
      data.rings.forEach((r,i) => this.keyrings[i].deserialize(r))
    }
  }

  /**
   * Attempts to import an account using an HD path.
   * This method is not supported in MultiChainWallet and will throw an error.
   * @param hdPath - The HD derivation path
   * @param label - The label for the account
   * @throws Error indicating that importAccount is not supported
   * @returns Never returns due to throwing an error
   */
  importAccount (hdPath: string, label: string): IKeyringAccount {
    throw new Error('MultiChainWallet does not support importAccount');
  }

  /**
   * Gets all accounts managed by this wallet across all networks.
   * @returns Array of accounts
   */
  getAccounts (): IKeyringAccount[] {
    return this.keyrings.reduce<IKeyringAccount[]>((res, w) => res.concat(w.getAccounts()), []);
  }

  /**
   * Gets an account by its address.
   * @param address - The address to look up
   * @returns The account if found, undefined otherwise
   */
  getAccountByAddress (address: string): IKeyringAccount {
    let account: IKeyringAccount;
    this.keyrings.some(w => account = w.getAccountByAddress(address));
    return account;
  }

  /**
   * Attempts to remove an account from the wallet.
   * This method is not supported in MultiChainWallet and will throw an error.
   * @param account - The account to remove
   * @throws Error indicating that removing accounts is not allowed
   */
  removeAccount (account: IKeyringAccount) {
    throw new Error('MultiChainWallet does not allow removing accounts');
  }

  /**
   * Exports the mnemonic phrase used by this wallet.
   * @returns The mnemonic phrase
   */
  exportSecretKey () {
    return this.mnemonic;
  }

  /**
   * Resets the SID counter used for generating wallet IDs.
   * This is primarily used for testing purposes.
   */
  resetSid() {
    SID = 0;
  }
}
