export class AssetLibrary {
    constructor() {
        this.importedAssets = {};
    }
    serialize() {
        return this.importedAssets;
    }
    deserialize(assets) {
        this.importedAssets = assets;
    }
    getDefaultAssets() {
        return this.defaultAssets.concat();
    }
    getAssetBySymbol(symbol) {
        return this.defaultAssetsMap[symbol] || this.importedAssets[symbol];
    }
    importToken(token) {
        if (!this.importedAssets[token.symbol]) {
            this.importedAssets[token.symbol] = { ...token };
            return true;
        }
        return false;
    }
}
//# sourceMappingURL=asset-library.js.map