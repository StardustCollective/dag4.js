
import {SimpleKeyring} from '../rings';
import {IKeyringWallet, IKeyringAccount, KeyringAssetType, KeyringNetwork, KeyringWalletSerialized, KeyringWalletType} from '../kcs';

let SID = 0;

export class SingleAccountWallet implements IKeyringWallet {

  readonly type = KeyringWalletType.SimpleAccountWallet;
  readonly id = this.type + (++SID);
  readonly supportAssets = [];

  private keyring: SimpleKeyring;
  private network: KeyringNetwork;
  private label: string;

  constructor () {

  }

  create (network: KeyringNetwork, privateKey: string, label: string) {
    this.label = label;
    this.network = network;
    this.keyring = SimpleKeyring.createForNetwork(network, privateKey, label);

    if (network === KeyringNetwork.Ethereum) {
      this.supportAssets.push(KeyringAssetType.ETH);
      this.supportAssets.push(KeyringAssetType.ERC20);
    }
    else if (network === KeyringNetwork.Constellation) {
      this.supportAssets.push(KeyringAssetType.DAG);
    }
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
    this.keyring.deserialize({accountType: data.network, account: { privateKey: data.secret, label: data.label }});
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
