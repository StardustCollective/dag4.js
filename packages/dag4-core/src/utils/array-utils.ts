/**
 * Utility class for array operations
 * Provides methods for sorting, finding, and processing arrays
 */
export class ArrayUtils {

  /**
   * Flags for sorting operations
   */
  FLAGS = {
    /** Case-insensitive sorting */
    CASE_INSENSITIVE: { caseInsensitive: true },
    /** Numeric sorting */
    NUMERIC: { 'numeric': true }
  }

  /**
   * Sorts an array by a specified field
   * @param {T[]} arr - The array to sort
   * @param {string} [fieldName] - The field to sort by
   * @param {Flags} [flags] - Sorting flags
   * @param {Function} [sortProcessCall] - Optional function to process values before sorting
   * @returns {T[]} The sorted array
   */
  sortBy<T>(arr: T[], fieldName?: string, flags?: Flags, sortProcessCall?): T[] {
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

  /**
   * Finds an item in an array by a field value
   * @param {T[]} arr - The array to search
   * @param {string} fieldName - The field to search by
   * @param {any} fieldValue - The value to search for
   * @param {T} [defaultValue] - Default value to return if not found
   * @returns {T} The found item or the default value
   */
  findItemByFieldValue<T> (arr: T[], fieldName: string, fieldValue: any, defaultValue?: T) {

    let result = defaultValue;

    arr && arr.some(item => {
      if (item.hasOwnProperty(fieldName) && item[fieldName] === fieldValue) {

        result = item;

        return true;
      }
    });

    return result;
  }

  /**
   * Finds the index of an item in an array by a field value
   * @param {T[]} arr - The array to search
   * @param {string} fieldName - The field to search by
   * @param {any} fieldValue - The value to search for
   * @returns {number} The index of the found item, or -1 if not found
   */
  findIndexByFieldValue<T> (arr: T[], fieldName: string, fieldValue: any) {

    let result = -1;

    arr && arr.some((item, index) => {
      if (item.hasOwnProperty(fieldName) && item[fieldName] === fieldValue) {

        result = index;

        return true;
      }
    });

    return result;
  }

  /**
   * Calls a function on each item in an array asynchronously
   * @param {I[]} array - The array to process
   * @param {Function} callback - The function to call on each item
   * @returns {Promise<T[]>} A promise that resolves with the results
   */
  async asyncCallEach<T, I>(array: I[], callback: (item: I, index?: number) => Promise<T>): Promise<T[]> {
    if (!array || array.length === 0) {
      return;
    }
    const promises = array.map(async (item, index) => callback(item, index));

    return await Promise.all(promises);
  }

  /**
   * Calls a function on each item in an array synchronously
   * @param {T[]} array - The array to process
   * @param {Function} callback - The function to call on each item
   * @param {ArraySyncOptions} [options] - Options for the operation
   */
  async syncCallEach<T>(array: T[], callback: (item: T, index?: number, options?: ArraySyncOptions) => void, options = { stopProcessing: false }) {
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

  /**
   * Returns a promise that resolves with the first promise in the iterable to resolve
   * @param {Iterable<Promise<T>>} iterable - The iterable of promises
   * @returns {Promise<T>} A promise that resolves with the first resolved promise
   */
  promiseAny<T> (iterable): Promise<T> {

    //Promise.reject returns on first call, reverse to get first one to settle
    //Promise.resolve waits for entire chain to complete, reverse to get all rejects after they have settled
    const reverse = (promise) => {
      return new Promise<T>((resolve, reject) => Promise.resolve(promise).then(reject, resolve));
    }

    return reverse(Promise.all([...iterable].map(reverse)));
  };
}

/**
 * Options for synchronous array operations
 */
type ArraySyncOptions = {
  /** Whether to stop processing after the current item */
  stopProcessing: boolean
}

/**
 * Flags for sorting operations
 */
class Flags {
  /** Whether to perform case-insensitive sorting */
  caseInsensitive? = false;
  /** Whether to perform numeric sorting */
  numeric? = false;
}

export const arrayUtils = new ArrayUtils();