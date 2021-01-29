const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

// Phaser webpack config
const phaserModule = path.join(__dirname, '/node_modules/phaser/')
const phaser = path.join(phaserModule, 'dist/phaser.min.js')

const definePlugin = new webpack.DefinePlugin({
  __DEV__: JSON.stringify(JSON.parse(process.env.BUILD_DEV || 'true')),
  WEBGL_RENDERER: true,
  CANVAS_RENDERER: true
})

module.exports = {
  mode: 'production',
  entry: {
    app: [
      path.resolve(__dirname, 'src/main.ts')
    ],
    vendor: ['phaser']
  },
  output: {
    pathinfo: true,
    path: path.resolve(__dirname, 'build'),
    publicPath: './',
    filename: 'bundle.[name].js'
  },
  optimization: {
    minimizer: [new UglifyJsPlugin()],
  },
  plugins: [
    definePlugin,
    new HtmlWebpackPlugin({
      template: './src/index.html',
      chunks: ['vendor', 'app'],
      chunksSortMode: 'manual',
      minify: {
        removeAttributeQuotes: true,
        collapseWhitespace: true,
        html5: true,
        minifyCSS: true,
        minifyJS: true,
        minifyURLs: true,
        removeComments: true,
        removeEmptyAttributes: true
      },
      hash: true
    }),
    new CopyPlugin({
      patterns: [
        { from: "assets", to: "assets" }
      ],
    })
  ],
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        include: path.join(__dirname, 'src'),
      },
      {
        test: [/\.vert$/, /\.frag$/],
        use: 'raw-loader'
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      'phaser': phaser,
    }
  }
}
