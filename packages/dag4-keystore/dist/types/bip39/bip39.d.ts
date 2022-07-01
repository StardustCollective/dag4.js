/// <reference types="node" />
declare class Bip39 {
    mnemonicToSeedSync(mnemonic: any, password?: any): Buffer;
    mnemonicToSeed(mnemonic: any, password: any): Promise<unknown>;
    mnemonicToEntropy(mnemonic: any, wordlist: any): string;
    entropyToMnemonic(entropy: any, wordlist: any): any;
    generateMnemonic(strength?: any, rng?: any, wordlist?: any): any;
    validateMnemonic(mnemonic: any, wordlist?: any): boolean;
}
export declare const bip39: Bip39;
export {};
