
export interface IKeyValueDb {
  setPrefix (prefix: string);
  set (key: string, value: any);
  get (key: string): any;
  delete (key: string);
}
