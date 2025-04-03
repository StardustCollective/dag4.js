# dag4

The main package for the dag4.js library, providing a unified interface for interacting with the Constellation Network.

## Overview

`dag4` is the main entry point for the dag4.js library, providing a unified interface for interacting with the Constellation Network. It combines functionality from other packages in the dag4.js ecosystem, including:

- Account management
- Network interaction
- Transaction handling
- Metagraph token support
- Key management

## Installation

```bash
npm install @stardust-collective/dag4
```

## Usage

### Basic Setup

```javascript
import { dag4 } from '@stardust-collective/dag4';

// Configure the library
dag4.config({
  appId: 'my-app',
  network: {
    // Network configuration
    id: 'metagraph-id',
    metagraphId: 'metagraph-address',
    l0Url: 'http://l0-example-url.com',
    l1Url: 'http://l1-example-url.com',
    beUrl: 'http://be-example-url.com',
    // Other network options...
  }
});
```

### Creating an Account

```javascript
import { dag4 } from '@stardust-collective/dag4';

// Create a new account
const account = dag4.createAccount();

// Or create an account with a private key
const account = dag4.createAccount('your-private-key');
```

### Using the Global Account

```javascript
import { dag4 } from '@stardust-collective/dag4';

// Get the global account
const account = dag4.account;

// Use the account to interact with the network
const balance = await account.getBalance();
```

### Creating a Metagraph Token Client

```javascript
import { dag4 } from '@stardust-collective/dag4';

// Get the global account
const account = dag4.account;

// Create a Metagraph token client
const tokenClient = dag4.createMetagraphTokenClient(account, {
  // Metagraph network information
  id: 'metagraph-id',
  metagraphId: 'metagraph-address',
  l0Url: 'http://l0-example-url.com',
  l1Url: 'http://l1-example-url.com',
  beUrl: 'http://be-example-url.com',
  // Other network options...
});

// Use the token client to interact with the Metagraph
const tokenBalance = await tokenClient.getBalance();
```