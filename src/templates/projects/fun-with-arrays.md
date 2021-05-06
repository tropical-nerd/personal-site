---
title: Fun with Arrays
slug: fun-with-arrays
layout: layouts/post.njk
order: 4
linkHref: https://svelte.dev/repl/805300f5895f4ea89b73ba75de393db8?version=3.16.0
linkText: svelte.dev/repl/805300f58...
cover:
    slug: fun-with-arrays_cover
    alt: Fun with Arrays
tags: [ Svelte.js, Public Speaking ]
scripts:
    - /js/selectvid.js
    - /js/looper.js
---
{% looper 'fun-with-arrays' %}

Fun with Arrays is an array visualizer I spun up on stage at #FrontEndParty, a monthly meetup in New Orleans. The talk I gave was an introduction to [Svelte.js](https://svelte.dev). If you are not familiar, it is a component framework similar to Vue, React, or Angular, with the notable difference that it compiles at build time into vanilla JavaScript for smaller bundles and faster execution time.

I made this as a project I could live-code in 7 minutes to demonstrate how easy it is to bind data structures to elements in Svelte (the styles were written ahead of time).  With minimal effort I was able to add transitions and FLIP animations to help illustrate the behavior of some popular JavaScript array methods.

The app runs extremely fast and ends up weighing less than 37kB which is around half the size it would be in Vue, a quarter of what it would be in React, and one twelfth of the size it would be in Angular.

See the code on the [Svelte REPL](https://svelte.dev/repl/805300f5895f4ea89b73ba75de393db8?version=3.16.0).
