import {IKeyringAccount} from '../kcs';

export class Asset {
  label: string;
  symbol: string;
  decimals: number;
  account: IKeyringAccount;
}
