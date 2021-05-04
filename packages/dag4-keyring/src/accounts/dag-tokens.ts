import {KeyringAssetInfo} from '../kcs';

export class DagTokens {

  static defaultTokens: string[] = ['DAG'];

  static lib: {[symbol: string]: KeyringAssetInfo } = {
    DAG: {
      label: 'Constellation',
      symbol: 'DAG',
      network: '*',
      decimals: 8,
      native: true
    }
  }
}
