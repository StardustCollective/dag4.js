import { KeyringAssetInfo } from '../kcs';
export declare type AssetMap = {
    [symbol: string]: KeyringAssetInfo;
};
export declare abstract class AssetLibrary {
    protected abstract defaultAssetsMap: AssetMap;
    protected abstract defaultAssets: string[];
    protected importedAssets: AssetMap;
    serialize(): AssetMap;
    deserialize(assets: AssetMap): void;
    getDefaultAssets(): string[];
    getAssetBySymbol(symbol: string): KeyringAssetInfo;
    importToken(token: KeyringAssetInfo): boolean;
}
