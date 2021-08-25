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
import {deserialize} from "v8";

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
  static createFromExtendedKey(extendedKey: string, network: KeyringNetwork, numberOfAccounts: number) {
    const inst = new HdKeyring();
    inst.extendedKey = extendedKey;
    inst._initFromExtendedKey(extendedKey);
    inst.deserialize({ network, accounts: inst.createAccounts(numberOfAccounts) });
    return inst;
  }

  static create(mnemonic: string, hdPath: string, network: KeyringNetwork, numberOfAccounts: number) {
    const inst = new HdKeyring();
    inst.mnemonic = mnemonic;
    inst.hdPath = hdPath;
    inst._initFromMnemonic(mnemonic);
    inst.deserialize({ network, accounts: inst.createAccounts(numberOfAccounts) });
    return inst;
  }

  getNetwork () {
    return this.network;
  }

  getHdPath () {
    return this.hdPath;
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
      accounts: this.accounts.map(a => a.serialize(false))
    }
  }

  deserialize (data: KeyringRingSerialized) {
    if (data) {
      this.network = data.network;
      this.accounts = [];
      data.accounts.forEach((d, i) => {
        this.accounts[i] = this.addAccountAt(d.bip44Index);
        this.accounts[i].setTokens(d.tokens)
      })
    }
  }

  //When adding an account (after accounts have been removed), it will add back the ones removed first
  private createAccounts (numberOfAccounts = 0) {

    const accounts:KeyringAccountSerialized[] = [];
    for (let i = 0; i < numberOfAccounts; i++) {
      accounts[i] = { bip44Index: i }
    }

    return accounts;
  }

  removeLastAddedAccount () {
    this.accounts.pop();
  }

  addAccountAt (index?: number) {
    index = index >=0 ? index : this.accounts.length;

    if (this.accounts[index]) {
      throw new Error('HdKeyring - Trying to add an account to an index already populated')
    }

    let account: IKeyringAccount;
    const child = this.rootKey.deriveChild(index);
    const wallet = child.getWallet();
    if (this.mnemonic) {
      const privateKey = wallet.getPrivateKey().toString('hex');
      account = keyringRegistry.createAccount(this.network).deserialize({privateKey, bip44Index: index});
    } else {
      const publicKey = wallet.getPublicKey().toString('hex');
      account = keyringRegistry.createAccount(this.network).deserialize({publicKey, bip44Index: index});
    }

    this.accounts[index] = account;

    return account;
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
    return this.accounts.find(a => a.getAddress().toLowerCase() === address.toLowerCase());
  }

  removeAccount (account:IKeyringAccount) {
    this.accounts = this.accounts.filter(a => a === account);
  }
}

