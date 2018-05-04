const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, '../dist')
  },
  devServer: {
    contentBase: '../dist'
  },
  mode:"development",
  module:{
      rules:[
          {
              test:/\.(scss|css)$/,
              use: ExtractTextPlugin.extract({
                fallback: "style-loader",
                publicPath: '../../', 
                use: [{
                  loader:'css-loader'
                },{
                  loader:'isprite-loader',
                  options:{
                    outputPath:'./src/assets/img/',
                    mobile:true
                  }
                },{
                  loader:'sass-loader'
                }],
              })
          },{
              test: /\.(png|svg|jp?g|gif)$/,
              use: [
                {
                  loader: 'url-loader',
                  options: {
                    limit: 10,  //3kb以内采用base64
                    name: 'assets/img/[name]-[hash:6].[ext]'
                  }
                },
                {
                  loader: 'image-webpack-loader', 
                  options: {
                    mozjpeg: {
                      progressive: true,
                      quality: 65
                    },
                    optipng: {
                      enabled: false,
                    },
                    pngquant: {
                      quality: '65-90',
                      speed: 4
                    },
                    gifsicle: {
                      interlaced: false,
                    },
                  }
                },
              ]
          }
      ]
  },
  plugins: [
    new HtmlWebpackPlugin({
        title: 'Output Management'
    }),
    new ExtractTextPlugin("assets/css/styles.css")
  ]
};