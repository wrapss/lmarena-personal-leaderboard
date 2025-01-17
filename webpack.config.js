const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const ZipPlugin = require("zip-webpack-plugin");

module.exports = (env) => {
  const browser = env.browser || "chrome";

  return {
    mode: "production",
    entry: {
      content: "./src/common/content.js",
      popup: "./src/common/popup.js",
    },
    output: {
      path: path.resolve(__dirname, `dist/${browser}`),
      filename: "[name].js",
    },
    plugins: [
      new CopyPlugin({
        patterns: [
          { from: `src/${browser}/manifest.json`, to: "manifest.json" },
          { from: "src/common/popup.html", to: "popup.html" },
          { from: "src/icons", to: "icons" },
        ],
      }),
      new ZipPlugin({
        filename: `lmarena-leaderboard-${browser}.zip`,
      }),
    ],
  };
};
