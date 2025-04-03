import {keyringRegistry} from '../keyring-registry';
import {KeyringNetwork, IKeyring, IKeyringAccount, KeyringAccountSerialized, KeyringRingSerialized} from '../kcs';

// export type SimpleKeyringState = {
//   accountType: KeyringNetwork, account?: KeyringAccountSerialized
// }

/**
 * A simple keyring implementation that manages a single account.
 * This keyring is designed for basic use cases where only one account is needed.
 */
export class SimpleKeyring implements IKeyring {

  /**
   * The account managed by this keyring.
   */
  private account: IKeyringAccount;

  /**
   * The network this keyring operates on.
   */
  private network: KeyringNetwork;

  /**
   * Creates a new SimpleKeyring instance.
   */
  constructor () {
    // super()
  }

  /**
   * Creates a new SimpleKeyring instance for a specific network with a given private key.
   * @param network - The network to create the keyring for
   * @param privateKey - The private key for the account
   * @returns A new SimpleKeyring instance
   */
  static createForNetwork (network: KeyringNetwork, privateKey: string) {
    const inst = new SimpleKeyring();
    inst.network = network;
    inst.account = keyringRegistry.createAccount(network).create(privateKey);
    return inst;
  }

  /**
   * Gets the current state of the keyring.
   * @returns An object containing the network and serialized account
   */
  getState () {
    return {
      network: this.network,
      account: this.account.serialize(false)
    };
  }

  /**
   * Serializes the keyring data for storage.
   * @returns The serialized keyring data
   */
  serialize (): KeyringRingSerialized {
    return {
      network: this.network,
      accounts: [this.account.serialize(true)]
    };
  }

  /**
   * Deserializes keyring data from storage.
   * @param data - The serialized keyring data to restore
   */
  deserialize ({network, accounts}: KeyringRingSerialized) {
    this.network = network;
    this.account = keyringRegistry.createAccount(network).deserialize(accounts[0]);
  }

  /**
   * Attempts to add an account at the specified index.
   * This method is not supported in SimpleKeyring and will throw an error.
   * @param index - The index at which to add the account
   */
  addAccountAt (index?: number) {
    //throw error
  }

  /**
   * Gets all accounts managed by this keyring.
   * @returns An array containing the single account
   */
  getAccounts () {
    return [this.account];
  }

  /**
   * Gets an account by its address.
   * @param address - The address to look up
   * @returns The account if found, null otherwise
   */
  getAccountByAddress (address: string) {
    return address === this.account.getAddress() ? this.account : null;
  }

  /**
   * Attempts to remove an account from the keyring.
   * This method is not supported in SimpleKeyring and will throw an error.
   * @param account - The account to remove
   */
  removeAccount (account: IKeyringAccount) {
    //throw error
  }

}

