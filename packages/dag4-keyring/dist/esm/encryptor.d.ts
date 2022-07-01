declare type Payload = {
    data: string;
    iv: string;
    salt?: string;
};
export declare class Encryptor<T> {
    static create<T>(): Encryptor<T>;
    encrypt(password: string, data: T): Promise<string>;
    decrypt(password: string, text: string | Payload): Promise<T>;
    private encryptWithKey;
    private decryptWithKey;
    private keyFromPassword;
    private serializeBufferFromStorage;
    private serializeBufferForStorage;
    private unprefixedHex;
    private generateSalt;
}
export {};
