import {IKeyringAccount, KeyringNetwork} from './kcs';

type Constructor<T> = new () => T;

class KeyringRegistry {

  registry = new Map<string,Constructor<IKeyringAccount>>();

  registerAccountClass (id: KeyringNetwork, clazz: Constructor<IKeyringAccount>) {
    this.registry.set(id, clazz);
  }

  createAccount (id: KeyringNetwork) {
    const clazz = this.registry.get(id);

    return new clazz();
  }
}

export const keyringRegistry = new KeyringRegistry();

//Manager
//  wallets: { id?, label, type, wallet }[]
//  MCHD, multiChainHdKeyring(seed)
//  SCHD, singleChainHdKeyring(seed, chain)
//  CCHD, crossChainHdKeyring(seed)
//  SIMP, simpleKeyring(privateKey, chain)
//    accounts: IKeyringAccount[]
//      tokens: IKeyringAccountTokens[]
//    flattenAccountAndTokens()
//    getAccounts()
//        getTokens()

// - creates a single wallet with multiple chains, each with their own single account.
// createMultiChainHdWallet(seed: string)
//  DEFAULT ACCOUNTS
//    Constellation, Ethereum
//    keyring.addAccount() throws Error
//  ERC-20
//    account.addToken(chain, contractId)

// - creates a single wallet with one chain, multiple accounts, creates first account by default.
// createSingleChainHdWallet(seed: string, chain: KeyringChain)
//   keyring.addChain()
//      keyring.addAccount()
//        account.addToken(contractId)

// - creates a single wallet with multiple chains, multiple accounts, creates first account by default one per chain.
// createCrossChainHdWallet(seed: string)
//    keyring.addAccount()
//      account.addToken(contractId)

// - creates a single wallet with one chain, creates first account by default, one per chain.
// createSimpleWallet(privateKey: string, chain: KeyringChain)
//    keyring.addAccount()
//      account.addToken(contractId)
