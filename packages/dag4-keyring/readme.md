# dag4-keyring

A keyring management system for the Constellation Network and Ethereum, providing secure wallet and account management capabilities.

## Overview

The `dag4-keyring` package provides a comprehensive solution for managing cryptographic keys, wallets, and accounts for both the Constellation Network and Ethereum. It supports various wallet types, including multi-chain wallets, single-account wallets, and multi-account wallets.

## Features

- **Multiple Wallet Types**:
  - Multi-chain wallets (supporting both Constellation and Ethereum)
  - Single-account wallets
  - Multi-account wallets
  - Multi-key wallets

- **Account Management**:
  - Create and import accounts
  - Manage tokens and assets
  - Sign transactions and messages
  - Verify signatures

- **Security**:
  - BIP39 mnemonic generation and validation
  - Secure encryption and decryption of wallet data
  - Hierarchical deterministic (HD) wallet support

- **Network Support**:
  - Constellation Network
  - Ethereum (including ERC-20 tokens)

## Installation

```bash
npm install @stardust-collective/dag4-keyring
```

## Usage

### Basic Wallet Creation

```typescript
import { KeyringManager, KeyringNetwork } from '@stardust-collective/dag4-keyring';

// Create a keyring manager
const keyringManager = new KeyringManager({});

// Create a multi-chain wallet
const wallet = await keyringManager.createMultiChainHdWallet('My Wallet');

// Get accounts
const accounts = wallet.getAccounts();
console.log('Accounts:', accounts.map(a => a.getAddress()));
```

### Creating a Single Account Wallet

```typescript
import { KeyringManager, KeyringNetwork } from '@stardust-collective/dag4-keyring';

const keyringManager = new KeyringManager({});

// Create a single account wallet for Ethereum
const wallet = await keyringManager.createSingleAccountWallet(
  'My Ethereum Wallet',
  KeyringNetwork.Ethereum
);

// Get the account
const account = wallet.getAccounts()[0];
console.log('Account address:', account.getAddress());
```

## Architecture

The package is organized into several key components:

- **KeyringManager**: The main entry point for wallet management
- **Wallets**: Different wallet implementations (MultiChainWallet, SingleAccountWallet, etc.)
- **Accounts**: Account implementations for different networks (EthAccount, DagAccount)
- **Rings**: Keyring implementations (HdKeyring, SimpleKeyring)
- **Encryptor**: For secure storage of wallet data
- **Bip39Helper**: For mnemonic generation and validation

## License

MIT
