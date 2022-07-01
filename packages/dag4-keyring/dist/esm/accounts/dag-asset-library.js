import { AssetLibrary } from './asset-library';
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
class DagAssetLibrary extends AssetLibrary {
    constructor() {
        super(...arguments);
        this.defaultAssetsMap = DEFAULTS;
        this.defaultAssets = [];
    }
}
export const dagAssetLibrary = new DagAssetLibrary();
//# sourceMappingURL=dag-asset-library.js.map