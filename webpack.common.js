const path = require('path');
const webpack = require('webpack');
const {
    CleanWebpackPlugin
} = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
module.exports = {
    entry: {
        frameExtraction: './js/FrameExtraction.js'
    },
    plugins: [
        //  自动清空dist目录
        new CleanWebpackPlugin(),

        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery'
        }),
        new MiniCssExtractPlugin({
            filename: 'css/[name].css'
        }),
        new CopyWebpackPlugin([
            { from: './src/audio/', to: 'audio' }
        ]),
        //  设置html模板生成路径
        new HtmlWebpackPlugin({
            filename: 'FrameExtraction.html',
            template: './FrameExtraction.html',
            chunks: ['frameExtraction']
        })
    ],
    module: {
        rules: [{
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: [{
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            '@babel/preset-env'
                        ]
                    }
                }]
            },
            {
                test: /\.css$/,
                use: [{
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            //  css中的图片路径增加前缀
                            publicPath: '../'
                        }
                    },
                    'css-loader'
                ]
            },
            {
                test: /\.less$/,
                use: [{
                    loader: "style-loader" // creates style nodes from JS strings
                }, {
                    loader: "css-loader" // translates CSS into CommonJS
                }, {
                    loader: "less-loader" // compiles Less to CSS
                }]
            },
            {
                test: /\.(mp3)$/,
                use: [{
                    loader: 'url-loader',
                    options: {
                        //  图片输出的实际路径(相对于dist)
                        outputPath: 'audio',
                        //  当小于某KB时转为base64
                        limit: 0
                    }
                }]
            },
            {
                test: /\.(png|svg|jpg|gif|web)$/,
                use: [{
                    loader: 'url-loader',
                    options: {
                        //  图片输出的实际路径(相对于dist)
                        outputPath: 'images',
                        //  当小于某KB时转为base64
                        limit: 0
                    }
                }]
            },
            {
                test: /\.(html)$/,
                use: {
                    loader: 'html-loader',
                    options: {
                        attrs: ['img:src', 'img:data-src', 'audio:src'],
                        minimize: true
                    }
                }
            },
            {
                test: /\.(woff|woff2|eot|ttf|svg)$/,
                use: {
                    loader: 'file-loader',
                    options: {
                        //  保留文件名和后缀名
                        name: '[name].[ext]',
                        //  输出到dist/fonts/目录
                        outputPath: 'fonts',
                    }
                }
            }
        ]
    },
    //  编译输出配置
    output: {
        //  js生成到dist/js, [name]表示保留js文件名
        filename: 'js/[name].js',
        //  输出路径为dist
        path: path.resolve(__dirname, 'dist')
    },
};