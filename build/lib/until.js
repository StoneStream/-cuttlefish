import config from '../config.js'

import cssnext from 'postcss-cssnext'
import clean from 'postcss-clean'

import ExtractTextPlugin from 'extract-text-webpack-plugin'

function cssLoader (baseConfig) {
  if (config.get('isBuild')) {
      let cssRules = {
          test: /\.css$/,
          use: ExtractTextPlugin.extract({
              fallback: "style-loader",
              use: [
                  "css-loader", {
                      loader: 'postcss-loader',
                      options: {
                          plugins: function() {
                              return [
                                  cssnext({
                                      features: {
                                          customProperties: false
                                      }
                                  }),
                                  clean()
                              ];
                          }
                      }
                  }
              ]
          })
      }
      baseConfig.module.rules.push(cssRules);
      baseConfig.plugins.push(new ExtractTextPlugin({filename: 'css/[name].[contenthash].css', allChunks: true}))
  } else {
      let cssRules = {
          test: /\.css$/,
          use: [
              {
                  loader: "style-loader" // creates style nodes from JS strings
              }, {
                  loader: "css-loader" // translates CSS into CommonJS
              }, {
                  loader: 'postcss-loader',
                  options: {
                      plugins: function() {
                          return [
                              cssnext({
                                  features: {
                                      customProperties: false
                                  }
                              }),
                              clean()
                          ];
                      }
                  }
              }
          ]
      }
      baseConfig.module.rules.push(cssRules)
  }
  return baseConfig;
}

export {cssLoader as cssLoader}
