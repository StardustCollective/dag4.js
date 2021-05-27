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

const CONSTELLATION_PATH_INDEX = 1137;
const ETH_WALLET_PATH_INDEX = 60;

export const BIP_44_PATHS = {
  CONSTELLATION_PATH: `m/44'/${CONSTELLATION_PATH_INDEX}'/0'/0`,
  ETH_WALLET_PATH: `m/44'/${ETH_WALLET_PATH_INDEX}'/0'/0`,            //MetaMask and Trezor
  ETH_WALLET_LEDGER_PATH: `m/44'/${ETH_WALLET_PATH_INDEX}'`,          //Ledger Live
}

//NOTE: Ring determines the secret implementation: seed or privateKey
//Hd Ring creates accounts based on Hierarchical Deterministics
export class HdKeyring implements IKeyring {

  private accounts: IKeyringAccount[] = [];

  private hdPath: string;
  private mnemonic: string;
  private extendedKey: string;
  private rootKey: EthereumHDKey;
  private network: KeyringNetwork;

  //Read-only wallet
  static createFromExtendedKey(extendedKey: string, network: KeyringNetwork, numberOfAccounts = 1) {
    const inst = new HdKeyring();
    inst.extendedKey = extendedKey;
    inst.network = network;
    inst._initFromExtendedKey(extendedKey);
    inst.addAccounts(numberOfAccounts);
    return inst;
  }

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

  getExtendedPublicKey () {
    if (this.mnemonic) {
      return this.rootKey.publicExtendedKey().toString('hex');
    }

    return this.extendedKey;
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

    let account: IKeyringAccount;
    const oldLen = this.accounts.length;
    for (let i = oldLen; i < numberOfAccounts + oldLen; i++) {
      const child = this.rootKey.deriveChild(i);
      const wallet = child.getWallet();
      if (this.mnemonic) {
        const privateKey = wallet.getPrivateKey().toString('hex');
        account = keyringRegistry.createAccount(this.network).deserialize({privateKey});
      }
      else {
        const publicKey = wallet.getPublicKey().toString('hex');
        account = keyringRegistry.createAccount(this.network).deserialize({publicKey});
      }
      this.accounts[i] = account;
    }
  }

  removeLastAddedAccount () {
    this.accounts.pop();
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

  private _initFromExtendedKey (extendedKey: string) {
    this.extendedKey = extendedKey
    this.rootKey = hdkey.fromExtendedKey(extendedKey);
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

