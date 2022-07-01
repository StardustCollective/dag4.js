export declare type Block = {
    "hash": string;
    "height": {
        "min": number;
        "max": number;
    };
    "transactions": string[];
    "children": number;
    "snapshotHash": string;
};
