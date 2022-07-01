import { SimpleKeyring } from '../rings';
import { KeyringAssetType, KeyringNetwork, KeyringWalletType } from '../kcs';
let SID = 0;
export class MultiKeyWallet {
    constructor() {
        this.type = KeyringWalletType.MultiKeyWallet;
        this.id = this.type + (++SID);
        this.supportedAssets = [];
    }
    create(network, label) {
        this.deserialize({ type: this.type, label, network });
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
            network: this.network,
            supportedAssets: this.supportedAssets,
            accounts: this.getAccounts().map(a => {
                return {
                    address: a.getAddress(),
                    label: a.getLabel()
                    // ...{ label: a.getLabel() }
                };
            })
        };
    }
    serialize() {
        return {
            type: this.type,
            label: this.label,
            network: this.network,
            accounts: this.keyRings.map(k => k.getAccounts()[0].serialize(true))
        };
    }
    deserialize(data) {
        this.label = data.label;
        this.network = data.network;
        this.keyRings = [];
        if (data.accounts && data.accounts.length) {
            data.accounts.forEach(a => this.importAccount(a.privateKey, a.label));
        }
        if (this.network === KeyringNetwork.Ethereum) {
            this.supportedAssets.push(KeyringAssetType.ETH);
            this.supportedAssets.push(KeyringAssetType.ERC20);
        }
        else if (this.network === KeyringNetwork.Constellation) {
            this.supportedAssets.push(KeyringAssetType.DAG);
        }
    }
    importAccount(secret, label) {
        const keyring = new SimpleKeyring();
        keyring.deserialize({ network: this.network, accounts: [{ privateKey: secret, label }] });
        this.keyRings.push(keyring);
        return keyring.getAccounts()[0];
    }
    getAccounts() {
        return this.keyRings.reduce((res, w) => res.concat(w.getAccounts()), []);
    }
    getAccountByAddress(address) {
        let account;
        this.keyRings.some(w => account = w.getAccountByAddress(address));
        return account;
    }
    removeAccount(account) {
        //Does not support removing account
    }
    exportSecretKey() {
        throw new Error('MultiKeyWallet does not allow exportSecretKey');
    }
}
//# sourceMappingURL=multi-key-wallet.js.map