const { DateTime } = require("luxon");
const fs = require("fs");
const sizeOf = require('image-size');
const pluginNavigation = require("@11ty/eleventy-navigation");
const markdownIt = require("markdown-it");
const markdownItAnchor = require("markdown-it-anchor");

const imageSizes = [360, 480, 640, 800, 1024, 1280, 1600];
const looperSizes = [384, 480, 768, 960];

module.exports = function(eleventyConfig) {
  eleventyConfig.addPlugin(pluginNavigation);

  eleventyConfig.setDataDeepMerge(true);

  eleventyConfig.addFilter("getPostIndexFromSlug", (postlist, slug) => {
    return postlist.findIndex(post => post.data.slug === slug);
  });

  eleventyConfig.addFilter("console", function(anything) {
    console.log(anything);
  });
  
  // Get a post from order
  eleventyConfig.addFilter("isDefined", (variable) => {
    return typeof variable !== 'undefined';
  });

  // Sort posts by data.order
  eleventyConfig.addFilter("sortByOrder", (postlist, isDSC) => { 
    const sortDSC = isDSC ? -1 : 1;
    
    if (Array.isArray(postlist)) {
      postlist.sort((a, b) => {
        return sortDSC * (a.data.order - b.data.order);
      });

      return postlist;
    } else {
      return undefined;
    }
  });

  eleventyConfig.addFilter("notFilter", (array, key) => {
    return array.filter(item => item.key !== key);
  });

  eleventyConfig.addFilter("isActive", (navSlug, pageSlug, tag) => {
    
    if (navSlug === pageSlug || navSlug === tag) {
      return true;
    } else {
            return false;
    }
  });

  eleventyConfig.addShortcode("icon", (iconSlug) => {
    return `<svg class="icon" role="presentation" focusable="false" width="16" height="16" fill="currentColor">
      <use xlink:href="#icon-${iconSlug}" />
    </svg>`
  });

  // Image generator
  function picture(slug, alt, classes, title) {
    const srcsetsWebp = new Array(imageSizes.length);
    const srcsetsJpg = new Array(imageSizes.length);
    const src = `/images/${slug}_${imageSizes[1]}.jpg`;

    imageSizes.forEach((size, index) => {
      const webp = `/images/${slug}_${size}.webp`;
      const jpg = `/images/${slug}_${size}.jpg`;

      if (fs.existsSync('dist/' + webp)) {srcsetsWebp[index] = `${webp} ${size}w`};
      if (fs.existsSync('dist/' + jpg)) {srcsetsJpg[index] = `${jpg} ${size}w`};
    });
    const dimensions = sizeOf('dist' + src);
    
    const classAttr = classes ? `class="${classes}"` : '';
    const titleAttr = title ? `title="${title}"` : '';
        
    const output =
      `<picture>
          <source srcset="${srcsetsWebp}" type="image/webp">
          <source srcset="${srcsetsJpg}" type="image/jpeg">
          <img ${classAttr} src="${src}" srcset="${srcsetsJpg.join(', ')}" ${titleAttr} alt="${alt}" width="${dimensions.width}" height="${dimensions.height}">
      </picture>`

    return output;
  }

  // Image shortcode
  eleventyConfig.addShortcode("image", function(slug, alt, classes, title) {
    return picture(slug, alt, classes, title)
  });

  eleventyConfig.addShortcode("postFigure", function(slug, alt, classes, title) {
    classes = classes ? 'post-figure imhance ' + classes : 'post-figure imhance';
    return `<div class="${classes}">
        <figure>
          ${picture(slug, alt, null, title)}
        </figure>
      </div>`
  });

  eleventyConfig.addShortcode("imgScroll", function(slug, alt, classes, title) {
    classes = classes ? 'img-scroll imhance ' + classes : 'img-scroll imhance';
    return `<div class="${classes}">
      <figure>
        <div class="img-scroll-window-wrap">
          <div class="img-scroll-window" tabindex="0">
            ${picture(slug, alt, null, title)}
          </div>
        </div>
        <div class="img-scroll-caption">← Scroll →</div>
      </figure>
    </div>`
  });

  eleventyConfig.addShortcode("looper", function(slug, caption) {
    const sources = new Array;
    var figcaption;

    looperSizes.forEach(function(size, index) {
      sources[index] = `<source src="/videos/${slug}_${size}.mp4" type="video/mp4" data-width="${size}">`;
    });

    if (caption) {
      figcaption = `\n<figcaption class="looper-caption">${caption}</figcaption>`;
    } else {
      figcaption = '';
    }

    return `<figure class="looper">
      <div class="looper-video">
        <video src="/videos/${slug}_${looperSizes[3]}.mp4" width="960" height="640" loop autoplay playsinline muted controls>
          ${sources.join('\n')}
          Sorry, your browser doesn't support embedded videos.
        </video>
        <button class="looper-toggle" title="Pause" tabindex="-1" style="display: none;">
            <svg width="25" height="20" role="img" aria-labelledby="pause-title" focusable="false">
                <title id="pause-title">Pause</title>
                <use xlink:href="#icon-pause"></use>
            </svg>
        </button>
      </div>${figcaption}
    </figure>`
  });

  eleventyConfig.addPairedLiquidShortcode('textBlock', function(content) {
    return `<div class="post-text-block">${content}</div>`;
  });

  
  /* Markdown Overrides */
  let markdownLibrary = markdownIt({
    html: true,
    breaks: true,
    linkify: true
  })
  eleventyConfig.setLibrary("md", markdownLibrary);

  // Browsersync Overrides
  eleventyConfig.setBrowserSyncConfig({
    callbacks: {
      ready: function(err, browserSync) {
        const content_404 = fs.readFileSync('dist/404.html');

        browserSync.addMiddleware("*", (req, res) => {
          // Provides the 404 content without redirect.
          res.write(content_404);
          res.end();
        });
      }
    }
  });

  return {
    templateFormats: [
      "md",
      "njk",
      "html",
      "liquid"
    ],

    markdownTemplateEngine: "liquid",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk",

    // These are all optional, defaults are shown:
    dir: {
      input: "src/templates",
      includes: "_includes",
      data: "_data",
      output: "dist"
    }
  };
};
