import {IKeyringAccount} from '../kcs';

/**
 * Represents a digital asset in the keyring system.
 * This class stores metadata about an asset including its label, symbol, decimal places,
 * and the associated account that manages it.
 */
export class Asset {
  /**
   * The display name or label for the asset.
   */
  label: string;

  /**
   * The ticker symbol for the asset (e.g., 'ETH', 'DAG').
   */
  symbol: string;

  /**
   * The number of decimal places used for the asset's smallest unit.
   */
  decimals: number;

  /**
   * The account instance that manages this asset.
   */
  account: IKeyringAccount;
}
