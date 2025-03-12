// // Initialize the compression function
const initBrotli = async () => {
  // In browser environments, use the bundled version
  if (typeof self !== 'undefined') {
    // Dynamic import for browser
    const brotliModule = require('brotli-wasm');
    return brotliModule.default || brotliModule;
  } else {
    // In Node.js, use the regular brotli package
    return require('brotli-wasm');
  }
};

// Promise to hold the compress function once initialized
const brotliPromise = initBrotli();

// Conditional import based on environment
const TextEncoderPolyfill = typeof TextEncoder === "undefined" ? require("util").TextEncoder : TextEncoder;


const removeNulls = (obj: any | null) => {
  const processValue = (value: any) => {
    if (value === null) return undefined;
    if (Array.isArray(value)) {
      return value.map((v) => processValue(v)).filter((v) => v !== undefined);
    }
    if (typeof value === "object") {
      return removeNulls(value);
    }
    return value;
  };

  return Object.entries(obj).reduce((acc, [key, value]) => {
    const processed = processValue(value);
    if (processed !== undefined) {
      acc[key] = processed;
    }
    return acc;
  }, {});
};

const sortObjectKeys = (obj: any | null) => {
  if (typeof obj !== "object" || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys);
  }

  return Object.keys(obj)
    .sort()
    .reduce((acc, key) => {
      acc[key] = sortObjectKeys(obj[key]);
      return acc;
    }, {});
};

export const normalizeObject = (obj: any | null, sort = true, remove = true) => {
  const sorted = sort ? sortObjectKeys(obj) : obj;
  const removedNulls = remove ? removeNulls(sorted) : sorted;
  return removedNulls;
};

export const serializeBrotli = async (
  content: any | null,
  compressionLevel = 2
) => {
  // Get the brotli module
  const brotliModule = await brotliPromise;
  const compress = brotliModule.compress;

  const normalized = normalizeObject(content);
  const normalizedJson = JSON.stringify(normalized);

  const encoder = new TextEncoderPolyfill();
  const utf8Bytes = encoder.encode(normalizedJson);
  return compress(utf8Bytes, { quality: compressionLevel });
};
