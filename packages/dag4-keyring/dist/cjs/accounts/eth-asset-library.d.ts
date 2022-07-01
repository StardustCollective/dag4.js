import { AssetLibrary, AssetMap } from './asset-library';
declare class EthAssetLibrary extends AssetLibrary {
    protected defaultAssetsMap: AssetMap;
    protected defaultAssets: string[];
}
export declare const ethAssetLibrary: EthAssetLibrary;
export {};
