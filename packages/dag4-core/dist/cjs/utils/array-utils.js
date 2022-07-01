"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.arrayUtils = exports.ArrayUtils = void 0;
class ArrayUtils {
    FLAGS = {
        CASE_INSENSITIVE: { caseInsensitive: true },
        NUMERIC: { 'numeric': true }
    };
    sortBy(arr, fieldName, flags, sortProcessCall) {
        if (!flags) {
            flags = new Flags();
        }
        if (!arr) {
            return [];
        }
        const processFlags = (item) => {
            let val = item[fieldName];
            if (sortProcessCall) {
                val = sortProcessCall(item, val);
            }
            if (flags.caseInsensitive) {
                val = val.toLowerCase();
            }
            return val;
        };
        if (flags.numeric) {
            return arr.sort((a, b) => {
                return processFlags(b) - processFlags(a);
            });
        }
        return arr.sort((a, b) => {
            const a1 = processFlags(a);
            const b1 = processFlags(b);
            if (a1 < b1) {
                return -1;
            }
            if (a1 > b1) {
                return 1;
            }
            return 0;
        });
    }
    findItemByFieldValue(arr, fieldName, fieldValue, defaultValue) {
        let result = defaultValue;
        arr && arr.some(item => {
            if (item.hasOwnProperty(fieldName) && item[fieldName] === fieldValue) {
                result = item;
                return true;
            }
        });
        return result;
    }
    findIndexByFieldValue(arr, fieldName, fieldValue) {
        let result = -1;
        arr && arr.some((item, index) => {
            if (item.hasOwnProperty(fieldName) && item[fieldName] === fieldValue) {
                result = index;
                return true;
            }
        });
        return result;
    }
    async asyncCallEach(array, callback) {
        if (!array || array.length === 0) {
            return;
        }
        const promises = array.map(async (item, index) => callback(item, index));
        return await Promise.all(promises);
    }
    async syncCallEach(array, callback, options = { stopProcessing: false }) {
        if (!array || array.length === 0) {
            return;
        }
        for (let index = 0; index < array.length; index++) {
            await callback(array[index], index, options);
            if (options.stopProcessing) {
                break;
            }
        }
    }
    promiseAny(iterable) {
        //Promise.reject returns on first call, reverse to get first one to settle
        //Promise.resolve waits for entire chain to complete, reverse to get all rejects after they have settled
        const reverse = (promise) => {
            return new Promise((resolve, reject) => Promise.resolve(promise).then(reject, resolve));
        };
        return reverse(Promise.all([...iterable].map(reverse)));
    }
    ;
}
exports.ArrayUtils = ArrayUtils;
exports.arrayUtils = new ArrayUtils();
class Flags {
    caseInsensitive = false;
    numeric = false;
}
//# sourceMappingURL=array-utils.js.map