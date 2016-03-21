module.exports = {
    entry: './src/ThreeDeeScene.js',
    output: {
        path: __dirname+"/app/js/",
        filename: 'ThreeDeeScene.js',
        libraryTarget: 'umd',
        library: 'ThreeDeeScene'        
    },
    module: {
        loaders: [{
            test: /\.js?$/,
            exclude: /node_modules/,
            loader: 'babel-loader'
        }]
    }
};
