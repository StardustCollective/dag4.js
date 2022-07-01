"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeyringAssetType = exports.KeyringWalletType = exports.KeyringNetwork = void 0;
var KeyringNetwork;
(function (KeyringNetwork) {
    KeyringNetwork["Constellation"] = "Constellation";
    KeyringNetwork["Ethereum"] = "Ethereum";
})(KeyringNetwork = exports.KeyringNetwork || (exports.KeyringNetwork = {}));
var KeyringWalletType;
(function (KeyringWalletType) {
    KeyringWalletType["MultiChainWallet"] = "MCW";
    KeyringWalletType["CrossChainWallet"] = "CCW";
    KeyringWalletType["MultiAccountWallet"] = "MAW";
    KeyringWalletType["SingleAccountWallet"] = "SAW";
    KeyringWalletType["MultiKeyWallet"] = "MKW"; //Single Chain, Multiple Key accounts, MKW
})(KeyringWalletType = exports.KeyringWalletType || (exports.KeyringWalletType = {}));
var KeyringAssetType;
(function (KeyringAssetType) {
    KeyringAssetType["DAG"] = "DAG";
    KeyringAssetType["ETH"] = "ETH";
    KeyringAssetType["ERC20"] = "ERC20";
})(KeyringAssetType = exports.KeyringAssetType || (exports.KeyringAssetType = {}));
//# sourceMappingURL=kcs.js.map