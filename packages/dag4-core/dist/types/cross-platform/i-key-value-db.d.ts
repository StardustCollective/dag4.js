export interface IKeyValueDb {
    setPrefix(prefix: string): any;
    set(key: string, value: any): any;
    get(key: string): any;
    delete(key: string): any;
}
