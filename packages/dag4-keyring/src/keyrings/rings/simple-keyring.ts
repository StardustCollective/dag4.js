
import {EventEmitter} from 'events';
import {IKeyringAccount, KeyringAccountState} from '../keyring-account';
import {keyringRegistry} from '../keyring-registry';
import {KeyringChainId, IKeyring} from '../kcs';

// const KEYPAIR_TYPE = 'Simple Key Pair'
//
// class EthSimpleKeyringFactory {
//   type = KEYPAIR_TYPE;
//
//   create (opts) {
//     return new SimpleKeyring(opts);
//   }
// }
//
// export const ethSimpleKeyringFactory = new EthSimpleKeyringFactory();

/*

HD - Hierarchical Deterministic

HD Multi-chain Wallet - Each wallet can have multiple chains, but each chain has only one account
  Wallet 1 - one seed per wallet, different derivationPath for each chain
    account: Ethereum
    Polkadot
    Matic
    Constellation

HD Multi-account Wallet - Each wallet has only 1 chain but can have multiple accounts
  Wallet 2 - one seed per wallet, (Choose one: Ethereum, Polkadot, Matic or Constellation)

HD Cross-chain Wallet - Each wallet can have multiple chains, but each chain has only one account
  Wallet 1 - one seed per wallet, same derivationPath for each chain (results in the same private key for each)
    Ethereum
    Polkadot
    Matic
    Constellation

Simple Wallet - Each wallet has a single chain and one private key per account
  Wallet 3 - private key
  Wallet 4 - private key


  Ledger - createLedgerWallet() - creates a wallet per chain, internally uses same seed for each chain, creates first account by default for each chain.
 */

//Simple Wallets
//  Ethereum #1 - type,
export type SimpleKeyringState = {
  accountType: KeyringChainId, account: KeyringAccountState
}

export class SimpleKeyring extends EventEmitter implements IKeyring {

  private account: IKeyringAccount;
  private accountType: KeyringChainId;

  constructor () {
    super()
  }

  serialize (): SimpleKeyringState {
    return {
      accountType: this.accountType,
      account: this.account.serialize()
    };
  }

  deserialize ({accountType, account}: SimpleKeyringState) {
    this.accountType = accountType;
    this.account = keyringRegistry.createAccount(accountType).deserialize({ label: accountType, ...account});
  }

  addAccounts (n = 1) {
    //throw error
  }

  getAccounts () {
    return [this.account];
  }

  getAccountByAddress (address: string) {
    return address === this.account.getAddress() ? this.account : null;
  }

  removeAccount (account: IKeyringAccount) {
    //throw error
  }

}

