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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bip39Helper = void 0;
const bip39 = __importStar(require("ethereum-cryptography/bip39"));
const english_1 = require("ethereum-cryptography/bip39/wordlists/english");
class Bip39Helper {
    static generateMnemonic(wordCount = 12) {
        return bip39.generateMnemonic(english_1.wordlist, (wordCount / 3) * 32);
    }
    static validateMnemonic(phrase) {
        return bip39.validateMnemonic(phrase, english_1.wordlist);
    }
    static mnemonicToSeedSync(mnemonic) {
        return bip39.mnemonicToSeedSync(mnemonic);
    }
}
exports.Bip39Helper = Bip39Helper;
// export const bip39Helper = new Bip39Helper();
//# sourceMappingURL=bip39-helper.js.map