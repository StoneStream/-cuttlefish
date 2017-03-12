import webpack from 'webpack'
import webpackConfig from './webpack.js'
import config from './config.js';
import webpackServer from 'webpack-dev-server'
import ProgressPlugin from 'webpack/lib/ProgressPlugin'

import merge from 'webpack-merge';

import OfflinePlugin from 'offline-plugin'
import boxen from 'boxen';
import ip from 'ip';

const App = {};
App.config = webpackConfig;

App.start = (baseWebpackConfig) => {
    let webpackConfig = baseWebpackConfig
        ? baseWebpackConfig
        : App.config;
    webpackConfig.entry.app.unshift(`webpack-dev-server/client?${config.get("host_port")}`, 'webpack/hot/dev-server')
    webpackConfig.performance = {
        hints: false,
        maxAssetSize: 600000
    };
    webpackConfig.plugins.push(new webpack.HotModuleReplacementPlugin(), new webpack.NamedModulesPlugin(), new webpack.DefinePlugin({
        'process.env': {
            NODE_ENV: '"development"'
        }
    }))
    let compiler = webpack(webpackConfig);
    compiler.apply(new ProgressPlugin());

    let serverConfig = {
        inline: true,
        contentBase: "/",
        hot: true,
        historyApiFallback: true,
        stats: {
            colors: true,
            chunks: false
        },
        proxy: config.get("proxy")
    }

    if (config.get("setProxy")) {
        serverConfig.proxy = config.get("proxy");
        console.log("proxy=>", JSON.stringify(config.get("proxy")) + '\n')
    }

    let isStart = false;

    compiler.plugin("done", function(stats) {
        if (stats.hasErrors()) {
            console.log("compiler errors")
            return;
        }
        if (isStart) {
            setTimeout(function() {
                let message = `Local    =>  ${config.get("host_port")}\n`;
                let ipAddress = ip.address()
                message += `Network  =>  http://${ipAddress}:${config.get('port')}`;
                console.log(boxen(message, {padding: 1, margin: 1, borderStyle: 'double',borderColor: 'green'}));
            }, 200);
            isStart = false;
        }

    });

    new webpackServer(compiler, serverConfig).listen(config.get('port'), '0.0.0.0', function() {
        isStart = true;
    })
}

App.compile = () => {
    let baseWebpackConfig = App.config;
    const webpackConfig = merge(baseWebpackConfig, {
        performance: {
            hints: false
        },
        devtool: "cheap-module-source-map",
        output: {
            path: config.get('assetsRootPath'),
            filename: 'script/[name].[chunkhash].js',
            chunkFilename: 'script/[name].chunk.[chunkhash].js',
            publicPath: config.get("assetsPublic")
        },
        plugins: [
            new webpack.DefinePlugin({
                'process.env': {
                    NODE_ENV: '"production"'
                }
            }),
            new webpack.LoaderOptionsPlugin({minimize: true, debug: false})
        ]
    });

    let compiler = webpack(webpackConfig)
    compiler.apply(new ProgressPlugin())
    compiler.run(function(err, stats) {
        if (err)
            throw err
        process.stdout.write(stats.toString({colors: true, modules: false, children: false, chunks: false, chunkModules: false}) + '\n')
    })
}

App.startup = () => {
    let baseWebpackConfig = App.config;
    const webpackConfig = merge(baseWebpackConfig, {
        performance: {
            hints: false
        },
        devtool: "cheap-module-eval-source-map",
        plugins: [
            new webpack.DefinePlugin({
                'process.env': {
                    NODE_ENV: '"production"'
                }
            }),
            new OfflinePlugin({
                excludes: ['_redirects'],
                ServiceWorker: {
                    events: true
                },
                cacheMaps: [
                    {
                        match: /.*/,
                        to: '/',
                        requestTypes: ['navigate']
                    }
                ],
                publicPath: '/'
            }),
            new webpack.LoaderOptionsPlugin({minimize: true, debug: false}),
            new webpack.optimize.UglifyJsPlugin({sourceMap: "cheap-module-eval-source-map"})
        ]
    });

    let compiler = webpack(webpackConfig)

    let serverConfig = {
        inline: true,
        contentBase: "/",
        hot: true,
        historyApiFallback: true,
        stats: {
            colors: true,
            chunks: false
        },
        proxy: config.get("proxy"),
        compress: true
    }

    if (config.get("setProxy")) {
        serverConfig.proxy = config.get("proxy");
        console.log("proxy=>", JSON.stringify(config.get("proxy")) + '\n')
    }

    let isStart = false;

    compiler.plugin("done", function(stats) {
        if (stats.hasErrors()) {
            console.log("compiler errors")
            return;
        }
        if (isStart) {
            setTimeout(function() {
                let message = `Local    =>  ${config.get("host_port")}\n`;
                let ipAddress = ip.address()
                message += `Network  =>  http://${ipAddress}:${config.get('port')}`;
                console.log(boxen(message, {padding: 1, margin: 1, borderStyle: 'double',borderColor: 'green'}));
            }, 200);
            isStart = false;
        }

    });

    new webpackServer(compiler, serverConfig).listen(config.get('port'), '0.0.0.0', function() {
        isStart = true;
    })
}

export default App;
