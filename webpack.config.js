

module.exports = {
  entry: {
    app: './modules/game/index.js',
  },
  output: {
    filename: 'bundle.js',
    path: __dirname + '/public/javascripts'
  },
  module: {
    rules: [
      { test: /\.pug$/, use: 'pug-loader' },
      { test: /\.js$/, exclude: /node_modules/, use: [
        {loader: "babel-loader" },
        {loader: "eslint-loader"}
      ]}
    ]
  }
};