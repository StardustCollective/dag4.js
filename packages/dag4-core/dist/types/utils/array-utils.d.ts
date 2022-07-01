export declare class ArrayUtils {
    FLAGS: {
        CASE_INSENSITIVE: {
            caseInsensitive: boolean;
        };
        NUMERIC: {
            numeric: boolean;
        };
    };
    sortBy<T>(arr: T[], fieldName?: string, flags?: Flags, sortProcessCall?: any): T[];
    findItemByFieldValue<T>(arr: T[], fieldName: string, fieldValue: any, defaultValue?: T): T;
    findIndexByFieldValue<T>(arr: T[], fieldName: string, fieldValue: any): number;
    asyncCallEach<T, I>(array: I[], callback: (item: I, index?: number) => Promise<T>): Promise<T[]>;
    syncCallEach<T>(array: T[], callback: (item: T, index?: number, options?: ArraySyncOptions) => void, options?: {
        stopProcessing: boolean;
    }): Promise<void>;
    promiseAny<T>(iterable: any): Promise<T>;
}
declare type ArraySyncOptions = {
    stopProcessing: boolean;
};
export declare const arrayUtils: ArrayUtils;
declare class Flags {
    caseInsensitive?: boolean;
    numeric?: boolean;
}
export {};
