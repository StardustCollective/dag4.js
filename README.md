
# DAG4 - DAG JavaScript SDK

This is the DAG [JavaScript SDK][docs] for Constellation Network.

Please read the [documentation][docs] for more detailed instructions. The following includes basic install and configuration.

## Installation

### Node

```bash
npm install @stardust-collective/dag4
```

### Yarn

```bash
yarn add @stardust-collective/dag4
```

## Usage

### Interacting with wallets

Create a private key
```js
const pk = dag4.keyStore.generatePrivateKey();
```

Login with the private key
```js
dag4.account.loginPrivateKey(pk);
```

Check DAG address
```js
const address = dag4.account.address;
```

### Connecting to the network
```js
import { dag4 } from '@stardust-collective/dag4';

// Connect to default network endpoints
dag4.account.connect({
    networkVersion: '2.0',
    testnet: true
})

// Or provide specific configuration
// L0/L1 urls can point to a specific node
dag4.account.connect({
    networkVersion: '2.0',
    beUrl: 'https://be-testnet.constellationnetwork.io',
    l0Url: 'http://13.52.246.74:9000',
    l1Url: 'http://13.52.246.74:9010'
})
```

Check address balance
```js
// Get an address balance
const balance = await dag4.network.getAddressBalance('DAGabc123...');
```

Get address last reference
```js
dag4.network.getAddressLastAcceptedTransactionRef('DAGabc123...');
```


### Sending transactions
Dag4.js supports both online and offline transaction signing as well as bulk transaction sending. You must be logged in with a pk and connected to the network to send transactions. 

Send a single transaction
```js
const toAddress = 'DAGabc123...';
const amount = 25.551;
const fee = 0;

dag4.account.transferDag(toAddress, amount, fee);
```

Send bulk transactions
```js
const transfers = [
    {address: 'DAGabc123...', amount: 0.000123, fee: 0},
    {address: 'DAGabc124...', amount: 0.000124, fee: 0},
    {address: 'DAGabc125...', amount: 0.000125, fee: 0},
    {address: 'DAGabc126...', amount: 0.000126, fee: 0},
    {address: 'DAGabc127...', amount: 0.000127, fee: 0},
    {address: 'DAGabc128...', amount: 0.000128, fee: 0.00000001}
];

  const hashes = await dag4.account.transferDagBatch(transfers);
```

Sign transactions offline, then send online
```js
// First get the last txn reference, this can also be retrieved from an offline source
const lastRef = await dag4.network.getAddressLastAcceptedTransactionRef('DAGWalletSendingAddress');

const transfers = [
    {address: 'DAGabc123...', amount: 0.000123, fee: 0},
    {address: 'DAGabc124...', amount: 0.000124, fee: 0}
];

const txns = await dag4.account.generateBatchTransactions(transfers, lastRef);

// Send online when ready
const hashes = await dag4.account.sendBatchTransactions(txns);
```

### Checking transaction status
When a transaction is sent to the network and is accepted, the response will return a hash that can be used to monitor the status of the transaction.

The transaction will initially be in a "waiting" state before it's included in a block and sent to a snapshot. While in this state you can check its status with the L1 API. Once processed by the network, the transaction will no longer be found via the L1 API and will be found in the block explorer API. At this point the transaction is considered final.

The following process can be used to confirm a transaction has been processed and reached a successful final state.

```js
// Send transaction
const hash = await dag4.network.postTransaction(txn);

// Keep checking the transaction status until this returns null
const pendingTx = await dag4.network.getPendingTransaction(txHash);

// Check that the transaction has registered on the block explore API
if (pendingTx === null) {
  const confirmedTx = await dag4.network.getTransaction(txHash);

  if (confirmedTx) {
    // Txn is confirmed - from this point the state cannot be changed
    console.log('Transaction confirmed');
  } else {
    // The txn cannot be found on block explorer. It's a good idea to wait several seconds and try again to confirm the txn has actually been dropped
    console.log('Transaction dropped - not confirmed');
  }
}
```

## Documentation

Documentation can be found at [Wiki][docs].

## Building

Build the dag4.js package:

```bash
npm run build
```

### Testing (mocha)

```bash
npm test --workspaces
```

### Community

-   [Discord](https://discord.gg/bb8SCX9sWk)
-   [Constellation Telegram](https://t.me/constellationcommunity)]
-   [Stardust Telegram](https://t.me/StardustSupport)]

---
### License
[![License: GPL v3](https://img.shields.io/badge/License-MIT-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
This project is licensed under the terms of the **MIT** license.

