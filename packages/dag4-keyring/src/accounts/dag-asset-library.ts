
import {AssetLibrary, AssetMap} from './asset-library';

const DEFAULTS: AssetMap = {
  DAG: {
    label: 'Constellation',
    symbol: 'DAG',
    network: '*',
    decimals: 8,
    native: true
  }
}

class DagAssetLibrary extends AssetLibrary {
  protected defaultAssetsMap = DEFAULTS;
  protected defaultAssets = ['DAG'];
}

export const dagAssetLibrary = new DagAssetLibrary();
