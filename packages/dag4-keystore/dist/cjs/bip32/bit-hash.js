"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BitHash = void 0;
const create_hash_1 = __importDefault(require("create-hash"));
const create_hmac_1 = __importDefault(require("create-hmac"));
class BitHash {
    static hash160(buffer) {
        const sha256Hash = (0, create_hash_1.default)('sha256')
            .update(buffer)
            .digest();
        try {
            return (0, create_hash_1.default)('rmd160')
                .update(sha256Hash)
                .digest();
        }
        catch (err) {
            return (0, create_hash_1.default)('ripemd160')
                .update(sha256Hash)
                .digest();
        }
    }
    static dblHash256(buffer) {
        const sha256Hash = (0, create_hash_1.default)('sha256').update(buffer).digest();
        return (0, create_hash_1.default)('sha256').update(sha256Hash).digest();
    }
    static hmacSHA512(key, data) {
        return (0, create_hmac_1.default)('sha512', key)
            .update(data)
            .digest();
    }
}
exports.BitHash = BitHash;
//# sourceMappingURL=bit-hash.js.map