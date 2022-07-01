export declare class V3Keystore {
    static encryptPhrase(phrase: string, password: string): Promise<V3Keystore<KDFParamsPhrase>>;
    static decryptPhrase(keystore: V3Keystore<KDFParamsPhrase>, password: string): Promise<string>;
}
export interface V3Keystore<T = KDFParamsPrivateKey | KDFParamsPhrase> {
    crypto: {
        cipher: string;
        cipherparams: {
            iv: string;
        };
        ciphertext: string;
        kdf: string;
        kdfparams: T;
        mac: string;
    };
    id: string;
    address?: string;
    version: number;
}
export interface KDFParamsPrivateKey {
    dklen: number;
    n: number;
    p: number;
    r: number;
    salt: string;
}
export interface KDFParamsPhrase {
    dklen: number;
    c: number;
    salt: string;
}
