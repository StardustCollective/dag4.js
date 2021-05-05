import * as bip39 from 'ethereum-cryptography/bip39';
import { wordlist } from 'ethereum-cryptography/bip39/wordlists/english';

export class Bip39Helper {
  static generateMnemonic() {
    return bip39.generateMnemonic(wordlist);
  }

  static validateMnemonic (phrase: string) {
    return bip39.validateMnemonic(phrase, wordlist);
  }

  static mnemonicToSeedSync (mnemonic) {
    return bip39.mnemonicToSeedSync(mnemonic);
  }
}

// export const bip39Helper = new Bip39Helper();
