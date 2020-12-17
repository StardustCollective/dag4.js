
export interface IKeyValueDb {
  set (key: string, value: any);
  get (key: string): any;
  delete (key: string);
}
