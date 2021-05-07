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

// export type HdKeyringSerializedData = {
//   network: KeyringNetwork, accounts: { tokens: string[] }[]
// }

//NOTE: Ring determines the secret implementation: seed or privateKey
//Hd Ring creates accounts based on Hierarchical Deterministics
export class HdKeyring implements IKeyring {

  private accounts: IKeyringAccount[] = [];

  private hdPath: string;
  private mnemonic: string;
  private rootKey: EthereumHDKey;
  private network: KeyringNetwork;

  static create(mnemonic: string, hdPath: string, network: KeyringNetwork, numberOfAccounts = 1) {
    const inst = new HdKeyring();
    inst.mnemonic = mnemonic;
    inst.hdPath = hdPath;
    inst.network = network;
    inst._initFromMnemonic(mnemonic);
    inst.addAccounts(numberOfAccounts);
    return inst;
  }

  getNetwork () {
    return this.network;
  }

  serialize (): KeyringRingSerialized {
    return {
      network: this.network,
      accounts: this.accounts.map(a => ({ tokens: a.getTokens()}))
    }
  }

  deserialize (data: KeyringRingSerialized) {
    if (data) {
      this.network = data.network;
      data.accounts.forEach((d,i) => this.accounts[i].setTokens(d.tokens))
    }
  }

  addAccounts (numberOfAccounts = 1) {
    if (!this.rootKey) {
      this._initFromMnemonic(Bip39Helper.generateMnemonic())
    }

    const oldLen = this.accounts.length;
    for (let i = oldLen; i < numberOfAccounts + oldLen; i++) {
      const child = this.rootKey.deriveChild(i);
      const wallet = child.getWallet();
      const privateKey = wallet.getPrivateKey().toString('hex');
      const account = keyringRegistry.createAccount(this.network).deserialize({ privateKey });
      this.accounts[i] = account;
    }
  }

  getAccounts() {
    return this.accounts;
  }

  /* PRIVATE METHODS */

  private _initFromMnemonic (mnemonic) {
    this.mnemonic = mnemonic
    const seedBytes = Bip39Helper.mnemonicToSeedSync(mnemonic)
    const hdWallet = hdkey.fromMasterSeed(seedBytes)
    this.rootKey = hdWallet.derivePath(this.hdPath)
  }

  exportAccount (account:IKeyringAccount): string {
    return account.getPrivateKey();
  }

  getAccountByAddress (address: string): IKeyringAccount {
    return this.accounts.find(a => a.getAddress() === address);
  }

  removeAccount (account:IKeyringAccount) {
  }
}

