---
title: Fun with Arrays
slug: fun-with-arrays
layout: layouts/post.njk
order: 4
linkHref: https://svelte.dev/repl/805300f5895f4ea89b73ba75de393db8?version=3.16.0
linkText: Svelte REPL
cover:
    src: ./src/images/fun-with-arrays_cover.png
    alt: Fun with Arrays
description: A array visualizer live coded at <a href="http://frontendparty.com">#FrontEndParty</a>. Written with Svelte.
tags: [ Svelte.js, Public Speaking ]
scripts:
    - bundle.js
stylesheets:
    - bundle.css
---
<section id="svelte-app" class="app app-fun-with-arrays"></section>

**Fun with Arrays** visualizes an array as series of squares and provides buttons to execute some of JavaScript's array methods. I live coded it on stage at #FrontEndParty, a monthly meetup in New Orleans. The talk was an introduction to [Svelte.js](https://svelte.dev), if you are not familiar, it is a component framework similar to Vue, React, or Angular, with the notable difference that it compiles at build time into vanilla JavaScript for smaller bundles and faster execution time.

In 7 minutes I was able to demonstrate binding data structures to elements and attach Svelte's built in FLIP animations to illustrate the ways in which these functions mutate arrays.

The app runs extremely fast and ends up weighing less than 10kB, a small fraction of the bundle size that would be required by React, Vue or Angular. The size difference is most notable in small apps, making Svelte an excellent choice for interactive elements embedded in the page, which makes sense as it was initially created by the NY Times for the types of interactive data visualizations that often accompany their news articles. It has some performance gains over React as well. Svelte maintains a dependency graph that only updates the specific parts of the page that have changed. React uses a diffing approach that must compare the entire DOM to the shadow DOM on each update.

If you would like to see the code or play with it in real time check out the [Svelte REPL](https://svelte.dev/repl/805300f5895f4ea89b73ba75de393db8?version=3.16.0).
