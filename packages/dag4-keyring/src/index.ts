/**
 * @fileoverview Main entry point for the dag4-keyring package.
 * This file exports the key components of the keyring system and registers account classes.
 */

import {keyringRegistry} from './keyring-registry';
import {KeyringNetwork} from './kcs';
import {EthAccount} from './accounts/eth-account';
import {DagAccount} from './accounts/dag-account';

// Register account classes for different networks
keyringRegistry.registerAccountClass(KeyringNetwork.Ethereum, EthAccount);
keyringRegistry.registerAccountClass(KeyringNetwork.Constellation, DagAccount);

// Export key components
export {KeyringNetwork} from './kcs';
export {EthAccount} from './accounts/eth-account';
export {DagAccount} from './accounts/dag-account';
export {KeyringManager} from './keyring-manager';
export {Encryptor} from './encryptor';
export {Bip39Helper} from './bip39-helper';
export {HdKeyring, SimpleKeyring} from './rings';
export {MultiChainWallet, SingleAccountWallet, MultiAccountWallet, MultiKeyWallet} from './wallets';
export {keyringRegistry};
export {Web3Provider} from './web3/Web3Provider';
