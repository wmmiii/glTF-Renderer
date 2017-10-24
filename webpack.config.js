const path = require('path');

module.exports = {
  entry: './src/index.ts',
  module: {
    rules: [{
      test: /\.tsx?$/,
      use: 'awesome-typescript-loader',
      exclude: /node_modules/
    }]
  },
  resolve: {extensions: ['.tsx', '.ts', '.js']},
  output: {filename: 'main.js', path: path.resolve(__dirname, 'build')},
  devtool: 'source-map',
  devServer: {},
  externals: {'react': 'React', 'react-dom': 'ReactDOM'}
};
