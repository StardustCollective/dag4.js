/// <reference types="node" />
export declare type BIP39_WORD_COUNT = 12 | 15 | 18 | 21 | 24;
export declare class Bip39Helper {
    static generateMnemonic(wordCount?: BIP39_WORD_COUNT): string;
    static validateMnemonic(phrase: string): boolean;
    static mnemonicToSeedSync(mnemonic: any): Buffer;
}
