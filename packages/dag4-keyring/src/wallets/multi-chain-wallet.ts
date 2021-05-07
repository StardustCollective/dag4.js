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

//Wallet : multiple networks, 1 seed
//  Ring : 1 network, multiple accounts
//    Account : 1 account, multiple tokens
//      Token  : 1 token      Lattice Token

//Wallet
//    rings: { network, accounts[] }[]
//      accounts: { address, tokens[] }[]
//        tokens: { address }[]

// MCW: { rings[N].accounts[1].tokens } - Trust, Ring and network are hard-coded on ring-level
// SCW: { rings[1].accounts[N].tokens } - MetaMask, network is configured on wallet and same for all accounts
//NOTE: Therefore we can collapse rings:accounts -> accounts and let each strategy determine how to deserialize accounts[]
// Ring and network are hard-coded

let SID = 0;

export class MultiChainWallet implements IKeyringWallet {

  readonly type = KeyringWalletType.MultiChainWallet;
  readonly id = this.type + (++SID);
  readonly supportedAssets = [KeyringAssetType.DAG,KeyringAssetType.ETH,KeyringAssetType.ERC20];

  private label: string;
  private keyrings: HdKeyring[] = [];
  private mnemonic: string;

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
          tokens: a.getTokens()
        }
      })
    }
  }

  serialize (): KeyringWalletSerialized {
    return {
      type: this.type,
      label: this.label,
      secret: this.mnemonic,
      rings: this.keyrings.map(ring => ring.serialize())
    }
  }

  deserialize (data: KeyringWalletSerialized) {
    this.label = data.label;
    this.mnemonic = data.secret;
    this.keyrings = [
      HdKeyring.create(this.mnemonic, CONSTANTS.BIP_44_DAG_PATH, KeyringNetwork.Constellation, 1),
      HdKeyring.create(this.mnemonic, CONSTANTS.BIP_44_ETH_PATH, KeyringNetwork.Ethereum, 1)
    ];
    if (data.rings) {
      data.rings.forEach((r,i) => this.keyrings[i].deserialize(r))
    }
  }

  addKeyring (hdPath: string) {
    throw new Error('MultiChainWallet does not allow dynamically adding new keyrings');
  }

  // getAssets (): string[] {
  //   return this.keyrings.reduce<string[]>((res, w) => res.concat(w.getAssetList()), []);
  // }

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
