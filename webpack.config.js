const path = require("path");
const nodeExternals = require("webpack-node-externals");
const ShebangPlugin = require("webpack-shebang-plugin");

module.exports = {
  mode: "production",
  target: "node",
  plugins: [ new ShebangPlugin()],
  externals: [
    nodeExternals({
      modulesFromFile: {
        exclude: ["dependencies"],
        include: ["devDependencies"],
      },
    }),
  ],
  entry: {
    "build": path.resolve(__dirname, "./src/index.ts")
  },
  output: {
    filename: "index.js",
    path: path.resolve(__dirname, "build"),
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          {
            loader: "ts-loader",
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
    modules: ["node_modules"]
  },
};
