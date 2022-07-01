export declare type HeightV2 = {
    min: number;
    max: number;
};
export declare type BlockReference = {
    hash: string;
    height: HeightV2;
};
export declare type BlockV2 = {
    hash: string;
    timestamp: string;
    snapshot: string;
    height: HeightV2;
    transactions: string[];
    parent: BlockReference;
};
