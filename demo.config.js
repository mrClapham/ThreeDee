module.exports = {
    entry: './src/ThreeDeeScene.js',
    output: {
        path: __dirname+"/dist",
        filename: 'ThreeDeeScene.js'
    },
    module: {
        loaders: [{
            test: /\.js?$/,
            exclude: /node_modules/,
            loader: 'babel-loader'
        }]
    }
};
