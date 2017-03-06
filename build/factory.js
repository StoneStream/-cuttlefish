import webpack from 'webpack'
import webpackConfig from './webpack.js'
import config from './config.js';
import webpackServer from 'webpack-dev-server'
import ProgressPlugin from 'webpack/lib/ProgressPlugin'

import merge from 'webpack-merge';

import inquirer from 'inquirer';
import open from './lib/open'

const App = {};
App.config = webpackConfig;

App.startup = (baseWebpackConfig) => {
    let webpackConfig = baseWebpackConfig ? baseWebpackConfig : App.config;
    webpackConfig.entry.app.unshift(
        `webpack-dev-server/client?${config.get("host_port")}`,
        'webpack/hot/dev-server'
    )
    webpackConfig.performance = {
      hints: false,
      maxAssetSize: 600000
    };
    webpackConfig.plugins.push(
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NamedModulesPlugin(),
        new webpack.DefinePlugin({
          'process.env': {
            NODE_ENV: '"development"'
          }
        })
    )
    let compiler = webpack(webpackConfig);
    compiler.apply(new ProgressPlugin());

    let serverConfig = {
        inline: true,
        contentBase: "/",
        hot: true,
        historyApiFallback:true,
        stats: {
            colors: true,
            chunks: false
        },
        proxy: config.get("proxy")
    }

    if(config.get("setProxy")) {
        serverConfig.proxy = config.get("proxy");
        console.log("proxy=>", JSON.stringify(config.get("proxy"))+'\n')
    }

    const Server = new webpackServer(compiler,serverConfig)

    let isStart = false;
  	compiler.plugin("done", function (stats) {
  		if (stats.hasErrors()) {
  			console.log("compiler errors")
  			return;
  		}
  		if (isStart) {
  			return;
  		}
  		Server.listen(config.get('port'), '0.0.0.0', function () {
  			console.log('Server running at:', config.get("host_port"));
  			isStart = true;
        let questions = [{
          name: 'open',
          message: 'Open in Browser?',
          type: 'confirm'
        }]
        inquirer.prompt(questions).then(function (answers) {
          if(answers.open) {
            open(config.get("host_port"))
          }
        });
  		})
  	});
}

App.compile = () => {
    let baseWebpackConfig = App.config;
    const webpackConfig = merge(baseWebpackConfig, {
        performance: { hints: false },
        devtool: "cheap-module-source-map",
        output: {
            path: config.get('assetsRootPath'),
            filename: 'script/[name].[chunkhash].js',
            chunkFilename: 'script/[name].chunk.[chunkhash].js',
            publicPath: config.get("assetsPublic")
        },
        plugins: [
            new webpack.LoaderOptionsPlugin({
                minimize: true
            }),
            new webpack.optimize.UglifyJsPlugin({
                sourceMap: true,
                compress: {
                    warnings: false
                },
                output: {
                    comments: false
                }
            }),
            new webpack.DefinePlugin({
              'process.env': {
                NODE_ENV: '"production"'
              }
            })
        ]
    });

    let compiler = webpack(webpackConfig)
    compiler.apply(new ProgressPlugin())
    compiler.run(function(err, stats) {
        if (err) throw err
        process.stdout.write(stats.toString({
            colors: true,
            modules: false,
            children: false,
            chunks: false,
            chunkModules: false
        }) + '\n')
    })
}

export default App;
