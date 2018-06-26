

module.exports = {
  entry: {
    game: './modules/game/index.js',
    home: './modules/home/index.js'
  },
  output: {
    filename: '[name].js',
    path: __dirname + '/public/javascripts'
  },
  module: {
    rules: [
      { test: /\.pug$/, use: 'pug-loader' },
      { test: /\.js$/, exclude: /node_modules/, use: [
        {loader: 'babel-loader' },
        {loader: 'eslint-loader'}
      ]}
    ]
  }
}