import nodeExternals from 'webpack-node-externals';
import webpack from 'webpack';
import path from 'path';
import * as url from 'url';

const dirname = url.fileURLToPath(new URL('.', import.meta.url));

export default {
    mode: 'production',
    target: 'es2020',
    entry: './src/index.mts',
    output: {
        path: path.join(dirname, 'dist'),
        filename: 'index.prod.min.mjs',
    },
    externals: [
        nodeExternals({
            // @ts-expect-error
            importType: 'module',
        }),
    ],
    externalsPresets: {
        node: true,
    },
    experiments: {
        outputModule: true,
    },
    externalsType: 'module',
    module: {
        rules: [
            {
                test: /\.m?tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.node$/,
                loader: 'node-loader',
                options: {
                    name: '[path][name].[ext]',
                },
            },
        ],
    },
    resolve: {
        extensionAlias: {
            '.js': ['.ts', '.js'],
            '.mjs': ['.mts', '.mjs'],
        },
    },
    devtool: 'source-map',
    plugins: [
        new webpack.BannerPlugin({
            banner: '#!/usr/bin/env node',
            raw: true,
        }),
    ],
};
