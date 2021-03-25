import {dag} from '@stardust-collective/dag4';
import fetch from 'node-fetch';
import {ExampleWallet} from './example-wallet';
const { LocalStorage } = require('node-localstorage');

dag.di.useFetchHttpClient(fetch);
dag.di.useLocalStorageClient(new LocalStorage('./scratch'));
dag.network.config({
  id: 'ceres',
  beUrl: 'https://api-be.exchanges.constellationnetwork.io',
  lbUrl: 'http://lb.exchanges.constellationnetwork.io:9000'
})

const wallet = new ExampleWallet();

async function run() {
  await wallet.run();
}

run();

