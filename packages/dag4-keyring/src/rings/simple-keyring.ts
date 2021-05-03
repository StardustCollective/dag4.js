
import {keyringRegistry} from '../keyring-registry';
import {KeyringNetwork, IKeyring, IKeyringAccount, KeyringAccountSerialized} from '../kcs';

export type SimpleKeyringState = {
  accountType: KeyringNetwork, account?: KeyringAccountSerialized
}

//extends EventEmitter
export class SimpleKeyring implements IKeyring {

  private account: IKeyringAccount;
  private accountType: KeyringNetwork;

  constructor () {
    // super()
  }

  static createForNetwork (network: KeyringNetwork, privateKey: string, label: string) {
    const inst = new SimpleKeyring();
    inst.accountType = network;
    inst.account = keyringRegistry.createAccount(network).create(privateKey, label);
    return inst;
  }

  getState () {
    return {
      accountType: this.accountType,
      account: this.account.serialize()
    };
  }

  serialize (): SimpleKeyringState {
    return {
      accountType: this.accountType,
      account: this.account.serialize()
    };
  }

  deserialize ({accountType, account}: SimpleKeyringState) {
    this.accountType = accountType;
    this.account = keyringRegistry.createAccount(accountType).deserialize({ label: accountType, ...account});
  }

  addAccounts (n = 1) {
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

