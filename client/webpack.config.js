const path = require('path');

const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const webpack = require('webpack');

module.exports = {
    entry: './src/a1-main.js',
    output: {
        //filename: '[name].[contentHash].bundle.js',
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [
            { test: /\.js$/, use: 'babel-loader' },
            { test: /\.vue$/, use: 'vue-loader' },
            { test: /\.css$/, use: ['vue-style-loader', 'css-loader'] },
        ]
    },
    devServer: {
        open: true,
        hot: true,
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: './src/a1-index.html',
        }),
        new VueLoaderPlugin(),
        new webpack.HotModuleReplacementPlugin(),
    ]
};

// webpack entry file
/*const entry = ((filepathList) => {
    let entry = {}
    filepathList.forEach(filepath => {
        const list = filepath.split (/[\/|\\\/\|\\|\\\\g); //slash split file directory)
        const key = list [list. length - 1]. replace (/ JS /g,'')// filename to get the file
        // If it's a development environment, hot module needs to be introduced
        entry[key] = process.env.NODE_ENV === 'development' ? [filepath, 'webpack-hot-middleware/client?reload=true'] : filepath
    })
    return entry
})(glob.sync(resolve(__dirname, '../src/js/*.js')));
*/
/*
plugins: [
    // Packing files
    ...glob.sync(resolve(__dirname, '../src/tpls/*.ejs')).map((filepath, i) => {
        Const tempList = filepath. split (/[/|\\/\\/\\\\\\g)//slash split file directory)
        Const filename = `views/${tempList [tempList. length - 1]} `// filename to get the file
        Const template = filepath // specify the template address as the corresponding EJS view file path
        Const fileChunk = filename. split ('.') [0]. split (/[\/|\\\\\\\\\\g). pop ()// Gets chunkname of the corresponding view file
        Const chunks = ['manifest','vendors', fileChunk]// Assemble chunks array
        Return new Html Web pack Plugin ({filename, template, chunks})// Return an instance of Html Web pack Plugin
    })
]*/
/*
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin')

module.exports = {
    // entry,
    entry: {
        test: './src/app.js',
        b_category: './public/javascripts/buy/b_category.js'
    },
    output: {
        //filename: '[name].[contentHash].bundle.js',
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                loader: 'vue-loader'
            }, {
                test: /\.css$/,
                use: [{ loader: 'vue-style-loader' }, { loader: 'css-loader' }],
            },
            {
                test: /\.(png|jpg|gif)$/,
                use: [
                    {
                        loader: 'file-loader'
                    },
                ],
            },
        ]
    },
    plugins: [
        new VueLoaderPlugin(),
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            title: "Webpack Output",
        }),
    ],
    devServer: {
        contentBase: './dist',
        open: true
    },
};*/