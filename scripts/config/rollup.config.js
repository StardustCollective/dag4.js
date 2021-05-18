import { resolve } from 'path'
import sourceMaps from 'rollup-plugin-sourcemaps'
import nodeResolve from '@rollup/plugin-node-resolve'
import nodeGlobals from 'rollup-plugin-node-globals'
import nodeBuiltins from 'rollup-plugin-node-builtins'
//import nodePolyfills from 'rollup-plugin-node-polyfills';
import json from '@rollup/plugin-json'
import commonjs from '@rollup/plugin-commonjs'
import replace from '@rollup/plugin-replace'
import { terser } from 'rollup-plugin-terser'
import typescript from '@rollup/plugin-typescript';

import { getIfUtils, removeEmpty } from 'webpack-config-utils'

const { getOutputFileName } = require('./helpers')

const env = process.env.NODE_ENV || 'development'
const { ifProduction } = getIfUtils(env)

const ROOT = resolve('./')
const DIST = resolve(ROOT, 'dist')
const pkg  = require(resolve(ROOT, 'package.json'))

const LIB_NAME = 'dag4';
/**
 * Object literals are open-ended for js checking, so we need to be explicit
 * @type {{entry:{esm5: string, esm2015: string},bundles:string}}
 */
const PATHS = {
  entry: {
    esm: resolve(DIST, 'esm'),
    esm5: resolve(DIST, 'esm5'),
    esm2015: resolve(DIST, 'esm2015'),
    esNext: resolve(DIST, 'esNext'),
  },
  bundles: resolve(DIST, 'bundles'),
}

/**
 * @type {string[]}
 */
const external = (pkg.peerDependencies && Object.keys(pkg.peerDependencies)) || []

/**
 *  @type {Plugin[]}
 */
const plugins = /** @type {Plugin[]} */ ([

  // Allow TypeScript alias paths
  //typescriptPaths({ transform: m => { m.replace('build','dist/esm')} }),
  typescript(),

  // Allow json resolution
  json(),

  // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
  commonjs(),

  nodeGlobals(),
  nodeBuiltins(),
  //nodePolyfills(),

  // Allow node_modules resolution, so you can use 'external' to control
  // which external modules to include in the bundle
  // https://github.com/rollup/rollup-plugin-node-resolve#usage
    //preferBuiltins: true - use globals() instead
  nodeResolve({ preferBuiltins: false, browser: true }),

  // Resolve source maps to the original source
  sourceMaps(),

  // nodePolyfills({crypto: true}),

  // properly set process.env.NODE_ENV within `./environment.ts`
  replace({
    exclude: 'node_modules/**',
    'process.env.NODE_ENV': JSON.stringify(env),
  }),
])

/**
 * @type {Config}
 */
const CommonConfig = {
  input: {},
  output: {},
  inlineDynamicImports: true,
  // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
  external,
}

const ESMconfig = {
  ...CommonConfig,
  //context: 'window',
  input: resolve(PATHS.entry.esm, 'index.js'),
  output: [
    {
      file: getOutputFileName(
          resolve(PATHS.bundles, 'dag4.esm.js'),
          ifProduction()
      ),
      format: 'es',
      sourcemap: true,
    },
  ],
  plugins: removeEmpty(
      /** @type {Plugin[]} */ ([...plugins, ifProduction(terser())])
  ),
}

const UMDconfig = {
  ...CommonConfig,
  //context: 'window',
  input: resolve(PATHS.entry.esm, 'index.js'),
  //external: Object.keys(pkg.dependencies || {}).filter(key => /^dag4-/.test(key)),
  external: [ 'fs' ],
  output: {
    file: getOutputFileName(
      resolve(PATHS.bundles, 'dag4.umd.js'),
      ifProduction()
    ),
    format: 'umd',
    name: LIB_NAME,
    sourcemap: true,
    indent: false,
    extend: true,
    banner: `// ${pkg.homepage} v${pkg.version} Copyright ${(new Date).getFullYear()} ${pkg.author}`,
    //globals: Object.assign({}, ...Object.keys(pkg.dependencies || {}).filter(key => /^dag4-/.test(key)).map(key => ({[key]: "dag4"})))
  },
  plugins: removeEmpty(
    /** @type {Plugin[]} */ ([...plugins, ifProduction(terser())])
  ),
}

const IIFEconfig = {
  ...CommonConfig,
  context: 'window',
  input: resolve(PATHS.entry.esm, 'index.js'),
  external: [ 'fs' ],
  output: {
    file: getOutputFileName(
        resolve(PATHS.bundles, 'index.iife.js'),
        ifProduction()
    ),
    format: 'iife',
    name: LIB_NAME,
    sourcemap: true,
  },
  plugins: removeEmpty(
      /** @type {Plugin[]} */ ([...plugins, ifProduction(terser())])
  ),
}

const FESMconfig = {
  ...CommonConfig,
  //context: 'window',
  input: resolve(PATHS.entry.esm2015, 'index.js'),
  output: [
    {
      file: getOutputFileName(
        resolve(PATHS.bundles, 'index.esm.js'),
        ifProduction()
      ),
      format: 'es',
      sourcemap: true,
    },
  ],
  plugins: removeEmpty(
    /** @type {Plugin[]} */ ([...plugins, ifProduction(terser())])
  ),
}

export default [UMDconfig, IIFEconfig]
