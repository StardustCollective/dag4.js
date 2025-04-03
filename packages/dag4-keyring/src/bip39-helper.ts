import * as bip39 from 'ethereum-cryptography/bip39';
import { wordlist } from 'ethereum-cryptography/bip39/wordlists/english';

// type ALLOWED_ENTROPY = 128 | 160 | 192 | 224 | 256;
// Word count created:   12    15    18    21    24

/**
 * Type representing the allowed word counts for BIP39 mnemonics.
 * Each value corresponds to a specific entropy level:
 * - 12 words = 128 bits of entropy
 * - 15 words = 160 bits of entropy
 * - 18 words = 192 bits of entropy
 * - 21 words = 224 bits of entropy
 * - 24 words = 256 bits of entropy
 */
export type BIP39_WORD_COUNT = 12 | 15 | 18 | 21 | 24;

/**
 * Helper class for BIP39 mnemonic operations.
 * Provides methods for generating, validating, and converting BIP39 mnemonics.
 */
export class Bip39Helper {

  /**
   * Generates a BIP39 mnemonic with the specified word count.
   * @param wordCount - The number of words in the mnemonic (default: 12)
   * @returns A BIP39 mnemonic phrase
   */
  static generateMnemonic(wordCount: BIP39_WORD_COUNT = 12) {
    return bip39.generateMnemonic(wordlist, (wordCount / 3) * 32);
  }

  /**
   * Validates a BIP39 mnemonic phrase.
   * @param phrase - The mnemonic phrase to validate
   * @returns True if the phrase is valid, false otherwise
   */
  static validateMnemonic (phrase: string) {
    return bip39.validateMnemonic(phrase, wordlist);
  }

  /**
   * Converts a BIP39 mnemonic to a seed synchronously.
   * @param mnemonic - The mnemonic phrase to convert
   * @returns The seed derived from the mnemonic
   */
  static mnemonicToSeedSync (mnemonic) {
    return bip39.mnemonicToSeedSync(mnemonic);
  }
}

// export const bip39Helper = new Bip39Helper();
