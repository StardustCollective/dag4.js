import { SimpleKeyring } from '../rings';
import { KeyringAssetType, KeyringNetwork, KeyringWalletType } from '../kcs';
import Wallet from "ethereumjs-wallet";
let SID = 0;
//SingleKeyWallet
export class SingleAccountWallet {
    constructor() {
        this.type = KeyringWalletType.SingleAccountWallet;
        this.id = this.type + (++SID);
        this.supportedAssets = [];
    }
    create(network, privateKey, label) {
        if (!privateKey) {
            privateKey = Wallet.generate().getPrivateKey().toString('hex');
        }
        this.deserialize({ type: this.type, label, network, secret: privateKey });
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
            accounts: this.getAccounts().map(a => {
                return {
                    address: a.getAddress(),
                    network: a.getNetwork(),
                    tokens: a.getTokens()
                };
            })
        };
    }
    serialize() {
        return {
            type: this.type,
            label: this.label,
            network: this.network,
            secret: this.exportSecretKey()
        };
    }
    deserialize(data) {
        this.label = data.label;
        this.network = data.network || KeyringNetwork.Ethereum;
        this.keyring = new SimpleKeyring();
        this.keyring.deserialize({ network: this.network, accounts: [{ privateKey: data.secret }] });
        if (this.network === KeyringNetwork.Ethereum) {
            this.supportedAssets.push(KeyringAssetType.ETH);
            this.supportedAssets.push(KeyringAssetType.ERC20);
        }
        else if (this.network === KeyringNetwork.Constellation) {
            this.supportedAssets.push(KeyringAssetType.DAG);
        }
    }
    importAccount(hdPath, label) {
        throw new Error('SimpleChainWallet does not support importAccount');
        return null;
    }
    getAccounts() {
        return this.keyring.getAccounts();
    }
    getAccountByAddress(address) {
        return this.keyring.getAccountByAddress(address);
    }
    removeAccount(account) {
        //Does not support removing account
    }
    exportSecretKey() {
        return this.keyring.getAccounts()[0].getPrivateKey();
    }
}
//# sourceMappingURL=single-account-wallet.js.map