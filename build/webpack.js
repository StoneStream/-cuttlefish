import webpack from 'webpack'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import path from 'path'
import config from './config.js'

import ExtractTextPlugin from 'extract-text-webpack-plugin'
// import autoprefixer from 'autoprefixer'
import utils from './lib/utils'

let loadCss;
let loadLess;

if (config.get('isBuild')) {
    loadCss = ExtractTextPlugin.extract({fallbackLoader: "style-loader", loader: "css-loader"})
    loadLess = ExtractTextPlugin.extract({fallbackLoader: "style-loader", loader: "css-loader!less-loader"})
} else {
    loadCss = 'style-loader!css-loader'
    loadLess = 'style-loader!css-loader!less-loader'
}

const baseConfig = {
    context: path.resolve(__dirname, '../client'),
    entry: {
        app: ['./startup/main.js'],
        vendor: config.get('isBuild')
            ? config.get('product_dependencies')
            : config.get('vendor_dependencies'),
        vendor_ui: config.get('vendor_ui')
    },
    output: {
        path: '/',
        filename: '[name].js',
        chunkFilename: '[name].chunk.js',
        publicPath: '/'
    },
    resolve: {
        modules: [
            "imports",
            "imports/bower_components",
            path.resolve(__dirname, "../client"),
            "node_modules"
        ],
        descriptionFiles: [
            'package.json', 'bower.json'
        ],
        mainFiles: [
            "main", "index"
        ],
        aliasFields: ["browser"],
        extensions: ['.js'],
        alias: {
           'images': 'assets/images',
           'stylesheets': 'assets/stylesheets'
        }
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: [
                    {
                        loader: "babel-loader",
                        query: {
                            presets: [
                                [
                                    'es2015', {modules: false}
                                ],
                                'react'
                            ]
                        }
                    }
                ],
                exclude: /(node_modules|bower_components)/
            }, {
                test: /\.html$/,
                use: ["raw-loader"]
            }, {
                test: /\.json$/,
                include: path.resolve(__dirname, './client'),
                use: ["json-loader"]
            }, {
                test: /\.(png|jpe?g|gif)(\?.*)?$/,
                loader: "url-loader",
                query: {
                    limit: 8192,
                    name: utils.assetsPath('images/[name].[ext]')
                }
            }, {
                test: /\.(woff2?|eot|ttf|otf|svg)(\?.*)?$/,
                loader: "url-loader",
                query: {
                    limit: 8192,
                    name: utils.assetsPath('fonts/[name].[ext]')
                }
            },
            {
                test: /\.css$/,
                loader: loadCss
            }, {
                test: /\.less$/,
                loader: loadLess
            }
        ]
    },
    plugins: [
        new webpack.ProvidePlugin({
            "React": "preact-compat",
            "ReactDom": "preact-compat"
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: ['vendor'],
            filename: config.get('isBuild')
                ? 'lib/vendor.[hash].js'
                : 'vendor.js'
        }),
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, 'lib/index.ejs'),
            title: config.get('titleTag'),
            filename: config.get('isBuild')
                ? '../index.html'
                : 'index.html',
            favicon: path.resolve(__dirname, 'lib/favicon.ico'),
            inject: true
        })
    ]
}

if (config.get('isBuild')) {
    baseConfig.plugins.push(new ExtractTextPlugin('css/[name].[contenthash].css'))
}

export default baseConfig
