const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = [
  {
    entry: {
      "./friends": "./public/friends.js",
      "./users": "./public/users.js",
      "./news": "./public/news.js",
    },
    output: {
      filename: "[name].js",
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          use: {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env"],
            },
          },
        },
      ],
    },
    optimization: {
      minimize: true,
      minimizer: [new TerserPlugin()],
    },
  },

  {
    mode: "none",
    entry: "./public/style.scss",
    module: {
      rules: [
        {
          test: /\.scss$/,
          use: [
            MiniCssExtractPlugin.loader,
            "css-loader",
            {
              loader: "sass-loader",
              options: {
                sassOptions: {
                  outputStyle: "compressed",
                },
              },
            },
          ],
        },
      ],
    },
    plugins: [new MiniCssExtractPlugin()],
  },
];
