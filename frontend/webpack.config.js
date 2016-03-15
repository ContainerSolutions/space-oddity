module.exports = {
    entry: {
        javascript: './src/droneChart.jsx',
        html: './index.html'
    },
    output: {
        filename: 'bundle.js',
        publicPath: 'http://localhost:8090/assets'
    },
    module: {
        loaders: [
           {
              test: /\.jsx$/,
              exclude: /node_modules/,
              loaders: ["babel-loader"],
            },
            {
              test: /\.html$/,
              loader: "file?name=[name].[ext]",
            }
        ]
    },
    externals: {
        'react': 'React'
    },
    resolve: {
        extensions: ['', '.js', '.jsx']
    }
}