const DEVELOPMENT = process.env.NODE_ENV !== 'production';

const pages = {
  catalog: {
    entry: "client-app/pages/catalog/main.ts",
    chunks: ["chunk-vendors", "catalog"]
  },
  account: {
    entry: "client-app/pages/account/main.ts",
    chunks: ["chunk-vendors", "account"]
  },
  checkout: {
    entry: "client-app/pages/checkout/main.ts",
    chunks: ["chunk-vendors", "checkout"]
  },
  home: {
    entry: "client-app/pages/home/main.ts",
    chunks: ["chunk-vendors", "home"]
  },
  //This entry we use only to bundle VSTFUI css that will be used for SSR iquid templates
  main: {
    entry: "assets/styles/main.scss"
  }
};


module.exports = {
  pages,
  outputDir: "assets/static/bundle/dist",
  publicPath: "/themes/assets/static/bundle/dist",
  filenameHashing: false,
  runtimeCompiler: true,
  productionSourceMap: false,

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
    extract: { ignoreOrder: true },
  },

  configureWebpack: {
    resolve: {
      extensions: ['.js', '.vue', '.json']
    },
  },

  // Web pack configuration chaining
  // https://cli.vuejs.org/guide/webpack.html#chaining-advanced
  // https://github.com/neutrinojs/webpack-chain
  chainWebpack(config) {
    config.cache({ type: DEVELOPMENT ? 'memory' : 'filesystem' });
    config.devtool("source-map");

    // Configure correct typescript aliases processing
    config.resolve.alias.delete("@");
    config.resolve
      .plugin("tsconfig-paths")
      .use(require("tsconfig-paths-webpack-plugin"));

    // We leave only used moment localization files
    // https://webpack.js.org/plugins/context-replacement-plugin/
    config
      .plugin("context-replacement")
      .use(require("webpack/lib/ContextReplacementPlugin"), [
        /moment[\/\\]locale$/,
        /en|de/,
      ]);

    config.module
      .noParse(new RegExp("^(" + [
        "core-js",
        "vue",
        "vue-i18n",
        "vue-router",
        "vue-class-component",
        "vue-property-decorator",
        "momet",
        "jquery",
        "axios",
        "bootstrap",
      ].join('|') + ')$'));

    config.module
      .rule("vue")
      .use("vue-loader")
      .loader("vue-loader")
      .tap((options) => Object.assign(options, {
        // modify the options...
        compilerOptions: {
          whitespace: "preserve",
        },
      }));

    config.module
      .rule("graphql")
      .test(/\.(graphql|gql)$/)
      .use("graphql-tag/loader")
      .loader("graphql-tag/loader")
      .end();

    ['vue-modules', 'vue', 'normal-modules', 'normal'].forEach((rule) => {
      config.module.rule('scss')
        .oneOf(rule)
        .use('resolve-url-loader')
        .loader('resolve-url-loader')
        .before('sass-loader')
        .end()
        .use('sass-loader')
        .loader('sass-loader')
        .tap(options => Object.assign(options, {
          // modify the options...
          sourceMap: true,
        }));
    });

    /*
    // Enable autofixing on save for linters (only prettier supported out of the box)
    config.module
      .rule("eslint")
      .use("eslint-loader")
      .options({
        fix: true,
      });
    */

    // Disable generation of html pages because we don't use them anyway
    Object.keys(pages).forEach(page => {
      config.plugins.delete(`html-${page}`);
      config.plugins.delete(`preload-${page}`);
      config.plugins.delete(`prefetch-${page}`);
    });
  }
};
