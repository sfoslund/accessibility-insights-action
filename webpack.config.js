// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const path = require('path');
const webpack = require('webpack');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');

const commonConfig = (version) => {
    console.log(`Building for version : ${version}`);
    return {
        devtool: 'cheap-source-map',
        // We special case MPL-licensed dependencies ('axe-core', '@axe-core/puppeteer') because we want to avoid including their source in the same file as non-MPL code.
        externals: ['axe-core', 'accessibility-insights-report', 'accessibility-insights-scan'],
        mode: 'development',
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    use: [
                        {
                            loader: 'ts-loader',
                            options: {
                                transpileOnly: true,
                                experimentalWatchApi: true,
                            },
                        },
                    ],
                    exclude: ['/node_modules/', /\.(spec|e2e)\.ts$/],
                },
            ],
        },
        name: 'scan-action',
        node: {
            __dirname: false,
        },
        plugins: [
            new webpack.DefinePlugin({
                __IMAGE_VERSION__: JSON.stringify(version),
            }),
            new ForkTsCheckerWebpackPlugin(),
            new CaseSensitivePathsPlugin(),
        ],
        resolve: {
            extensions: ['.ts', '.js', '.json'],
            mainFields: ['main'], //This is fix for this issue https://www.gitmemory.com/issue/bitinn/node-fetch/450/494475397
        },
        target: 'node',
    };
};

module.exports = (env) => {
    const version = env ? env.version : 'dev';
    return [
        {
            ...commonConfig(version),
            name: 'ado-extension',
            entry: {
                ['ado-extension']: path.resolve('./src/ado-extension/index.ts')
            },
            output: {
                path: path.resolve('./dist/ado-extension'),
                filename: '[name].js',
                libraryTarget: 'commonjs2',
            },
        },
        {
            ...commonConfig(version),
            name: 'gh-action',
            entry: {
                ['gh-action']: path.resolve('./src/gh-action/index.ts'),
            },
            output: {
                path: path.resolve('./dist/gh-action'),
                filename: '[name].js',
                libraryTarget: 'commonjs2',
            },
        },
    ];
}
