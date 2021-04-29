
export interface IKeyringAccount {
  serialize (): KeyringAccountState;
  deserialize (data: KeyringAccountState): IKeyringAccount;
  signTransaction (address: string, tx, opts?: any);
  signMessage (address: string, data: string, opts?: any);
  //signPersonalMessage (address: string, msgHex: string, opts?: any);
  //getEncryptionPublicKey (address: string, opts?: any);
  //decryptMessage (address: string, data: EthEncryptedData);
  //signTypedData (address: string, typedData: any, opts?: any);
  getPrivateKey (): string;
  getAddress (): string;
  validateAddress (address: string);
}

export type KeyringAccountState = {
  label: string;
  privateKey: string;
}
