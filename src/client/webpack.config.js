const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const webpack = require('webpack');

const devMode = process.env.NODE_ENV !== 'production';

const mode = devMode ? 'development' : 'production';

var extractPlugin = new MiniCssExtractPlugin({
    filename: 'bundle.css'
});

let main = ['./src/client/App.tsx'];
if (devMode) {
    main.unshift('webpack-hot-middleware/client?reload=true');
}


module.exports = {
    entry: { main },

    output: {
        filename: "client.js",
        path: __dirname + "/../../build/public"
    },

    devtool: "source-map",

    resolve: {
        extensions: [".ts", ".tsx", ".js", ".json"],
        plugins: [new TsconfigPathsPlugin({ configFile: './src/client/tsconfig.json' })]
    },

    module: {
        rules: [
            { test: /\.tsx?$/, loader: "ts-loader" },
            {
                test: /\.scss$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader
                    },
                    'css-loader',
                    'sass-loader'
                ]
            }
        ]
    },

    plugins: [
        extractPlugin,
        new webpack.HotModuleReplacementPlugin()
    ],

};
