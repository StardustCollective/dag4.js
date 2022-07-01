import { Transaction, AddressLastRef, PostTransaction } from './transaction';
import { TransactionV2, PostTransactionV2, AddressLastRefV2 } from './transaction-v2';
declare class TxEncode {
    bytesToHex(bytes: any): any;
    numberToHex(n: any): string;
    buildTx(amount: number, toAddress: string, fromAddress: string, lastRef: AddressLastRef, fee?: number): PostTransaction;
    getTx(amount: number, toAddress: string, fromAddress: string, lastRef: AddressLastRef, fee?: number): Transaction;
    getTxV2(amount: number, toAddress: string, fromAddress: string, lastRef: AddressLastRefV2, fee?: number): TransactionV2;
    getTxFromPostTransaction(tx: PostTransaction): Transaction;
    getV2TxFromPostTransaction(tx: PostTransactionV2): TransactionV2;
    encodeTx(tx: PostTransaction, hashReference: boolean): string;
    kryoSerialize(msg: string, setReferences?: boolean): string;
    /** Writes the length of a string, which is a variable length encoded int except the first byte uses bit 8 to denote UTF8 and
     * bit 7 to denote if another byte is present. */
    private utf8Length;
}
export declare const txEncode: TxEncode;
export {};
