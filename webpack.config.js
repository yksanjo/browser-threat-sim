const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    'background': './src/background/service-worker.ts',
    'content/github': './src/content/github.ts',
    'content/linkedin': './src/content/linkedin.ts',
    'content/gmail': './src/content/gmail.ts',
    'content/injector': './src/content/injector.ts',
    'content/detector': './src/content/detector.ts',
    'popup': './src/popup/index.tsx'
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      '@shared': path.resolve(__dirname, 'src/shared'),
      '@ai': path.resolve(__dirname, 'src/ai'),
      '@background': path.resolve(__dirname, 'src/background')
    }
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    clean: true
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/popup/popup.html',
      filename: 'popup.html',
      chunks: ['popup']
    })
  ],
  optimization: {
    minimize: false
  }
};
