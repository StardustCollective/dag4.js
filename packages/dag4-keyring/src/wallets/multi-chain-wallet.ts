import {HdKeyring} from '../rings';
import {
  IKeyringWallet,
  IKeyringAccount,
  KeyringAssetType,
  KeyringNetwork,
  KeyringWalletSerialized,
  KeyringWalletType, KeyringAssetInfo
} from '../kcs';
import {Bip39Helper} from '../bip39-helper';

const CONSTELLATION_COIN = 1137;
const ETH_WALLET_PATH = 60;

const CONSTANTS = {
  BIP_44_DAG_PATH: `m/44'/${CONSTELLATION_COIN}'/0'/0`,
  BIP_44_ETH_PATH: `m/44'/${ETH_WALLET_PATH}'/0'/0`,            //MetaMask and Trezor
  BIP_44_ETH_PATH_LEDGER: `m/44'/${ETH_WALLET_PATH}'`,          //Ledger Live
}

//Wallet : Label
//  Ring : Network  Ethereum
//    Account           Ethereum
//      Token             Lattice Token

let SID = 0;

export class MultiChainWallet implements IKeyringWallet {

  readonly type = KeyringWalletType.MultiChainWallet;
  readonly id = this.type + (++SID);
  readonly supportedAssets = [KeyringAssetType.DAG,KeyringAssetType.ETH,KeyringAssetType.ERC20];

  private label: string;
  private keyrings: HdKeyring[] = [];
  private mnemonic: string;

  constructor () {

  }

  create (label: string, mnemonic: string) {
    mnemonic = mnemonic || Bip39Helper.generateMnemonic();
    this.deserialize({ secret: mnemonic, type: this.type, label })
  }

  setLabel(val: string) {
    this.label = val;
  }

  getState () {
    return {
      id: this.id,
      type: this.type,
      label: this.label,
      supportedAssets: this.supportedAssets,
      accounts: this.getAccounts().map(a => {
        return {
          address: a.getAddress(),
          network: a.getNetwork(),
          assets: a.getAssetList()
        }
      })
    }
  }

  serialize (): KeyringWalletSerialized {
    return {
      type: this.type,
      label: this.label,
      secret: this.mnemonic,
      accounts: this.keyrings.map(ring => ({network: ring.getNetwork(), tokens: ring.getAssetTypes()}))
    }
  }

  deserialize (data: KeyringWalletSerialized) {
    this.label = data.label;
    this.mnemonic = data.secret;
    this.keyrings = [
      HdKeyring.createFromSeed(this.mnemonic, CONSTANTS.BIP_44_DAG_PATH, KeyringNetwork.Constellation, 1),
      HdKeyring.createFromSeed(this.mnemonic, CONSTANTS.BIP_44_ETH_PATH, KeyringNetwork.Ethereum, 1)
    ];
    if (data.accounts) {

    }
  }

  addKeyring (hdPath: string) {
    throw new Error('MultiChainWallet does not allow dynamically adding new keyrings');
  }

  getAssets (): KeyringAssetInfo[] {
    return this.keyrings.reduce<KeyringAssetInfo[]>((res, w) => res.concat(w.getAssetList()), []);
  }

  getAccounts (): IKeyringAccount[] {
    return this.keyrings.reduce<IKeyringAccount[]>((res, w) => res.concat(w.getAccounts()), []);
  }

  getAccountByAddress (address: string): IKeyringAccount {
    let account: IKeyringAccount;
    this.keyrings.some(w => account = w.getAccountByAddress(address));
    return account;
  }

  removeAccount (account: IKeyringAccount) {
    throw new Error('MultiChainWallet does not allow removing accounts');
  }

  exportSecretKey () {
    return this.mnemonic;
  }

}
