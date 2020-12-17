export type AddressLastAcceptedTransaction = {
  address: string;
  prevHash: string,
  ordinal: number,
  success: boolean,
  message: string,
  tx: any
}
