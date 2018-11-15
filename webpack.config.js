const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack')

module.exports = {
  mode: "development",
  target: "web",
  entry: "./index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    // filename: "bundle.js"
    filename: "[chunkhash].bundle.js", // 输出的 bundle 的名称
    publickPath: "/assets",
    // 如果生成的输出文件是在 HTML 页面中作为一个 script 标签引入，则变量 MyLibrary 将与入口文件的返回值绑定
    library: "MyLibrary",
    libraryTarget: "umd",
    // auxiliaryComment: "test comment", // 为 libraryTarget 每种类型都插入相同的注释
    auxiliaryComment: {
      // 对于 libraryTarget 每种类型的注释进行更细粒度地控制
      root: "root comment",
      commonjs: "commonjs comment",
      amd: "amd comment"
    },
    // 告诉webpack在bundle中引入（所包含模块信息）的相关注释
    pathinfo: true,
    // 非入口(non-entry) chunk 文件的名称
    chunkFileName: "[chunkhash].chunk.js",
    // chunk 请求到期之前的毫秒数
    chunkLoadTimeout: 12000,

    // 只用于target是web，使用了通过script标签的jsonp来按需加载chunk
    // crossOriginLoading: false, // 禁用跨域加载（默认）
    // crossOriginLoading: "anonymous", // 不带凭据启用跨域加载
    crossOriginLoading: "use-credentials", // 带凭据(credential)启用跨域加载

    devtoolModuleFilenameTemplate: "webpack:///[resource-path]?[hash]",
    // 自定义热更新的主文件名(main filename)
    hotUpdateMainFilename: "[hash].hot-update.json"
  },
  module: {
    rules: [
      {
        test: /\.txt$/,
        use: "raw-loader"
      },
      {
        test: /\.css$/,
        use: "url-loader",
        resourceQuery: /inline/
        // oneOf: [ // 当规则匹配时，只使用第一个匹配规则
        //   {
        //     resourceQuery: /inline/,
        //     use: 'url-loader'
        //   },
        //   {
        //     resourceQuery: 'external',
        //     use: 'file-loader'
        //   }
        // ],
        // use: [  // 为每一个入口（entry）指定一个loader
        //   'style-loader',
        //   {
        //     loader: 'css-loader',
        //     options: {
        //       importLoaders: 1
        //     }
        //   },
        //   {
        //     loader: 'less-loader',
        //     options: {
        //       noIeCompat: true
        //     }
        //   }
        // ]
      },
      {
        test: /\.ts$/,
        use: "ts-loader"
      },
      {
        test: /\.jsx?$/,
        // 如果提供了include，就不能再提供resource
        include: [path.resolve(__dirname, "app")],
        // 如果提供了exclude，就不能再提供resource
        exclude: [path.resolve(__dirname, "app/demo-files")],
        // 用来与被发布的 request 对应的模块项匹配
        issuer: { test, include, exclude },
        // enforce，指定loader种类
        enforce: "pro",
        enforce: "post",
        loader: "babel-loader",
        options: {
          presets: ["es2015"]
        }
      },
      {
        test: /\.html$/,
        test: ".html$",
        use: [
          "htmllint-loader",
          {
            loader: "html-loader"
          }
        ]
      }
    ],
    // noParse: [/special-library\.js$/],
    noParse: content => /jquery|lodash/.test(content), // 不解析的文件
    // 不解析这里的模块
    unknownContextRequest: ".",
    unknownContextRecursive: true,
    unknownContextRegExp: /^\.\/.*$/,
    unknownContextCritical: true,
    exprContextRequest: ".",
    exprContextRegExp: /^\.\/.*$/,
    exprContextRecursive: true,
    exprContextCritical: true,
    wrappedContextRegExp: /.*/,
    wrappedContextRecursive: true,
    wrappedContextCritical: false
  },
  // 解析模块请求的选项
  resolve: {
    modules: ["node_modules", path.resolve(__dirname, "app")],
    // 用于查找模块的目录
    extensions: [".js", ".json", "jsx", ".css"],
    alias: {
      // 模块别名列表
      // 起别名："module" -> "new-module" 和 "module/path/file" -> "new-module/path/file"
      module: "new-module",
      // 起别名 "only-module" -> "new-module"，但不匹配 "only-module/path/file" -> "new-module/path/file"
      "only-module$": "new-module",
      module: path.resolve(__dirname, "app/third/module.js")
    }
  },
  // 性能提示
  performance: {
    hints: "error",
    maxAssetSize: 200000,
    maxEntrypointSize: 400000, // 最大字节的新能提示
    // 给出css和js性能提示文件
    assetFilter: function(assetFilename) {
      // 提供资源文件名的断言函数
      return assetFilename.endWith(".css") || assetFilename.endWith(".js");
    }
  },
  devtool: "inline-source-map", // 嵌入到源文件中
  constent: __dirname,
  // 包运行的环境
  // target: "node",
  target: compiler => {
    compiler.apply(new webpack.LoaderOptionsPlugin("web"));
  },
  // 防止将某些import的包（package）打包到bundle中，而是在运行时（runtime）再去从外部获取这些扩展依赖（external dependencies）
  externals: (context, request, callback) => {
    if (/yourregex$/.test(request)) {
      return callback(null, "commonjs" + request);
    }
    callback();
  },

  devServer: {
    proxy: {
      "/api": "http://localhost:3000"
    },
    contentBase: path.join(__dirname, "public"),
    compress: true,
    historyApiFallback: true,
    hot: true,
    https: false,
    noInfo: false,
    // 精确控制要显示的bundle信息,对于 webpack-dev-server，这个属性要放在 devServer 对象里。
    stats: {
      assets: true,
      colors: true,
      errors: true,
      errorDetails: true,
      hash: true
    }
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin(),
    new HtmlWebpackPlugin({ template: "./src/index.html" })
  ]
};