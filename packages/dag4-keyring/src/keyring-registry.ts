import {IKeyringAccount, KeyringNetwork} from './kcs';

type Constructor<T> = new () => T;

/**
 * Registry for keyring account classes.
 * Manages the registration and creation of account classes for different networks.
 */
class KeyringRegistry {

  /**
   * Map of network IDs to account class constructors.
   */
  registry = new Map<string,Constructor<IKeyringAccount>>();

  /**
   * Registers an account class for a specific network.
   * @param id - The network identifier
   * @param clazz - The account class constructor
   */
  registerAccountClass (id: KeyringNetwork, clazz: Constructor<IKeyringAccount>) {
    this.registry.set(id, clazz);
  }

  /**
   * Creates a new account instance for the specified network.
   * @param id - The network identifier
   * @returns A new account instance
   */
  createAccount (id: KeyringNetwork) {
    const clazz = this.registry.get(id);

    return new clazz();
  }
}

export const keyringRegistry = new KeyringRegistry();

