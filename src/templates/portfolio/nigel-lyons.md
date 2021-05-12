---
title: Nigel Lyons
slug: nigel-lyons
layout: layouts/post.njk
linkHref: https://nigelyons.com
linkText: nigelyons.com
order: 6
cover:
    slug: nigel-lyons_cover
    alt: nigelyons.com homepage
tags: [Static Site, Node.js, Logo Design]
images:
    -   slug: nigel-lyons_home
        alt: Home page of nigelyons.com
        classes: post-image
scripts: [/js/imhance.js]
---
{% imgScroll 'nigel-lyons_home', 'Home page of nigelyons.com' %}

Nigel Lyons is an independent video producer in Washington, DC. In 2015, with Sediment Press, I designed his logo, business card and a portfolio site using WordPress. In 2019 we redesigned the site as a static single page that would highlight some of his best work. The main design considerations we had were: 

 - Effectively showcasing his video portfolio.
 - Building off of his current branding.
 - Looking natively designed for any device that used it.

As a single page site, a CMS would have added a lot of overhead. I could have written the site directly in HTML and CSS, completely forgoing a build step, but I chose to generate the site in Node to gain the benefit of some modern development tools. I used Pug for the templates, Stylus as a CSS preprocessor, Gulp as an asset bundler, and browserSync for live reloading. This stack allowed me to automate repetitive tasks without giving up granular control over the finished product.

The main challenges I faced in creating a truly responsive site were the header design, whitespace management, and arrangement of content blocks. For the header I used to CSS grid to create a vertical version for narrow screens and a horizontal version for when space would allow. To keep whitespace proportional I made margin system using CSS custom properties that coordinated changing all the margins on the page by adjusting a few variables. CSS grid proved useful again in intrinsically laying out the video cards in flexible grid, and for rearranging the site layout on larger screen sizes.
