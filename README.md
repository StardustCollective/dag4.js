
# DAG4 - DAG JavaScript API

This is the DAG [JavaScript API][docs] for Constellation Network.

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

```js
// In Node.js
const fetch = require('node-fetch');
const dag4 = require("@stardust-collective/dag4");

dag.di.useFetchHttpClient(fetch);
dag.network.config({
    beUrl: 'https://block-explorer.constellationnetwork.io',
    lbUrl: 'http://lb.constellationnetwork.io:9000'
})
```

Now you can use it to:

```ts
// Get latest snapshot from the block explorer
dag.network.blockExplorerApi.getLatestSnapshot();

// Get the total supply from a validator node
dag.network.loadBalancerApi.getTotalSupply();
```

### Usage with TypeScript

We support types within the repo itself. Please open an issue here if you find any wrong types.

You can use `dag4.js` as follows:

import dag4

```typescript
import { dag } from '@stardust-collective/dag4';
```

Configure Network
```ts
import fetch from 'node-fetch';

dag.di.useFetchHttpClient(fetch);
dag.network.config({
   beUrl: 'https://block-explorer.constellationnetwork.io',
   lbUrl: 'http://lb.constellationnetwork.io:9000'
})
```

If you are using the types in a `commonjs` module, like in a Node app, you have to enable `esModuleInterop` and `allowSyntheticDefaultImports` in your `tsconfig` for typesystem compatibility:

```js
"compilerOptions": {
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    ....
```

## Documentation

Documentation can be found at [Wiki][docs].

## Building

### Requirements

-   [Node.js](https://nodejs.org)
-   [npm](https://www.npmjs.com/)

```bash
sudo apt-get update
sudo apt-get install nodejs
sudo apt-get install npm
```

### Building (DAG4)

Build the dag4.js package:

```bash
npm run build
```

### Testing (mocha)

```bash
npm test
```

### Community

-   [Discord][discord-url]
-   [Telegram][telegram-url]

---
### License
[![License: GPL v3](https://img.shields.io/badge/License-MIT-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
This project is licensed under the terms of the **MIT** license.

[repo]: https://github.com/StardustCollective/dag4.js
[npm-url]: https://npmjs.org/package/dag4
[docs]: https://github.com/StardustCollective/dag4.js/wiki
[discord-url]: https://discord.gg/bb8SCX9sWk
[telegram-url]: https://t.me/StardustSupport
