import * as bip39 from 'ethereum-cryptography/bip39';
import { wordlist } from 'ethereum-cryptography/bip39/wordlists/english';

type ALLOWED_ENTROPY = 128 | 160 | 192 | 224 | 256;
//Word count created:   12    15    18    21    24
export class Bip39Helper {

  static generateMnemonic(strength?: ALLOWED_ENTROPY) {
    return bip39.generateMnemonic(wordlist, strength);
  }

  static validateMnemonic (phrase: string) {
    return bip39.validateMnemonic(phrase, wordlist);
  }

  static mnemonicToSeedSync (mnemonic) {
    return bip39.mnemonicToSeedSync(mnemonic);
  }
}

// export const bip39Helper = new Bip39Helper();
