import {BIP_44_PATHS, HdKeyring, SimpleKeyring} from '../rings';
import {
  IKeyringWallet,
  IKeyringAccount,
  KeyringAssetType,
  KeyringNetwork,
  KeyringWalletSerialized,
  KeyringWalletType, KeyringAssetInfo
} from '../kcs';
import {BIP39_WORD_COUNT, Bip39Helper} from '../bip39-helper';

let SID = 0;

export class MultiAccountWallet implements IKeyringWallet {

  readonly type = KeyringWalletType.MultiAccountWallet;
  readonly id = this.type + (++SID);
  readonly supportedAssets = [];

  private label: string;
  private keyring: HdKeyring;
  private mnemonic: string;
  private network: KeyringNetwork;

  create (network: KeyringNetwork, mnemonic: string | BIP39_WORD_COUNT, label: string, numOfAccounts = 1) {
    if (mnemonic) {
      if (typeof(mnemonic) === 'number') {
        mnemonic = Bip39Helper.generateMnemonic(mnemonic);
      }
    }
    else {
      mnemonic = Bip39Helper.generateMnemonic();
    }

    this.deserialize({ secret: mnemonic, type: this.type, label, network, numOfAccounts })
  }

  setLabel(val: string) {
    this.label = val;
  }

  getLabel(): string {
    return this.label;
  }

  getNetwork () {
    return this.network;
  }

  getState () {
    return {
      id: this.id,
      type: this.type,
      label: this.label,
      supportedAssets: this.supportedAssets,
      accounts: this.getAccounts().map(a => a.getState())
    }
  }

  serialize (): KeyringWalletSerialized {
    return {
      type: this.type,
      label: this.label,
      network: this.network,
      secret: this.exportSecretKey(),
      rings: [this.keyring.serialize()]
    }
  }

  deserialize (data: KeyringWalletSerialized) {
    this.label = data.label;
    this.network = data.network || KeyringNetwork.Ethereum;
    this.mnemonic = data.secret;

    let bip44Path: string;

    if (this.network === KeyringNetwork.Constellation) {
      this.supportedAssets.push(KeyringAssetType.DAG);
      bip44Path = BIP_44_PATHS.CONSTELLATION_PATH;
    }
    else {
      this.supportedAssets.push(KeyringAssetType.ETH);
      this.supportedAssets.push(KeyringAssetType.ERC20);
      bip44Path = BIP_44_PATHS.ETH_WALLET_PATH;
    }

    this.keyring = HdKeyring.create(this.mnemonic, bip44Path, this.network, data.numOfAccounts);

    if (data.rings) {
      this.keyring.deserialize(data.rings[0]);
    }
  }

  importAccount (hdPath: string, label: string) {
    throw new Error('MultiAccountWallet does not support importAccount');
    return null;
  }

  // getAssets (): string[] {
  //   return this.keyrings.reduce<string[]>((res, w) => res.concat(w.getAssetList()), []);
  // }

  getAccounts (): IKeyringAccount[] {
    return this.keyring.getAccounts();
  }

  getAccountByAddress (address: string): IKeyringAccount {
    return this.keyring.getAccountByAddress(address);
  }

  addAccount () {
    this.keyring.addAccountAt();
  }

  // addAccount () {
  //   let index = 0;
  //   this.getAccounts().every(a => {
  //     if (a.getBip44Index() === index) {
  //       index++;
  //       return true;
  //     }
  //   })
  //   this.keyring.addAccountAt(index);
  // }

  setNumOfAccounts(num: number) {
    this.keyring = HdKeyring.create(this.mnemonic, this.keyring.getHdPath(), this.network, num);
  }

  removeAccount (account: IKeyringAccount) {
    this.keyring.removeAccount(account);
  }

  exportSecretKey () {
    return this.mnemonic;
  }

}
