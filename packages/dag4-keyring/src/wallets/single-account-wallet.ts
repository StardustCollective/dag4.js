import {SimpleKeyring} from '../rings';
import {
  IKeyringAccount,
  IKeyringWallet,
  KeyringAssetType,
  KeyringNetwork,
  KeyringWalletSerialized,
  KeyringWalletType
} from '../kcs';
import Wallet from "ethereumjs-wallet";

let SID = 0;

//SingleKeyWallet
export class SingleAccountWallet implements IKeyringWallet {

  readonly type = KeyringWalletType.SingleAccountWallet;
  readonly id = this.type + (++SID);
  readonly supportedAssets = [];

  private keyring: SimpleKeyring;
  private network: KeyringNetwork;
  private label: string;

  create (network: KeyringNetwork, privateKey: string, label: string) {
    if (!privateKey) {
      privateKey = Wallet.generate().getPrivateKey().toString('hex');
    }
    this.deserialize({ type: this.type, label, network, secret: privateKey });
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
      network: this.network,
      secret: this.exportSecretKey()
    }
  }

  deserialize (data: KeyringWalletSerialized) {

    this.label = data.label;
    this.network = data.network || KeyringNetwork.Ethereum;
    this.keyring = new SimpleKeyring();

    this.keyring.deserialize({network: this.network, accounts: [{ privateKey: data.secret }]});

    if (this.network === KeyringNetwork.Ethereum) {
      this.supportedAssets.push(KeyringAssetType.ETH);
      this.supportedAssets.push(KeyringAssetType.ERC20);
    }
    else if (this.network === KeyringNetwork.Constellation) {
      this.supportedAssets.push(KeyringAssetType.DAG);
    }
  }

  importAccount (hdPath: string, label: string) {
    throw new Error('SimpleChainWallet does not support importAccount');
    return null;
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

  exportSecretKey(): string {
    return this.keyring.getAccounts()[0].getPrivateKey();
  }

  resetSid() {
    SID = 0;
  }

}
