"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeyringManager = void 0;
const obs_store_1 = require("@metamask/obs-store");
const safe_event_emitter_1 = __importDefault(require("@metamask/safe-event-emitter"));
const encryptor_1 = require("./encryptor");
const kcs_1 = require("./kcs");
const wallets_1 = require("./wallets");
const dag4 = __importStar(require("@stardust-collective/dag4-core"));
const bip39_helper_1 = require("./bip39-helper");
class KeyringManager extends safe_event_emitter_1.default {
    //Encrypted State
    storage = dag4.dagDi.getStateStorageDb();
    encryptor = new encryptor_1.Encryptor();
    wallets;
    memStore;
    password;
    constructor() {
        super();
        this.memStore = new obs_store_1.ObservableStore({
            isUnlocked: false,
            wallets: [],
        });
        this.wallets = [];
    }
    isUnlocked() {
        return !!this.password;
    }
    generateSeedPhrase() {
        return bip39_helper_1.Bip39Helper.generateMnemonic();
    }
    async fullUpdate() {
        await this.persistAllWallets(this.password);
        this.updateMemStoreWallets();
        this.notifyUpdate();
    }
    notifyUpdate() {
        this.emit('update', this.memStore.getState());
    }
    setWalletLabel(walletId, label) {
        this.getWalletById(walletId).setLabel(label);
        this.fullUpdate();
    }
    async removeWalletById(id) {
        const keep = this.wallets.filter(w => w.id !== id);
        if (keep.length < this.wallets.length) {
            this.wallets = keep;
            await this.fullUpdate();
        }
        else {
            throw new Error('Unable to find Wallet');
        }
    }
    async createOrRestoreVault(label, seed, password) {
        if (password) {
            if (typeof password !== 'string') {
                new Error('Password has invalid format.');
            }
            this.password = password;
        }
        else if (!this.password) {
            new Error('A password is required to create or restore a Vault');
        }
        if (seed && !bip39_helper_1.Bip39Helper.validateMnemonic(seed)) {
            new Error('Seed phrase is invalid.');
        }
        this.clearWallets();
        const wallet = this.newMultiChainHdWallet(label, seed);
        await this.fullUpdate();
        return wallet;
    }
    // - creates a single wallet with multiple chains, creates first account by default, one per chain.
    createCrossChainHdWallet(seed) {
    }
    // - creates a multiple account wallet with one chain, creates first account by default.
    async createMultiAccountWallet(label, seed, chain, numOfAccounts = 1) {
        const wallet = new wallets_1.MultiAccountWallet();
        label = label || 'Wallet #' + (this.wallets.length + 1);
        wallet.create(chain, seed, label, numOfAccounts);
        this.wallets.push(wallet);
        await this.fullUpdate();
        return wallet;
    }
    async createMultiKeyWallet(label, chain) {
        const wallet = new wallets_1.MultiKeyWallet();
        label = label || 'Wallet #' + (this.wallets.length + 1);
        wallet.create(chain, label);
        this.wallets.push(wallet);
        await this.fullUpdate();
        return wallet;
    }
    // - creates a single wallet with multiple chains, each with their own account.
    async createMultiChainHdWallet(label, seed) {
        const wallet = this.newMultiChainHdWallet(label, seed);
        //this.emit('newWallet', wallet);
        await this.fullUpdate();
        return wallet;
    }
    // - creates a single wallet with one chain, creates first account by default, one per chain.
    async createSingleAccountWallet(label, network, privateKey) {
        const wallet = new wallets_1.SingleAccountWallet();
        label = label || network + ' #' + (this.wallets.length + 1);
        wallet.create(network, privateKey, label);
        this.wallets.push(wallet);
        //this.emit('newAccount', wallet.getAccounts()[0]);
        await this.fullUpdate();
        return wallet;
    }
    addTokenToAccount(walletId, accountAddress, address) {
        const account = this.getWalletById(walletId).getAccountByAddress(accountAddress);
        account.saveTokenInfo(address);
        this.fullUpdate();
        return account;
    }
    newMultiChainHdWallet(label, seed) {
        const wallet = new wallets_1.MultiChainWallet();
        label = label || 'Wallet #' + (this.wallets.length + 1);
        wallet.create(label, seed);
        this.wallets.push(wallet);
        return wallet;
    }
    logout() {
        this.password = null;
        this.memStore.updateState({ isUnlocked: false });
        this.emit('lock');
        this.notifyUpdate();
    }
    async login(password) {
        this.wallets = await this.unlockWallets(password);
        this.updateUnlocked();
        this.notifyUpdate();
    }
    setPassword(password) {
        this.password = password;
    }
    checkPassword(password) {
        return this.password === password;
    }
    // async verifyPassword (password) {
    //   const encryptedVault = this.store.getState().vault;
    //   if (!encryptedVault) {
    //     throw new Error('Cannot unlock without a previous vault.')
    //   }
    //   await this.encryptor.decrypt(password, encryptedVault)
    // }
    removeEmptyWallets() {
        this.wallets = this.wallets.filter(keyring => keyring.getAccounts().length > 0);
    }
    exportAccountPrivateKey(address) {
        return this.findAccount(address).getPrivateKey();
    }
    async importAccountPrivateKey(walletId, secret, label) {
        const wallet = this.wallets.find(w => w.id === walletId);
        const account = wallet.importAccount(secret, label);
        await this.persistAllWallets();
        this.updateMemStoreWallets();
        this.notifyUpdate();
        return account;
    }
    exportWalletSecretKeyOrPhrase(walletId) {
        const wallet = this.wallets.find(w => w.id === walletId);
        return wallet.exportSecretKey();
    }
    async removeAccount(address) {
        const walletForAccount = this.getWalletForAccount(address);
        walletForAccount.removeAccount(address);
        this.emit('removedAccount', address);
        const accounts = walletForAccount.getAccounts();
        if (accounts.length === 0) {
            this.removeEmptyWallets();
        }
        await this.persistAllWallets();
        this.updateMemStoreWallets();
        this.notifyUpdate();
    }
    signTransaction(tx, fromAddress, opts = {}) {
        this.findAccount(fromAddress).signTransaction(fromAddress, tx, opts);
    }
    signMessage(msgParams, opts) {
        return this.findAccount(msgParams.from).signMessage(msgParams.from, msgParams.data, opts);
    }
    async unlockWallets(password) {
        const encryptedVault = this.storage.get('vault');
        if (!encryptedVault) {
            //Support recovering wallets from migration
            this.password = password;
            return [];
        }
        await this.clearWallets();
        const vault = await this.encryptor.decrypt(password, encryptedVault);
        this.password = password;
        vault.wallets.map(w => this._restoreWallet(w));
        await this.updateMemStoreWallets();
        return this.wallets;
    }
    getAccounts() {
        return this.wallets.reduce((res, kr) => res.concat(kr.getAccounts()), []);
    }
    getWallets(filterByType) {
        if (filterByType) {
            return this.wallets.filter(w => w.type === filterByType);
        }
        return this.wallets;
    }
    getWalletById(id) {
        const wallet = this.wallets.find(w => w.id === id);
        if (wallet) {
            return wallet;
        }
        throw new Error('No wallet found with the id: ' + id);
    }
    getWalletForAccount(address) {
        const winner = this.wallets.find((keyring) => {
            return keyring.getAccounts().find(a => a.getAddress() === address);
        });
        if (winner) {
            return winner;
        }
        throw new Error('No keyring found for the requested account.');
    }
    findAccount(address) {
        return this.getWalletForAccount(address).getAccountByAddress(address);
    }
    async persistAllWallets(password = this.password) {
        if (typeof password !== 'string') {
            return new Error('KeyringManager - password is not a string');
        }
        this.password = password;
        const sWallets = this.wallets.map(w => w.serialize());
        const encryptedString = await this.encryptor.encrypt(this.password, { wallets: sWallets });
        this.storage.set('vault', encryptedString);
    }
    async _restoreWallet(wData) {
        let wallet;
        if (wData.type === kcs_1.KeyringWalletType.MultiChainWallet) {
            wallet = new wallets_1.MultiChainWallet();
            wallet.deserialize(wData);
        }
        else if (wData.type === kcs_1.KeyringWalletType.SingleAccountWallet) {
            wallet = new wallets_1.SingleAccountWallet();
            wallet.deserialize(wData);
        }
        else if (wData.type === kcs_1.KeyringWalletType.MultiAccountWallet) {
            wallet = new wallets_1.MultiAccountWallet();
            wallet.deserialize(wData);
        }
        else if (wData.type === kcs_1.KeyringWalletType.MultiKeyWallet) {
            wallet = new wallets_1.MultiKeyWallet();
            wallet.deserialize(wData);
        }
        else {
            throw new Error('Unknown Wallet type - ' + wData.type + ', support types are [' + kcs_1.KeyringWalletType.MultiChainWallet + ',' + kcs_1.KeyringWalletType.SingleAccountWallet + ']');
        }
        this.wallets.push(wallet);
        return wallet;
    }
    updateUnlocked() {
        this.memStore.updateState({ isUnlocked: true });
        this.emit('unlock');
    }
    clearWallets() {
        // clear wallets from memory
        this.wallets = [];
        this.memStore.updateState({
            wallets: [],
        });
    }
    updateMemStoreWallets() {
        const wallets = this.wallets.map(w => w.getState());
        return this.memStore.updateState({ wallets });
    }
}
exports.KeyringManager = KeyringManager;
//# sourceMappingURL=keyring-manager.js.map