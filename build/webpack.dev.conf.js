'use strict'
const utils = require('./utils')
const webpack = require('webpack')
const config = require('../config')
const fs = require('fs')
const merge = require('webpack-merge')
const path = require('path')
const baseWebpackConfig = require('./webpack.base.conf')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const portfinder = require('portfinder')
const restapi = require('./restapi')
const Manifest = require('./manifest')
const MonocoEditorPlugin = require('monaco-editor-webpack-plugin')

const HOST = '0.0.0.0' //process.env.HOST
const PORT = process.env.PORT && Number(process.env.PORT)

const DEV_CONFIG = require('../config/dev.env');

if('HW_DEVICE_URL' in DEV_CONFIG)
    require('./hot-reload');

const devWebpackConfig = merge(baseWebpackConfig, {
    module: {
        rules: utils.styleLoaders({sourceMap: config.dev.cssSourceMap, usePostCSS: true})
    },
    // cheap-module-eval-source-map is faster for development
    devtool: config.dev.devtool,

    // these devServer options should be customized in /config/index.js
    devServer: {
        clientLogLevel: 'warning',
        historyApiFallback: {
            rewrites: [
                {from: /.*/, to: path.posix.join(config.dev.assetsPublicPath, 'index.html')},
            ],
        },
        hot: true,
        contentBase: false, // since we use CopyWebpackPlugin.
        compress: true,
        host: HOST || config.dev.host,
        port: PORT || config.dev.port,
        open: config.dev.autoOpenBrowser,
        overlay: config.dev.errorOverlay
            ? {warnings: false, errors: true}
            : false,
        publicPath: config.dev.assetsPublicPath,
        proxy: config.dev.proxyTable,
        quiet: true, // necessary for FriendlyErrorsPlugin
        watchOptions: {
            poll: config.dev.poll,
        },
        setup: restapi
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': DEV_CONFIG,
        }),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NamedModulesPlugin(), // HMR shows correct file names in console on update.
        new webpack.NoEmitOnErrorsPlugin(),
        // https://github.com/ampedandwired/html-webpack-plugin
        new HtmlWebpackPlugin({
            filename: 'debugger.html',
            template: './build/debugger/debugger.html',
            inject: "body",
            chunks: ['debugger'],
            inlineSource: 'debugger.js',
        }),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: 'platform.html',
            inject: "body",
            chunks: ['app'],
            inlineSource: 'app.js',
        }),
        new HtmlWebpackInlineSourcePlugin(),
        // copy custom static assets
        new CopyWebpackPlugin([
            {
                from: path.resolve(__dirname, '../static'),
                to: config.dev.assetsSubDirectory,
                ignore: ['.*']
            }
        ]),
        new MonocoEditorPlugin({
            languages: ['javascript', 'typescript']
        }),
    ]
})

module.exports = new Promise((resolve, reject) => {
    portfinder.basePort = process.env.PORT || config.dev.port
    portfinder.getPort((err, port) => {
        if (err) {
            reject(err)
        } else {
            // publish the new Port, necessary for e2e tests
            process.env.PORT = port
            // add port to devServer config
            devWebpackConfig.devServer.port = port

            // Add FriendlyErrorsPlugin
            devWebpackConfig.plugins.push(new FriendlyErrorsPlugin({
                compilationSuccessInfo: {
                    messages: [`Your application is running here: http://${devWebpackConfig.devServer.host}:${port}`],
                },
                onErrors: config.dev.notifyOnErrors
                    ? utils.createNotifierCallback()
                    : undefined
            }))

            resolve(devWebpackConfig)
        }
    })
})


//Prepare manifest and hot reload scripts
const apps_path = path.resolve(__dirname, '../src/applications/');

let manifest = {};
let appid = 1;

fs.readdirSync(apps_path).forEach(dir => {
    if (fs.lstatSync(path.resolve(apps_path, dir)).isDirectory()) {
        manifest[appid]  = Manifest.make(dir);
        appid++;
    }
});

fs.writeFileSync(path.resolve(__dirname, '../static/profile.json'), JSON.stringify(manifest));