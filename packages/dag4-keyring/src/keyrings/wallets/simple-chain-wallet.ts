import {IKeyringAccount} from '../keyring-account';
import {SimpleKeyring, SimpleKeyringState} from '../rings';
import {IKeyringChainWallet, KeyringChainId, KeyringChainWalletId} from '../kcs';

type SerializedData = {
  type: string, keyring: SimpleKeyringState, accountType: KeyringChainId
}

export class SimpleChainWallet implements IKeyringChainWallet {

  type = KeyringChainWalletId.SimpleChainWallet;

  private keyring: SimpleKeyring;
  private accountType: KeyringChainId;

  constructor () {
    this.deserialize();
  }

  serialize (): SerializedData {
    return {
      type: this.type,
      accountType: this.accountType,
      keyring: this.keyring.serialize()
    }
  }

  deserialize (data = {} as SerializedData) {
    this.accountType = data.accountType;
    this.keyring = new SimpleKeyring();
    this.keyring.deserialize({accountType: data.accountType, account: data.keyring.account})
  }

  addKeyring (hdPath: string) {
    throw new Error('SimpleChainWallet does not allow dynamically adding new Keyrings');
  }

  getAccounts (): IKeyringAccount[] {
    return this.keyring.getAccounts();
  }

  getAccountByAddress (address: string): IKeyringAccount {
    return this.keyring.getAccountByAddress(address);
  }

  removeAccount (account: IKeyringAccount) {
    //Does not support removing account
  }

}
