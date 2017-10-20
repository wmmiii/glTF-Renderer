const path = require('path');

module.exports = {
  entry: './src/Main.ts',
  module:
      {rules: [{test: /\.tsx?$/, use: 'ts-loader', exclude: /node_modules/}]},
  resolve: {extensions: ['.tsx', '.ts', '.js']},
  output: {filename: 'main.js', path: path.resolve(__dirname, 'build')},
  devtool: 'source-map',
  devServer: {}
};
