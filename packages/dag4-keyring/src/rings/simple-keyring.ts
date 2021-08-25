
import {keyringRegistry} from '../keyring-registry';
import {KeyringNetwork, IKeyring, IKeyringAccount, KeyringAccountSerialized, KeyringRingSerialized} from '../kcs';

// export type SimpleKeyringState = {
//   accountType: KeyringNetwork, account?: KeyringAccountSerialized
// }

//extends EventEmitter
export class SimpleKeyring implements IKeyring {

  private account: IKeyringAccount;
  private network: KeyringNetwork;

  constructor () {
    // super()
  }

  static createForNetwork (network: KeyringNetwork, privateKey: string) {
    const inst = new SimpleKeyring();
    inst.network = network;
    inst.account = keyringRegistry.createAccount(network).create(privateKey);
    return inst;
  }

  getState () {
    return {
      network: this.network,
      account: this.account.serialize(false)
    };
  }

  serialize (): KeyringRingSerialized {
    return {
      network: this.network,
      accounts: [this.account.serialize(true)]
    };
  }

  deserialize ({network, accounts}: KeyringRingSerialized) {
    this.network = network;
    this.account = keyringRegistry.createAccount(network).deserialize(accounts[0]);
  }

  addAccountAt (index?: number) {
    //throw error
  }

  getAccounts () {
    return [this.account];
  }

  getAccountByAddress (address: string) {
    return address === this.account.getAddress() ? this.account : null;
  }

  removeAccount (account: IKeyringAccount) {
    //throw error
  }

}

