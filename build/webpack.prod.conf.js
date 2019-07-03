'use strict'
const path = require('path')
const utils = require('./utils')
const webpack = require('webpack')
const config = require('../config')
const merge = require('webpack-merge')
const baseWebpackConfig = require('./webpack.base.conf')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
const CompressionWebpackPlugin = require('compression-webpack-plugin')
const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const fs = require('fs')
const mjsmaker = require('./scripts')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const env = process.env.NODE_ENV === 'testing'
    ? require('../config/test.env')
    : require('../config/prod.env')

const webpackConfig = merge(baseWebpackConfig, {
    module: {
        rules: utils.styleLoaders({
            sourceMap: config.build.productionSourceMap,
            extract: true,
            usePostCSS: true
        })
    },
    devtool: config.build.productionSourceMap ? config.build.devtool : false,
    output: {
        path: config.build.assetsRoot,
        filename: utils.assetsPath('js/[name].js'),
        chunkFilename: utils.assetsPath('js/[id].js')
    },
    plugins: [
        //new BundleAnalyzerPlugin(),
        // http://vuejs.github.io/vue-loader/en/workflow/production.html
        new webpack.DefinePlugin({
            'process.env': env
        }),
        new UglifyJsPlugin({
            test: /\.(js|mjs)$/,
            uglifyOptions: {
                ecma : 8,
                compress: true,
                minimize: true,
                //ie8 : true,
                safari10 : true,
                output: {
                    comments: false
                },
            },
            sourceMap: false,
            parallel: true
        }),
        // extract css into its own file
        new ExtractTextPlugin({
            filename: utils.assetsPath('css/[name].css'),
            // Setting the following option to `false` will not extract CSS from codesplit chunks.
            // Their CSS will instead be inserted dynamically with style-loader when the codesplit chunk has been loaded by webpack.
            // It's currently set to `true` because we are seeing that sourcemaps are included in the codesplit bundle as well when it's `false`,
            // increasing file size: https://github.com/vuejs-templates/webpack/issues/1110
            //allChunks: true,
        }),
        // Compress extracted CSS. We are using this plugin so that possible
        // duplicated CSS from different components can be deduped.
        new OptimizeCSSPlugin({
            cssProcessorOptions: config.build.productionSourceMap
                ? {safe: true, map: {inline: false}}
                : {safe: true}
        }),
        // keep module.id stable when vendor modules does not change
        new webpack.HashedModuleIdsPlugin(),
        // enable scope hoisting
        new webpack.optimize.ModuleConcatenationPlugin(),

        // split vendor js into its own file
        new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor',
            minChunks(module) {
                //console.log('VENDOR:', module.resource);
                // any required modules inside node_modules are extracted to vendor
                return (
                    module.resource &&
                    /\.js$/.test(module.resource) &&
                    module.resource.indexOf(
                        path.join(__dirname, '../node_modules')
                    ) === 0
                )
            }
        }),
        // extract webpack runtime and module manifest to its own file in order to
        // prevent vendor hash from being updated whenever app bundle is updated
        /*
        new webpack.optimize.CommonsChunkPlugin({
          name: 'manifest',
          minChunks: Infinity
        }),
        */
        // This instance extracts shared chunks from code splitted chunks and bundles them
        // in a separate chunk, similar to the vendor chunk
        // see: https://webpack.js.org/plugins/commons-chunk-plugin/#extra-async-commons-chunk
        new webpack.optimize.CommonsChunkPlugin({
            name: 'app',
            async: 'vendor-async',
            children: true,
            minChunks: 3
        }),

        // copy custom static assets
        new CopyWebpackPlugin([
            {
                from: path.resolve(__dirname, '../static'),
                to: config.build.assetsSubDirectory,
                ignore: ['.*']
            }
        ]),

        // generate dist index.html with correct asset hash for caching.
        // you can customize output by editing /index.html
        // see https://github.com/ampedandwired/html-webpack-plugin
        new HtmlWebpackPlugin({
            filename: 'platform.html',
            template: 'platform.html',
            inject: true,
            chunks: ['app', 'vendor'],
            inlineSource: 'app.js|vendor.js',
            //Injection source code to HTML
            minify: {
                removeComments: true,
                collapseWhitespace: true,
                removeAttributeQuotes: true,
                minifyCSS: true,
                minifyJS: true,
                // more options:
                // https://github.com/kangax/html-minifier#options-quick-reference
            },
            // necessary to consistently work with multiple chunks via CommonsChunkPlugin
            chunksSortMode: 'dependency'
        }),

        new HtmlWebpackInlineSourcePlugin(),

        new CompressionWebpackPlugin({
            asset: 'platform.gz',
            algorithm: 'gzip',
            deleteOriginalAssets: true,
            test: new RegExp(
                'platform\\.html$'
            ),
            minRatio: 1
        })


    ]
})

//Applications
const apps_path = path.resolve(__dirname, '../src/applications/');

fs.readdirSync(apps_path).forEach(file => {
    let dir = path.resolve(apps_path, file);
    if (fs.lstatSync(dir).isDirectory()) {
        let manifest = JSON.parse(fs.readFileSync(`${dir}/manifest.json`));

        //Including components files
        utils.componentSources(manifest).map((source, index) => {
            let filename = `apps/${file}/component${index}.js`;
            webpackConfig.plugins.push(
                new webpack.optimize.CommonsChunkPlugin({
                    name: `${file}-component-${index}`,
                    filename: filename,
                    children: true,
                })
            );
            webpackConfig.plugins.push(
                new CompressionWebpackPlugin({
                    asset: `apps/${file}/component${index}.jgz`,
                    algorithm: 'gzip',
                    deleteOriginalAssets: true,
                    test: new RegExp(filename),
                    minRatio: 1
                })
            );
        });

        mjsmaker.make(file, manifest);
    }
});

if (config.build.bundleAnalyzerReport) {
    const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
    webpackConfig.plugins.push(new BundleAnalyzerPlugin())
}

module.exports = webpackConfig
