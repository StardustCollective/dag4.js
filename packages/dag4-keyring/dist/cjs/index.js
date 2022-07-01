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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.keyringRegistry = exports.Encryptor = void 0;
const keyring_registry_1 = require("./keyring-registry");
const kcs_1 = require("./kcs");
const eth_account_1 = require("./accounts/eth-account");
const dag_account_1 = require("./accounts/dag-account");
__exportStar(require("./bip39-helper"), exports);
__exportStar(require("./keyring-manager"), exports);
__exportStar(require("./rings"), exports);
__exportStar(require("./kcs"), exports);
var encryptor_1 = require("./encryptor");
Object.defineProperty(exports, "Encryptor", { enumerable: true, get: function () { return encryptor_1.Encryptor; } });
var keyring_registry_2 = require("./keyring-registry");
Object.defineProperty(exports, "keyringRegistry", { enumerable: true, get: function () { return keyring_registry_2.keyringRegistry; } });
__exportStar(require("./wallets"), exports);
keyring_registry_1.keyringRegistry.registerAccountClass(kcs_1.KeyringNetwork.Ethereum, eth_account_1.EthAccount);
keyring_registry_1.keyringRegistry.registerAccountClass(kcs_1.KeyringNetwork.Constellation, dag_account_1.DagAccount);
//# sourceMappingURL=index.js.map