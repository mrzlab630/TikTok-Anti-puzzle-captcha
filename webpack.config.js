/**
 *
 * by mrZ
 * Email: mrZ@mrZLab630pw
 * Date: 12.05.2020
 * Time: 13:46
 * About:
 *
 */
const path = require('path');
const nodeExternals = require('webpack-node-externals');



const serverConfig = {
    mode: 'development',
    devtool:"cheap-eval-source-map",
    target: 'node',
    externals: [nodeExternals()],
    node: {
        __dirname: false
    },
    entry: {
    index: ['@babel/polyfill',path.resolve(__dirname, 'src','index.js')]
        },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: path.resolve(__dirname,'node_modules'),
                use:[
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-env'],
                            plugins: ['@babel/plugin-proposal-class-properties']
                        }
                    }
                ]
            }
        ]
    },
    plugins:[],
    output: {
        path: path.resolve(__dirname,'dist'),
       // publicPath: "/public",
        filename:'[name].js'
    },
    //resolve:resolve,
    //  watch:watch.watch,
    //  watchOptions:watch.watchOptions,
   // devServer:devServer
};


module.exports = serverConfig;