'use strict';
var path = require('path');

var React = require('react');
var _ = require('lodash');
var removeMd = require('remove-markdown');
var themeConfig = require('antwar-default-theme');
var rssPlugin = require('antwar-rss-plugin');
var prevnextPlugin = require('antwar-prevnext-plugin');

var markdown = require('./utils/markdown');
var highlight = require('./utils/highlight');
var webpackReactHeaders = require('./headers/webpack_react');
var webpackHeaders = require('./headers/webpack');

var cwd = process.cwd();

// XXX: add custom loader to common config
themeConfig.webpack.common = {
  resolveLoader: {
    alias: {
      markdown: path.join(cwd, 'loaders/markdown')
    }
  }
};

module.exports = {
  webpack: themeConfig.webpack, // SCSS bits
  assets: [
    {
      from: '../webpack_react/manuscript/images',
      to: 'webpack_react/images',
    },
    {
      from: '../webpack/manuscript/images',
      to: 'webpack/images',
    },
    {
      from: '../webpack_react/project_source/builds',
      to: 'demos',
    },
    {
      from: './extra',
      to: '.'
    }
  ],
  output: 'build',
  title: 'SurviveJS',
  author: 'Juho Vepsäläinen',
  blog: {
    author: function() {
      return React.createElement(
        "span",
        null,
        "Published by Juho ",
        React.createElement(
          "a",
          { href: "https://twitter.com/bebraw", className: "twitter" },
          "@bebraw"
        ),
        " Vepsäläinen"
      );
    }
  },
  keywords: ['webpack', 'react', 'javascript', 'programming', 'web development'],
  deploy: {
    branch: 'gh-pages',
  },
  pageTitle: function(config, pageTitle) {
    var siteName = config.name;

    if(pageTitle === 'index') {
      return siteName;
    }

    return siteName + ' - ' + pageTitle;
  },
  plugins: [
    rssPlugin({
      baseUrl: 'http://survivejs.com/',
      sections: ['blog'],
    }),
    prevnextPlugin()
  ],
  layout: function() {
    return require('./layouts/Body.jsx');
  },
  style: function() {
    require('./styles/custom.scss');
    require('./styles/prism.css');
    require('./styles/fontello.css');
    require('./styles/fontello-codes.css');
    require('./styles/fontello-embedded.css');
    require('react-ghfork/gh-fork-ribbon.css');
  },
  paths: {
    '/': {
      path: function() {
        return require.context('./pages', false, /^\.\/.*\.jsx$/);
      },
    },
    blog: blog(),
    webpack_react: webpackReact(webpackReactHeaders),
    webpack: webpack(webpackHeaders)
  }
};

function blog() {
  return {
    title: 'Blog posts',
    path: function() {
      return require.context('json!yaml-frontmatter!./posts', false, /^\.\/.*\.md$/);
    },
    /*
    draft: function() {
      return require.context('json!yaml-frontmatter!./drafts', false, /^\.\/.*\.md$/);
    },
    */
    processPage: {
      url: function(o) {
        if(o.file.url) {
          return o.file.url;
        }

        var page = o.fileName.split('.')[0].split('-').slice(1).join('-');

        return o.sectionName + '/' + page;
      },
      content: function(o) {
        var content = o.file.__content.split('\n').slice(1).join('\n');

        return markdown().process(content, highlight);
      }
    },
    layouts: {
      index: function() {
        return require('./layouts/BlogIndex.jsx').default;
      },
      page: function() {
        return require('./layouts/BlogPage.jsx').default;
      }
    },
    redirects: {
      'survivejs-webpack120': 'survivejs-webpack-120',
      'mobservable-interview': 'mobx-interview',
      'react-router5': 'react-router5-interview'
    }
  };
}

function webpackReact(headers) {
  return {
    title: 'Table of Contents',
    path: function() {
      return require.context('json!yaml-frontmatter!../webpack_react/manuscript', true, /^\.\/.*\.md$/);
    },
    processPage: {
      title: function(o) {
        var ret = removeMd(o.file.__content.split('\n')[0]);

        // part
        if(ret.indexOf('-#') === 0) {
          ret = ret.slice(2).trim();
        }

        if(o.file.bonus) {
          ret += '*';
        }

        return ret;
      },
      content: function(o) {
        var content = o.file.__content.split('\n').slice(1).join('\n');

        return markdown('webpack_react').process(content, highlight);
      },
      preview: function(o) {
        var previewLimit = 300;
        var content = o.file.__content.split('##')[0].split('\n').slice(1).join('\n');
        var stripped = removeMd(content);

        if(stripped.length > previewLimit) {
          return stripped.substr(0, previewLimit) + '…';
        }

        return stripped;
      },
      url: function(o) {
        var fileName = o.fileName.split('.')[0].toLowerCase();

        // normal chapter
        if(parseInt(fileName.split('_')[0], 10) >= 0) {
          return o.sectionName + '/' + fileName.split('_').slice(1).join('_');
        }

        // part
        return o.sectionName + '/' + fileName;
      },
    },
    sort: function(files) {
      var order = require('raw!../webpack_react/manuscript/Book.txt').split('\n').filter(id);
      var ret = [];

      order = order.filter(function(name) {
        return path.extname(name) === '.md';
      });

      order.forEach(function(name, i) {
        var result = _.findWhere(files, {
          name: name,
        });

        if(!result) {
          return console.error('Failed to find', name, files);
        }

        ret.push(result);
      });

      ret.reverse();

      return ret;
    },
    inject: function(files) {
      var sourcePrefix = 'https://github.com/survivejs/webpack_react/tree/master/project_source/';
      var reqResource = require.context('json!../webpack_react_resources/', true, /^\.\/.*\.json$/);

      return files.map(function(o, i) {
        var file = o.file;
        var header = headers[files.length - i - 1];
        var resourceName = './' + o.name.split('.')[0] + '.json';
        var resources = reqResource(resourceName);

        if(header.source && header.author && header.license) {
          file.headerExtra = '<a href="' + header.source + '">' +
            header.author + ' ('+ header.license + ')</a>';
        }
        else if(header.license) {
          file.headerExtra = header.license;
        }

        file.headerImage = '/assets/img/chapters/' + header.image;
        file.previousInfo = 'Previous chapter';
        file.nextInfo = 'Next chapter';
        file.bonus = header.bonus;
        file.resources = resources;
        file.type = header.type;

        if(header.endSource) {
          file.showDemo = false;
          file.endSource = sourcePrefix + header.endSource;
        }
        else if(header.demo) {
          var sourceSuffix = header.sourceRoot || '/kanban_app';

          file.demo = '/demos/' + header.demo;

          file.showDemo = !header.sourceRoot;
          file.endSource = sourcePrefix + header.demo + sourceSuffix;
        }

        return o;
      });
    },
    layouts: {
      index: function() {
        return require('./layouts/ChapterIndex.jsx').default;
      },
      page: function() {
        return require('./layouts/ChapterPage.jsx').default;
      }
    }
  };
}

function webpack(headers) {
  return {
    title: 'Table of Contents',
    path: function() {
      return require.context('json!yaml-frontmatter!../webpack/manuscript', true, /^\.\/.*\.md$/);
    },
    processPage: {
      title: function(o) {
        var ret = removeMd(o.file.__content.split('\n')[0]);

        // part
        if(ret.indexOf('-#') === 0) {
          ret = ret.slice(2).trim();
        }

        if(o.file.bonus) {
          ret += '*';
        }

        return ret;
      },
      content: function(o) {
        var content = o.file.__content.split('\n').slice(1).join('\n');

        return markdown('webpack').process(content, highlight);
      },
      preview: function(o) {
        var previewLimit = 300;
        var content = o.file.__content.split('##')[0].split('\n').slice(1).join('\n');
        var stripped = removeMd(content);

        if(stripped.length > previewLimit) {
          return stripped.substr(0, previewLimit) + '…';
        }

        return stripped;
      },
      url: function(o) {
        var fileName = o.fileName.split('.')[0].toLowerCase().replace(/_/g, '-');

        // normal chapter
        if(parseInt(fileName.split('-')[0], 10) >= 0) {
          return o.sectionName + '/' + fileName.split('-').slice(1).join('-');
        }

        // part
        return o.sectionName + '/' + fileName;
      },
    },
    sort: function(files) {
      var order = require('raw!../webpack/manuscript/Book.txt').split('\n').filter(id);
      var ret = [];

      order = order.filter(function(name) {
        return path.extname(name) === '.md';
      });

      order.forEach(function(name, i) {
        var result = _.findWhere(files, {
          name: name,
        });

        if(!result) {
          return console.error('Failed to find', name);
        }

        ret.push(result);
      });

      ret.reverse();

      return ret;
    },
    inject: function(files) {
      return files.map(function(o, i) {
        var file = o.file;
        var header = headers[files.length - i - 1] || {};

        if(header.source && header.author && header.license) {
          file.headerExtra = '<a href="' + header.source + '">' +
            header.author + ' ('+ header.license + ')</a>';
        }
        else if(header.license) {
          file.headerExtra = header.license;
        }

        file.headerImage = '/assets/img/chapters/' + header.image;
        file.previousInfo = 'Previous chapter';
        file.nextInfo = 'Next chapter';
        file.type = header.type;

        return o;
      });
    },
    layouts: {
      index: function() {
        return require('./layouts/ChapterIndex.jsx').default;
      },
      page: function() {
        return require('./layouts/ChapterPage.jsx').default;
      }
    },
    redirects: {
      'developing-with-webpack/setting-up-npm-install-webpack-plugin': 'introduction',
      'developing-with-webpack/optimizing-development': 'advanced-techniques/configuring-react'
    }
  };
}

function id(a) {return a;}
