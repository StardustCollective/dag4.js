"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dagAssetLibrary = void 0;
const asset_library_1 = require("./asset-library");
const DEFAULTS = {
// DAG: {
//   id: 'constellation',
//   label: 'Constellation',
//   symbol: 'DAG',
//   network: '*',
//   decimals: 8,
//   native: true
// }
};
class DagAssetLibrary extends asset_library_1.AssetLibrary {
    defaultAssetsMap = DEFAULTS;
    defaultAssets = [];
}
exports.dagAssetLibrary = new DagAssetLibrary();
//# sourceMappingURL=dag-asset-library.js.map