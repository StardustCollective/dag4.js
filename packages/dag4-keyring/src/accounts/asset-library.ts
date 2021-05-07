import {KeyringAssetInfo} from '../kcs';

export type AssetMap = {[symbol: string]: KeyringAssetInfo };


export abstract class AssetLibrary {

  protected abstract defaultAssetsMap: AssetMap;
  protected abstract defaultAssets: string[];

  protected importedAssets: AssetMap = {};

  serialize () {
    return this.importedAssets;
  }

  deserialize (assets: AssetMap) {
    this.importedAssets = assets;
  }

  getDefaultAssets () {
    return this.defaultAssets.concat();
  }

  getAssetBySymbol (symbol: string) {
    return this.defaultAssetsMap[symbol] || this.importedAssets[symbol];
  }

  importToken (token: KeyringAssetInfo) {
    if (!this.importedAssets[token.symbol]) {
      this.importedAssets[token.symbol] = { ...token };
      return true;
    }
    return false;
  }


}

