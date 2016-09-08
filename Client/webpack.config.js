"use strict";

const webpack      = require("webpack");
const precss       = require('precss');
const autoprefixer = require('autoprefixer');
const pkg          = require("./package.json");
const lodashPack   = require("lodash-webpack-plugin");

const config = {
    entry: {
        "app": "pages/app"
    },
    output: {
        path: "wwwroot/pages",
        publicPath: "wwwroot/pages", //Must be set for webpack-dev-server
        filename: "[name].js",
    },
    resolve: {
        root:  process.cwd(),
        // Add '.ts' and '.tsx' as resolvable extensions.
        extensions: ["", ".webpack.js", ".web.js", ".ts", ".tsx", ".js"],
    },
    externals: { },
    devtool: "source-map",
    plugins: [
        new lodashPack,
        new webpack.optimize.OccurenceOrderPlugin,
        new webpack.DefinePlugin({
            "_VERSION": `"${pkg.version}"`,
        })
    ],
    module: {
        loaders: [
            { 
                test: /\.tsx?$/i, 
                loader: 'awesome-typescript-loader',
                query: {
                    useBabel: true,
                    useCache: true
                }
            },
            {
                loader: 'babel-loader',
                test: /\.js$/i,
                exclude: /node_modules/,
                query: {
                    plugins: ['lodash'],
                    presets: ['es2015'],
                },
            },
            {
                test: /\.css$/i,
                loaders: ["style", "css", "postcss-loader"]
            },
            {
                test: /\.scss$/i,
                loaders: ["style", "css", "postcss-loader", "sass"]
            },
            {
                test: /\.json$/i,
                loaders: ["json"],
            },
            {
                test: /\.(jpe?g|png|gif|svg)$/i,
                loaders: [
                    'file?hash=sha512&digest=hex&name=[hash].[ext]',
                    'image-webpack?bypassOnDebug&optimizationLevel=7&interlaced=false'
                ]
            }
        ],
        preLoaders: [
            // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
            { test: /\.js$/, loader: "source-map-loader" }
        ]
    },
    postcss: () => [precss, autoprefixer],
    devServer: {
        proxy: {
            "/api/*": {
                target: "http://localhost:7000",
                secure: false
            },
            "*": {
                bypass: (req, res, proxyOptions) =>
                {
                    // Match the Nancy API by returning the wwwroot and content files, and wildcarding the rest to index.html
                    if (/wwwroot|content|resources/i.test(req.originalUrl))
                    {
                        return req.originalUrl;
                    }

                    console.log("Request: ", req.originalUrl);

                    return "/index.html";
                }
            }
        }
    }
}

if (process.env.NODE_ENV === "production")
{
    config.plugins.push(new webpack.optimize.UglifyJsPlugin({
        compress: {
            warnings: false,
        }
    }))
}

module.exports = config;