import { ObservableStore } from '@metamask/obs-store';
import SafeEventEmitter from '@metamask/safe-event-emitter';
import { Encryptor } from './encryptor';
import { KeyringWalletType } from './kcs';
import { MultiChainWallet, SingleAccountWallet, MultiAccountWallet, MultiKeyWallet } from './wallets';
import * as dag4 from '@stardust-collective/dag4-core';
import { Bip39Helper } from './bip39-helper';
export class KeyringManager extends SafeEventEmitter {
    constructor() {
        super();
        //Encrypted State
        this.storage = dag4.dagDi.getStateStorageDb();
        this.encryptor = new Encryptor();
        this.memStore = new ObservableStore({
            isUnlocked: false,
            wallets: [],
        });
        this.wallets = [];
    }
    isUnlocked() {
        return !!this.password;
    }
    generateSeedPhrase() {
        return Bip39Helper.generateMnemonic();
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
        if (seed && !Bip39Helper.validateMnemonic(seed)) {
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
        const wallet = new MultiAccountWallet();
        label = label || 'Wallet #' + (this.wallets.length + 1);
        wallet.create(chain, seed, label, numOfAccounts);
        this.wallets.push(wallet);
        await this.fullUpdate();
        return wallet;
    }
    async createMultiKeyWallet(label, chain) {
        const wallet = new MultiKeyWallet();
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
        const wallet = new SingleAccountWallet();
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
        const wallet = new MultiChainWallet();
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
        if (wData.type === KeyringWalletType.MultiChainWallet) {
            wallet = new MultiChainWallet();
            wallet.deserialize(wData);
        }
        else if (wData.type === KeyringWalletType.SingleAccountWallet) {
            wallet = new SingleAccountWallet();
            wallet.deserialize(wData);
        }
        else if (wData.type === KeyringWalletType.MultiAccountWallet) {
            wallet = new MultiAccountWallet();
            wallet.deserialize(wData);
        }
        else if (wData.type === KeyringWalletType.MultiKeyWallet) {
            wallet = new MultiKeyWallet();
            wallet.deserialize(wData);
        }
        else {
            throw new Error('Unknown Wallet type - ' + wData.type + ', support types are [' + KeyringWalletType.MultiChainWallet + ',' + KeyringWalletType.SingleAccountWallet + ']');
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
//# sourceMappingURL=keyring-manager.js.map