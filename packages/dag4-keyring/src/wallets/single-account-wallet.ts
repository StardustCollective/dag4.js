
import {SimpleKeyring} from '../rings';
import {IKeyringWallet, IKeyringAccount, KeyringAssetType, KeyringNetwork, KeyringWalletSerialized, KeyringWalletType} from '../kcs';

let SID = 0;

export class SingleAccountWallet implements IKeyringWallet {

  readonly type = KeyringWalletType.SimpleAccountWallet;
  readonly id = this.type + (++SID);
  readonly supportedAssets = [];

  private keyring: SimpleKeyring;
  private network: KeyringNetwork;
  private label: string;

  create (network: KeyringNetwork, privateKey: string, label: string) {
    this.label = label;
    this.network = network;
    this.keyring = SimpleKeyring.createForNetwork(network, privateKey);

    if (network === KeyringNetwork.Ethereum) {
      this.supportedAssets.push(KeyringAssetType.ETH);
      this.supportedAssets.push(KeyringAssetType.ERC20);
    }
    else if (network === KeyringNetwork.Constellation) {
      this.supportedAssets.push(KeyringAssetType.DAG);
    }
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
      network: this.network,
      secret: this.exportSecretKey()
    }
  }

  deserialize (data: KeyringWalletSerialized) {
    this.keyring = new SimpleKeyring();
    this.keyring.deserialize({accountType: data.network, account: { privateKey: data.secret }});
  }

  addKeyring (hdPath: string) {
    throw new Error('SimpleChainWallet does not allow dynamically adding new Keyrings');
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

}
