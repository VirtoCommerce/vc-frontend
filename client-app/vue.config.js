const pages = {
  catalog: {
    entry: "src/pages/catalog/main.ts",
    chunks: ["chunk-vendors", "catalog"]
  },
  account: {
    entry: "src/pages/account/main.ts",
    chunks: ["chunk-vendors", "account"]
  },
  checkout: {
    entry: "src/pages/checkout/main.ts",
    chunks: ["chunk-vendors", "checkout"]
  },
  home: {
    entry: "src/pages/home/main.ts",
    chunks: ["chunk-vendors", "home"]
  }
};


module.exports = {
  pages,
  outputDir: "../assets/static/bundle/dist",
  filenameHashing: false,
  runtimeCompiler: true,
  
  devServer: {
    proxy: "http://localhost:2083"
  },

  pluginOptions: {
    i18n: {
      locale: "en",
      fallbackLocale: "en",
      enableInSFC: true
    }
  },

  //To avoid of error [mini-css-extract-plugin] warning Conflicting order
  css: {
    extract: { ignoreOrder: true }
  },

  // Web pack configuration chaining
  // https://cli.vuejs.org/guide/webpack.html#chaining-advanced
  // https://github.com/neutrinojs/webpack-chain
  chainWebpack(config) {

    config.module
      .rule("vue")
      .use("vue-loader")
      .loader("vue-loader")
      .tap(options => {
        // modify the options...
        options.compilerOptions.whitespace = "preserve";
        return options;
      });


    // Configure correct typescript aliases processing
    config.resolve.alias.delete("@");
    config.resolve
      .plugin("tsconfig-paths")
      .use(require("tsconfig-paths-webpack-plugin"));
    // Enable autofixing on save for linters (only prettier supported out of the box)
    config.module
      .rule("eslint")
      .use("eslint-loader")
      .options({
        fix: true,
      });



    // Advanced source maps processing (vue-specific)
    // By default vue generate multiple output files and source maps for single file component
    // For example: template, typescript, javascript, loading module code
    // This code select and combine them
    // https://www.mistergoodcat.com/post/the-joy-that-is-source-maps-with-vuejs-and-typescript
    config.devtool("source-map");
    config.module.rule("source-maps").test(/\.(js|jsx|ts|tsx|scss|css|vue)$/).enforce("pre").use('source-map-loader').loader('source-map-loader');
    config.output.devtoolModuleFilenameTemplate(info => {
      var $filename = "sources://" + info.resourcePath;
      if (info.resourcePath.match(/\.vue$/) && !info.query.match(/type=script/)) {
        $filename = "webpack-generated:///" + info.resourcePath + "?" + info.hash;
      }
      return $filename;
    });
    config.output.devtoolFallbackModuleFilenameTemplate("webpack:///[resource-path]?[hash]");


    config.module
      .rule("graphql")
      .test(/\.(graphql|gql)$/)
      .use("graphql-tag/loader")
      .loader("graphql-tag/loader")
      .end();

    // Disable generation of html pages because we don't use them anyway
    Object.keys(pages).forEach(page => {
      config.plugins.delete(`html-${page}`);
      config.plugins.delete(`preload-${page}`);
      config.plugins.delete(`prefetch-${page}`);
    });
  }
};
