"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ethAssetLibrary = void 0;
const asset_library_1 = require("./asset-library");
const DEFAULTS = {
    ETH: {
        id: 'ethereum',
        label: 'Ethereum',
        symbol: 'ETH',
        network: '*',
        decimals: 18,
        native: true
    },
    LTX: {
        id: '0xa393473d64d2F9F026B60b6Df7859A689715d092',
        address: '0xa393473d64d2F9F026B60b6Df7859A689715d092',
        label: 'Lattice Token',
        symbol: 'LTX',
        network: 'mainnet',
        decimals: 8
    }
};
class EthAssetLibrary extends asset_library_1.AssetLibrary {
    defaultAssetsMap = DEFAULTS;
    defaultAssets = ['LTX'];
}
exports.ethAssetLibrary = new EthAssetLibrary();
//# sourceMappingURL=eth-asset-library.js.map