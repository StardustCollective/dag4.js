import {keyringRegistry} from './keyring-registry';
import {KeyringNetwork} from './kcs';
import {EthAccount} from './accounts/eth-account';
import {DagAccount} from './accounts/dag-account';

export * from './bip39-helper';
export * from './keyring-manager';
export * from './kcs';

keyringRegistry.registerAccountClass(KeyringNetwork.Ethereum, EthAccount);
keyringRegistry.registerAccountClass(KeyringNetwork.Constellation, DagAccount);
