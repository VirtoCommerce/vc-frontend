const pages = {
  catalog: "src/pages/catalog/main.ts",
  home: "src/pages/home/main.ts",
};

module.exports = {
  pages,
  outputDir: "../assets/static/bundle/dist",
  filenameHashing: false,
  runtimeCompiler: true,
  transpileDependencies: [
    "@fortawesome/fontawesome-svg-core",
    "@fortawesome/free-regular-svg-icons",
    "@fortawesome/free-solid-svg-icons",
    "@fortawesome/vue-fontawesome",
    "axios",
    "bootstrap",
    "bootstrap-vue",
    "rxjs",
    "vue-axios",
    "vue-i18n",
    "vue-loading-overlay",
    "vue-moment",
    "vue-router",
    "vue-rx",
    "vuelidate",
    "vuex",
    "vuex-class"
  ],
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

  css: {
    extract: true
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
