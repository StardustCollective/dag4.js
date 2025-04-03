# dag4-core

The core package for the dag4.js library, providing essential utilities and services for interacting with the Constellation Network.

## Overview

`dag4-core` provides the foundational components for the dag4.js library, including:

- Dependency injection container for managing services
- Cross-platform HTTP client implementations
- State storage utilities
- Array manipulation utilities

## Installation

```bash
npm install @stardust-collective/dag4-core
```

## Usage

### Dependency Injection

The `DagDi` class provides a dependency injection container for managing services:

```javascript
import { dagDi } from '@stardust-collective/dag4-core';

// Create a REST API client
const api = dagDi.createRestApi('https://api.constellationnetwork.io');

// Register a Fetch-based HTTP client
dagDi.useFetchHttpClient();

// Register a localStorage-based storage client
dagDi.useLocalStorageClient();

// Get the state storage database
const storage = dagDi.getStateStorageDb();
```

### REST API Client

The `RestApi` class provides methods for making HTTP requests:

```javascript
import { dagDi } from '@stardust-collective/dag4-core';

// Create a REST API client
const api = dagDi.createRestApi('https://api.constellationnetwork.io');

// Configure the client
api.configure()
  .baseUrl('https://api.constellationnetwork.io')
  .authToken('your-auth-token');

// Make requests
const response = await api.$get('/endpoint');
const data = await api.$post('/endpoint', { key: 'value' });
```

### State Storage

The `StateStorageDb` class provides a key-value storage interface:

```javascript
import { dagDi } from '@stardust-collective/dag4-core';

// Get the state storage database
const storage = dagDi.getStateStorageDb();

// Set a prefix for all keys
storage.setPrefix('my-app-');

// Store and retrieve data
await storage.set('key', { value: 'data' });
const data = await storage.get('key');
storage.delete('key');
```

### Array Utilities

The `arrayUtils` object provides methods for manipulating arrays:

```javascript
import { arrayUtils } from '@stardust-collective/dag4-core';

// Sort an array
const sorted = arrayUtils.sortBy(items, 'name', arrayUtils.FLAGS.CASE_INSENSITIVE);

// Find an item by field value
const item = arrayUtils.findItemByFieldValue(items, 'id', 123);

// Process items asynchronously
const results = await arrayUtils.asyncCallEach(items, async (item) => {
  // Process item
  return processedItem;
});

// Process items synchronously
await arrayUtils.syncCallEach(items, async (item) => {
  // Process item
});
```

## Constants

### DAG_DECIMALS

The number of decimal places for DAG, used for converting between DAG and DATUM:

```javascript
import { DAG_DECIMALS } from '@stardust-collective/dag4-core';

const datumValue = 100000000; // 100000000 DATUM = 1 DAG
const dagValue = datumValue * DAG_DECIMALS; // 1
``` 