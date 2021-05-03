import {HdKeyring} from '../rings';
import {IKeyringWallet, IKeyringAccount, KeyringAssetType, KeyringNetwork, KeyringWalletSerialized, KeyringWalletType} from '../kcs';

const CONSTELLATION_COIN = 1137;
const ETH_WALLET_PATH = 60;

const CONSTANTS = {
  BIP_44_DAG_PATH: `m/44'/${CONSTELLATION_COIN}'/0'/0`,
  BIP_44_ETH_PATH: `m/44'/${ETH_WALLET_PATH}'/0'/0`,            //MetaMask and Trezor
  BIP_44_ETH_PATH_LEDGER: `m/44'/${ETH_WALLET_PATH}'`,          //Ledger Live
}

export enum DERIVATION_PATH {
  DAG,
  ETH,
  ETH_LEDGER
}

const DERIVATION_PATH_MAP = {
  [DERIVATION_PATH.DAG]: CONSTANTS.BIP_44_DAG_PATH,
  [DERIVATION_PATH.ETH]: CONSTANTS.BIP_44_ETH_PATH,
  [DERIVATION_PATH.ETH_LEDGER]: CONSTANTS.BIP_44_ETH_PATH_LEDGER
}

// type MemoryState = {
//   type: string, label: string
// }

// type SerializedData = {
//   type: string, label: string, mnemonic?: string
// }

let SID = 0;

export class MultiChainWallet implements IKeyringWallet {

  readonly type = KeyringWalletType.MultiChainWallet;
  readonly id = this.type + (++SID);
  readonly supportAssets = [KeyringAssetType.DAG,KeyringAssetType.ETH,KeyringAssetType.ERC20];

  private label: string;
  private keyrings: HdKeyring[] = [];
  private mnemonic: string;

  constructor () {

  }

  create (label: string, mnemonic: string) {
    mnemonic = mnemonic || HdKeyring.generateMnemonic();
    this.deserialize({ secret: mnemonic, type: this.type, label })
  }

  getState () {
    return {
      id: this.id,
      type: this.type,
      label: this.label,
      supportAssets: this.supportAssets,
      accounts: this.getAccounts().map(a => a.getState())
    }
  }

  serialize (includeSecrets = false): KeyringWalletSerialized {
    return {
      type: this.type,
      label: this.label,
      secret: this.mnemonic
    }
  }

  deserialize (data: KeyringWalletSerialized) {
    this.label = data.label;
    this.mnemonic = data.secret;
    this.keyrings = [
      HdKeyring.createFromSeed(this.mnemonic, CONSTANTS.BIP_44_DAG_PATH, KeyringNetwork.Constellation, 1, 'Constellation'),
      HdKeyring.createFromSeed(this.mnemonic, CONSTANTS.BIP_44_ETH_PATH, KeyringNetwork.Ethereum, 1, 'Ethereum')
    ];
  }

  addKeyring (hdPath: string) {
    throw new Error('MultiChainWallet does not allow dynamically adding new keyrings');
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
