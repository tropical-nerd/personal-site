const path = require("path");
const { DateTime } = require("luxon");
const fs = require("fs");
// const pluginNavigation = require("@11ty/eleventy-navigation");
const markdownIt = require("markdown-it");
// const markdownItAnchor = require("markdown-it-anchor");
const Image = require("@11ty/eleventy-img");

const looperSizes = [384, 480, 768, 960];

// Eleventy-Img
async function imageShortcode(shortcodeAttributes) {
  let metadata = await Image(shortcodeAttributes.src, {
      widths: shortcodeAttributes.widths || [375, 480, 640, 800], //, 1024, 1280, 1440, 1600, 1980
      formats: ["avif", "webp", "jpeg"],
      outputDir: "./dist/images/",
      svgShortCircuit: true,
      urlPath: "/images/",
      filenameFormat: function (id, src, width, format, options) {
          const ext = path.extname(src);
          const name = path.basename(src, ext);

          return `${name}_${width}w.${format}`;
      }
  });

  // Establish attributes with defaults
  let imageAttributes = {
      sizes: shortcodeAttributes.sizes || "100vw",
      loading: shortcodeAttributes.loading || "lazy",
      decoding: shortcodeAttributes.decoding || "async",
  };

  // Add any other attributes from the shortcode to the img tag
  let {src, sizes, loading, decoding, __keywords, ...remainingShortcodeAttributes} = shortcodeAttributes;
  imageAttributes = {...imageAttributes, ...remainingShortcodeAttributes}

  return Image.generateHTML(metadata, imageAttributes);
}


async function imgScrollShortcode(shortcodeAttributes) {
  return `<div class="img-scroll imhance">
    <figure>
      <div class="img-scroll-window-wrap">
        <div class="img-scroll-window" tabindex="0">
          ${await imageShortcode(shortcodeAttributes)}
        </div>
      </div>
      <div class="img-scroll-caption">← Scroll →</div>
    </figure>
  </div>`
};


function cardImageShortcode(src) {
  const ext = path.extname(src);
  const name = path.basename(src, ext);

  return `/images/${name}_1600w.jpeg`;
}


module.exports = function(eleventyConfig) {
  // eleventyConfig.addPlugin(pluginNavigation);

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

  eleventyConfig.addNunjucksAsyncShortcode("image", imageShortcode);

  eleventyConfig.addNunjucksAsyncShortcode("imgScroll", imgScrollShortcode);

  eleventyConfig.addShortcode("cardImage", cardImageShortcode);

  eleventyConfig.addShortcode("icon", (iconSlug) => {
    return `<svg class="icon" role="presentation" focusable="false" width="16" height="16" fill="currentColor">
      <use xlink:href="#icon-${iconSlug}" />
    </svg>`
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

  
  /* Markdown Overrides */
  let markdownLibrary = markdownIt({
    html: true,
    breaks: true
    // linkify: true
  })
  eleventyConfig.setLibrary("md", markdownLibrary);

  // Browsersync Overrides
  eleventyConfig.setBrowserSyncConfig({
    files: "./dist/*.css",
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

    markdownTemplateEngine: "njk",
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
