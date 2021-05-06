---
title: Sediment Press
slug: sediment-press
layout: layouts/post.njk
linkHref: https://sedimentpress.com
linkText: sedimentpress.com
order: 1
cover:
    slug: sediment-press_cover
    alt: sedimentpress.com homepage
tags: [WordPress, WooCommerce, Modified Theme, Logo Design]
scripts: [/js/imhance.js]
---
{% imgScroll 'sediment-press_home', 'Full scrollable homepage of sedimentpress.com' %}

Sediment Press is a design and screen printing company I founded in 2012. Primarily an online store and design portfolio, I wanted to make a site with a loose, hand-drawn aesthetic that was functionally polished, with a seamless checkout and integrated payment gateway.

For the e-commerce section WooCommerce had the power and extensibility we needed. The plugin system allowed us to add payments to the site and calculate shipping based on the weight and dimensions of our products. I started with the Storefront theme by WooCommerce because it worked out of the box and I knew it would be well supported. I built a child theme using hooks, actions, and filters to remove unnecessary components from the user interface and reshape it to fit our inventory. Stripe made it easy to add secure credit card payments into our site for streamlined checkout experience.

For the portfolio I incorporated the [Justified Gallery](http://miromannino.github.io/Justified-Gallery/) into the theme and used [PhotoSwipe](https://photoswipe.com/) as a touch-enabled light box. I knew it was important to keep the backend easy to use or I would not update it, so I added a custom post type for the portfolio entries and custom taxonomies that enabled category filtering.
