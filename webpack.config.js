module.exports = {
  entry: {
    index: "./src/index.js",
    background: "./src/background.js",
  },
  output: {
    path: __dirname + "/public/",
    filename: "[name].js"
  },
}
