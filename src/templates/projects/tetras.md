---
title: Tetras
slug: tetras
linkHref: https://cocohost.co/tetras
linkText: cocohost.co/tetras
layout: layouts/post.njk
order: 3
tags: [Snap.svg, SVG Animation]
cover:
    slug: tetras_cover
    alt: Tetras
    cardAlt: An SVG animation of a geometric landscape with blue fields of color radiating from it
description: The geometry behind Tetras, a generative tetrahedral landscape proliferated with chromatic radiation.
scripts:
    - /js/selectvid.js
    - /js/looper.js
---
{% looper 'tetras', 'A generative tetrahedral landscape proliferated with chromatic radiation.' %}

This is a recreation of a design I made while taking Color and Design at the New Orleans Academy of Fine Arts. The original I drew with a ruler and compass and illustrated with gouache. To create the scene in SVG I followed more or less the same steps as I did sketching it by hand, just with a lot more attention paid to numerical coordinates.

<figure class="diagram">
    {% include ../../svg/tetras_tile-plane.svg %}
</figure>

The first step was to create a map of rhombus-shaped tiles to serve as a coordinate system for placing the tetrahedral mountains (I'll be referring to them as "tetras" for short). The number of columns and rows are calculated so that the map is always slightly larger than the viewport.

<figure class="diagram">
    {% include ../../svg/tetras_tetra.svg %}
</figure>

The tetras themselves are generated as two polygons that share a side. They increase in height towards the top of the viewport and decrease in contrast to create a sense of depth through atmospheric perspective.

<figure class="diagram">
    {% include ../../svg/tetras_ellipse.svg %}
</figure>

In the original compass-drawn design, the ellipses were approximated using a construction of circular arcs. After trying and failing to recreate this by adding and intersecting circles, I referred to the SVG documentation. It turns out SVG has a path syntax specifically for describing curves as a series of elliptical arcs, which was the perfect tool for the job.

<figure class="diagram">
    {% include ../../svg/tetras_radiation.svg %}
</figure>

These pseudo-ellipses then become bands in a radiation field. The epicenter is chosen from a random intersection at the corner of four tetras. One band radiates out every two seconds. It expands until it reaches a maximum size and then it returns to the bottom of the stack to radiate all over again.

## Lessons Learned
Snap.svg is an amazing library for creating generative and interactive vector graphics for the web. It greatly simplified the process of creating this design and I feel like I barely scratched the surface of what it can do.

Snap.svg animates using JavaScript, which is great and fine for many use cases, really any situation that doesn't demand GPU acceleration. In this case, because the ellipses grow so large, on larger screens I see some performance issues, and it makes the fan on my laptop kick into high gear in Firefox. If one was inclined they could rebuild this in a way that uses CSS or canvas animation which both natively take advantage of hardware acceleration.
