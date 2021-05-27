import { Application } from "express";
import webpack from "webpack";
import path from "path";
import webpackDevMiddleware from "webpack-dev-middleware";
import webpackHotMiddleware from "webpack-hot-middleware";
// @ts-expect-error no types found
import reactRefresh from "react-refresh/babel";
import ReactRefreshWebpackPlugin from "@pmmmwh/react-refresh-webpack-plugin";
import fs from "fs";
// @ts-expect-error no types found
import emotionBabelPlugin from "@emotion/babel-plugin";

const frontendDevMiddleware = (app: Application) => {
  const hmrPlugin = new webpack.HotModuleReplacementPlugin();
  const webpackOpts: webpack.Configuration = {
    target: "web", // if in production, use "browserslist" instead
    entry: {
      main: ["webpack-hot-middleware/client?reload=true", path.join(__dirname, "src", "index.jsx")],
    },
    mode: "development",
    // devtool: false,
    output: {
      filename: "bundle.js",
      path: path.join(__dirname, "dist"),
    },
    plugins: [
      // OccurrenceOrderPlugin is needed for webpack 1.x only
      // new webpack.optimize.OccurrenceOrderPlugin(),
      hmrPlugin,
      // Use NoErrorsPlugin for webpack 1.x
      // new webpack.NoEmitOnErrorsPlugin(),
      new ReactRefreshWebpackPlugin({
        overlay: true,
        forceEnable: true,
        include: path.join(__dirname, "src", "index.jsx"),
      }),
    ],
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env", "@babel/preset-react"],
              plugins: [reactRefresh, emotionBabelPlugin],
            },
          },
        },
      ],
    },
    resolve: {
      extensions: ["", ".js", ".jsx", ".ts", ".tsx"],
    },
  };
  const middlewareOpts = {};
  const compiler = webpack(webpackOpts);
  app.use(webpackDevMiddleware(compiler, middlewareOpts));
  app.use(webpackHotMiddleware(compiler));
  app.get("*", (req, res) => {
    fs.readFile(path.join(__dirname, "src/index.html"), (err, data) => {
      if (err) {
        return res.sendStatus(500);
      } else {
        res.header("content-type", "text/html").send(data.toString());
      }
    });
  });
};

export default frontendDevMiddleware;
