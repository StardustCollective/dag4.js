
import {AssetLibrary, AssetMap} from './asset-library';

const DEFAULTS: AssetMap = {
  ETH: {
    label: 'Ethereum',
    symbol: 'ETH',
    network: '*',
    decimals: 18,
    native: true
  },
  LTX: {
    address: '0xa393473d64d2F9F026B60b6Df7859A689715d092',
    label: 'Lattice Token',
    symbol: 'LTX',
    network: 'mainnet',
    decimals: 8
  }
}

class EthAssetLibrary extends AssetLibrary {
  protected defaultAssetsMap = DEFAULTS;
  protected defaultAssets = ['ETH','LTX'];

}

export const ethAssetLibrary = new EthAssetLibrary();
