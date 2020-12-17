export class ArrayUtils {

  FLAGS = {
    CASE_INSENSITIVE: { caseInsensitive: true },
    NUMERIC: { 'numeric': true }
  }

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

  async asyncCallEach<T, I>(array: I[], callback: (item: I, index?: number) => Promise<T>): Promise<T[]> {
    if (!array || array.length === 0) {
      return;
    }
    const promises = array.map(async (item, index) => callback(item, index));

    return await Promise.all(promises);
  }

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

  promiseAny<T> (iterable): Promise<T> {

    //Promise.reject returns on first call, reverse to get first one to settle
    //Promise.resolve waits for entire chain to complete, reverse to get all rejects after they have settled
    const reverse = (promise) => {
      return new Promise<T>((resolve, reject) => Promise.resolve(promise).then(reject, resolve));
    }

    return reverse(Promise.all([...iterable].map(reverse)));
  };
}

type ArraySyncOptions = {
  stopProcessing: boolean
}

export const arrayUtils = new ArrayUtils();

class Flags {
  caseInsensitive? = false;
  numeric? = false;
}
