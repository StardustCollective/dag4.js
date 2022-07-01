import { BIP_44_PATHS, HdKeyring } from '../rings';
import { KeyringAssetType, KeyringNetwork, KeyringWalletType } from '../kcs';
import { Bip39Helper } from '../bip39-helper';
let SID = 0;
export class MultiAccountWallet {
    constructor() {
        this.type = KeyringWalletType.MultiAccountWallet;
        this.id = this.type + (++SID);
        this.supportedAssets = [];
    }
    create(network, mnemonic, label, numOfAccounts = 1) {
        if (mnemonic) {
            if (typeof (mnemonic) === 'number') {
                mnemonic = Bip39Helper.generateMnemonic(mnemonic);
            }
        }
        else {
            mnemonic = Bip39Helper.generateMnemonic();
        }
        this.deserialize({ secret: mnemonic, type: this.type, label, network, numOfAccounts });
    }
    setLabel(val) {
        this.label = val;
    }
    getLabel() {
        return this.label;
    }
    getNetwork() {
        return this.network;
    }
    getState() {
        return {
            id: this.id,
            type: this.type,
            label: this.label,
            supportedAssets: this.supportedAssets,
            accounts: this.getAccounts().map(a => a.getState())
        };
    }
    serialize() {
        return {
            type: this.type,
            label: this.label,
            network: this.network,
            secret: this.exportSecretKey(),
            rings: [this.keyring.serialize()]
        };
    }
    deserialize(data) {
        this.label = data.label;
        this.network = data.network || KeyringNetwork.Ethereum;
        this.mnemonic = data.secret;
        let bip44Path;
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
    importAccount(hdPath, label) {
        throw new Error('MultiAccountWallet does not support importAccount');
        return null;
    }
    // getAssets (): string[] {
    //   return this.keyrings.reduce<string[]>((res, w) => res.concat(w.getAssetList()), []);
    // }
    getAccounts() {
        return this.keyring.getAccounts();
    }
    getAccountByAddress(address) {
        return this.keyring.getAccountByAddress(address);
    }
    addAccount() {
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
    setNumOfAccounts(num) {
        this.keyring = HdKeyring.create(this.mnemonic, this.keyring.getHdPath(), this.network, num);
    }
    removeAccount(account) {
        this.keyring.removeAccount(account);
    }
    exportSecretKey() {
        return this.mnemonic;
    }
}
//# sourceMappingURL=multi-account-wallet.js.map