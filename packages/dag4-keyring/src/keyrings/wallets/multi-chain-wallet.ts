import {IKeyringAccount} from '../keyring-account';
import {HdKeyring} from '../rings';
import {IKeyringChainWallet, KeyringChainId, KeyringChainWalletId} from '../kcs';

const CONSTELLATION_COIN = 1137;
const ETH_WALLET_PATH = 60;

const CONSTANTS = {
  BIP_44_DAG_PATH: `m/44'/${CONSTELLATION_COIN}'/0'/0/`,
  BIP_44_ETH_PATH: `m/44'/${ETH_WALLET_PATH}'/0'/0/`,            //MetaMask and Trezor
  BIP_44_ETH_PATH_LEDGER: `m/44'/${ETH_WALLET_PATH}'/`,          //Ledger Live
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

type SerializedData = {
  type?: string, mnemonic: string
}

export class MultiChainWallet implements IKeyringChainWallet {

  readonly type = KeyringChainWalletId.MultiChainWallet;

  private keyrings: HdKeyring[] = [];
  private mnemonic: string;

  constructor () {
    this.deserialize();
  }

  serialize (): SerializedData {
    return {
      type: this.type,
      mnemonic: this.mnemonic
    }
  }

  deserialize (data = {} as SerializedData) {
    this.mnemonic = data.mnemonic || HdKeyring.generateMnemonic();
    this.keyrings = [
      HdKeyring.createFromSeed(this.mnemonic, CONSTANTS.BIP_44_DAG_PATH, KeyringChainId.Constellation, 1, 'Constellation'),
      HdKeyring.createFromSeed(this.mnemonic, CONSTANTS.BIP_44_ETH_PATH, KeyringChainId.Ethereum, 1, 'Ethereum')
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
    //Does not support removing account
  }

}
