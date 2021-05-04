import {hdkey} from 'ethereumjs-wallet'
import EthereumHDKey from 'ethereumjs-wallet/dist/hdkey';
import * as bip39 from 'ethereum-cryptography/bip39';
import { wordlist } from 'ethereum-cryptography/bip39/wordlists/english';
import {keyringRegistry} from '../keyring-registry';
import {KeyringNetwork, IKeyring, IKeyringAccount, KeyringAssetInfo} from '../kcs';

export type HdKeyringSerializedData = {
  network: KeyringNetwork, accountLabelPrefix?: string, hdPath: string, mnemonic: string, numberOfAccounts: number
}

export class HdKeyring implements IKeyring {

  private accounts: IKeyringAccount[] = [];

  private hdPath: string;
  private mnemonic: string;
  private rootKey: EthereumHDKey;
  private network: KeyringNetwork;

  static generateMnemonic() {
    return bip39.generateMnemonic(wordlist);
  }

  static validateMnemonic (phrase: string) {
    return bip39.validateMnemonic(phrase, wordlist);
  }

  static createFromSeed(mnemonic: string, hdPath: string, network: KeyringNetwork, numberOfAccounts = 1) {
    const inst = new HdKeyring();
    inst.deserialize({network, hdPath, mnemonic, numberOfAccounts});
    return inst;
  }

  getNetwork () {
    return this.network;
  }

  getAssetTypes () {
    if (this.accounts.length === 1) {
      return this.accounts[0].getAssetTypes();
    }
    return null;
  }

  getAssetList () {
    if (this.accounts.length === 1) {
      return this.accounts[0].getAssetList();
    }
    return null;
  }

  // serialize (): HdKeyringSerializedData {
  //   return {
  //     mnemonic: this.mnemonic,
  //     network: this.network,
  //     numberOfAccounts: this.accounts.length,
  //     hdPath: this.hdPath,
  //   }
  // }

  deserialize (data: HdKeyringSerializedData) {
    if (data) {
      this.accounts = []
      this.hdPath = data.hdPath;
      this.network = data.network;
      this._initFromMnemonic(data.mnemonic);
      this.addAccounts(data.numberOfAccounts);
    }
  }

  addAccounts (numberOfAccounts = 1) {
    if (!this.rootKey) {
      this._initFromMnemonic(bip39.generateMnemonic(wordlist))
    }

    const oldLen = this.accounts.length
    //const newAccounts = []
    for (let i = oldLen; i < numberOfAccounts + oldLen; i++) {
      const child = this.rootKey.deriveChild(i)
      const wallet = child.getWallet()
      //newAccounts.push(wallet)
      this.accounts.push(this.newAccount(wallet.getPrivateKey().toString('hex')))
    }
    //return newAccounts.map((w) => w.getAddressString());
  }

  getAssets () {
    this.accounts.reduce<KeyringAssetInfo[]>((res, a) => res.concat(a.getAssetList()), []);
  }

  getAccounts() {
    return this.accounts;
  }

  /* PRIVATE METHODS */

  private newAccount (privateKey: string) {
    // const prefix = (this.accountLabelPrefix || 'Account') + ' #';
    // const label = prefix + (this.accounts.length + 1);
    return keyringRegistry.createAccount(this.network).deserialize({ privateKey });
  }

  private _initFromMnemonic (mnemonic) {
    this.mnemonic = mnemonic
    const seedBytes = bip39.mnemonicToSeedSync(mnemonic)
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

