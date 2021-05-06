// Get elements
const html = document.querySelector('html');
const wraps = document.querySelectorAll('.imhance');
const closeButton =
  `<button class="button imhance-close" >
    <svg role="img"
        aria-labelledby="close-title"
        focusable="false"
        width="32"
        height="32" stroke="currentColor">
        <title id="close-title">Close Image</title>
        <use xlink:href="#icon-close" />
    </svg>
  </button>`;

const documentStyles = getComputedStyle(document.documentElement);
const borderWidth = documentStyles.getPropertyValue('--border-width').trim();
const borderColor = documentStyles.getPropertyValue('--color-text').trim();
const borderRadius = documentStyles.getPropertyValue('--border-radius').trim();
const boxShadowOffsetX = documentStyles.getPropertyValue('--box-shadow-offset-x').trim();
const boxShadowOffsetY = documentStyles.getPropertyValue('--box-shadow-offset-y').trim();
const boxShadowColor = documentStyles.getPropertyValue('--color-shadow').trim();
const outlineOffset = documentStyles.getPropertyValue('--outline-offset').trim();
const outlineRadius = documentStyles.getPropertyValue('--outline-radius').trim();

// Convert duration custom property to milliseconds ('0.1s' => 100)
const durationCSS = getComputedStyle(document.documentElement).getPropertyValue('--duration');
const durationJS = 1000 * Number(durationCSS.slice(0, -1));

function mediaKeys(imhance) {
    const isOpen = imhance.wrap.classList.contains('grow');

    if (event.key === 'Enter') {
        toggleGrow(imhance);
    }

    if (isOpen && event.key === 'Escape') {
        shrink(imhance);
    }

    if (isOpen && event.key === 'Tab') {
        event.preventDefault();
        imhance.close.focus();
    }
}

function closeKeys(imhance) {
    if (['Enter', 'Escape'].includes(event.key)) {
        event.preventDefault();
        shrink(imhance);
    }

    if (event.key === 'Tab') {
        event.preventDefault();
        imhance[imhance.eventTarget].focus();
    }
}

// Takes in object with four nodes: wrap, media, close, and clickPlate
function grow(imhance) {
    const windowWidth = html.getBoundingClientRect().width;
    const windowHeight = window.innerHeight;
    const isScroll = imhance.wrap.classList.contains('img-scroll');
    const mediaOffset = imhance.media.getBoundingClientRect();
    const mediaTop = mediaOffset.top;
    const mediaLeft = mediaOffset.left;
    const mediaWidth = mediaOffset.width;
    const mediaHeight = mediaOffset.height;
    const scrollTop = isScroll ? imhance.scrollWindow.scrollTop : undefined;
    const closeHeight = imhance.close.getBoundingClientRect().height;
    const windowAspect = windowHeight / windowWidth;  
    const mediaAspect = mediaHeight / mediaWidth;

    // Choose to base window margins on smallest screen dimension
    let windowMargin, closeMargin;
    if (windowAspect <= 1) {
        windowMargin = .15 * windowHeight;
        closeMargin = 16 + .04 * windowHeight;
    } else {
        windowMargin = .15 * windowWidth;
        closeMargin = 16 + .04 * windowWidth; 
    }

    // Determine maximum size for image
    const maxGrowWidth = windowWidth - (windowMargin * 2);
    const maxGrowHeight = windowHeight - windowMargin - closeHeight - (closeMargin * 2);
    const maxGrowAspect = maxGrowHeight / maxGrowWidth;
    let growWidth, growHeight;

    // Chooses whether to use window width or height as the constraining dimension
    if (mediaAspect < maxGrowAspect) {
        growWidth = maxGrowWidth;
        growHeight = growWidth * mediaAspect;
    } else {
        growHeight = maxGrowHeight;
        growWidth = growHeight / mediaAspect;
    }
  
    // Calculate properties of enlarged media element
    const growShiftY = -mediaTop + (windowHeight - mediaHeight - closeHeight - (closeMargin * 2)) / 2 ;
    const growShiftX = -mediaLeft + (windowWidth - mediaWidth) / 2;
    const growScale = growHeight / mediaHeight;
    const growTop = (windowHeight - growHeight - closeHeight - (closeMargin * 2)) / 2;
    const growLeft = (windowWidth - growWidth) / 2;
    const growBorder = `calc(${borderWidth} * ${Math.max(growScale, 2)}) solid ${borderColor}`;
    const growBorderRadius = `calc(${borderRadius} * ${growScale})`;
    const growShadow = `calc(${boxShadowOffsetX} * ${growScale}) calc(${boxShadowOffsetY} * ${growScale}) 0 ${boxShadowColor}`;
    const growOutlineOffset = `calc(${outlineOffset} * ${growScale})`;
    const growOutlineRadius = `calc(${outlineRadius} * ${growScale})`;
    const growScrollTop = scrollTop * growScale;
    const closeTop = (windowHeight + growHeight - closeHeight - closeMargin) / 2;

    // Keep wrap from collapsing when contents is removed
    imhance.figure.setAttribute('style', `width: ${mediaWidth}px; height: ${mediaHeight}px`);
    imhance.wrap.classList.add('grow');

    // Define styles to tranform image to grow size
    let transformStyle = `position: fixed; transition: transform ${durationCSS} ease; top: ${mediaTop}px; left: ${mediaLeft}px; width: ${mediaWidth}px; transform: translate(${growShiftX}px, ${growShiftY}px) scale(${growScale}); z-index: 2;`;

    // Define styles for full size image
    let grownStyle = `position: fixed; top: ${growTop}px; left: ${growLeft}px; transform: unset; width: ${growWidth}px; height: ${growHeight}px; border: ${growBorder}; border-radius: ${growBorderRadius}; box-shadow: ${growShadow}; --outline-offset: ${growOutlineOffset}; -moz-outline-radius: ${growOutlineRadius}; z-index: 2;`;

    // Start transform
    imhance.media.setAttribute('style', transformStyle);
    imhance.close.setAttribute('style', 'display: block');
    imhance.clickPlate.setAttribute('style', 'display: block');

    // Repace transformed version with full size image
    setTimeout(function () {
        imhance.media.setAttribute('style', grownStyle);
        imhance[imhance.eventTarget].focus();
        if (isScroll) { imhance.scrollWindow.scrollTop = growScrollTop; }
    }, durationJS);

    // Slight delay for fade in for elements that were previously display: none
    setTimeout(function() {
        imhance.close.setAttribute('style', `display: block; top: ${closeTop}px; opacity: 1;`);
        imhance.clickPlate.style.opacity = '.375';
    }, 20);
}

function shrink(imhance) {
    const isScroll = imhance.wrap.classList.contains('img-scroll');
    const mediaOffset = imhance.media.getBoundingClientRect();
    const mediaTop = mediaOffset.top;
    const mediaLeft = mediaOffset.left;
    const mediaWidth = mediaOffset.width;
    const mediaHeight = mediaOffset.height;
    const scrollTop = isScroll ? imhance.scrollWindow.scrollTop : undefined;
    const figureOffset = imhance.figure.getBoundingClientRect();
    const figureTop = figureOffset.top;
    const figureLeft = figureOffset.left;
    const figureWidth = figureOffset.width;
    const figureHeight = figureOffset.height;
    const growScale = mediaWidth / figureWidth;
    const shrinkScale = figureWidth / mediaWidth;
    const shrinkShiftX = -mediaLeft + figureLeft + (figureWidth - mediaWidth) / 2;
    const shrinkShiftY = -mediaTop + figureTop + (figureHeight - mediaHeight) / 2;
    const shrinkBorder = `calc(${borderWidth} * ${growScale}) solid ${borderColor}`;
    const shrinkBorderRadius = `calc(${borderRadius} * ${growScale})`;
    const shrinkShadow = `calc(${boxShadowOffsetX} * ${growScale}) calc(${boxShadowOffsetY} * ${growScale}) 0 ${boxShadowColor}`;
    const shrinkScrollTop = isScroll ? scrollTop * shrinkScale : undefined;

    let shrinkStyle = `position: fixed; top: ${mediaTop}px; left: ${mediaLeft}px; width: ${mediaWidth}px; border: ${shrinkBorder}; border-radius: ${shrinkBorderRadius}; box-shadow: ${shrinkShadow}; transform: translate(${shrinkShiftX}px, ${shrinkShiftY}px) scale(${shrinkScale}); transition: transform ${durationCSS} ease; z-index: 2;`;

    imhance.media.setAttribute('style', shrinkStyle);
    imhance.close.style.opacity = 0;
    imhance.clickPlate.style.opacity = 0;

    setTimeout(() => {
        imhance.media.setAttribute('style', 'position: relative; transition: unset');
        imhance[imhance.eventTarget].focus();
        if (isScroll) { imhance.scrollWindow.scrollTop = shrinkScrollTop; }
        imhance.close.removeAttribute('style');
        imhance.wrap.classList.remove('grow');
        imhance.figure.removeAttribute('style');
        imhance.clickPlate.setAttribute('style', 'display: none;');
    }, durationJS);
}

function toggleGrow(imhance) {
    if (imhance.wrap.classList.contains('grow')) {
        shrink(imhance);
    } else {
        grow(imhance);
    }
}

// Start the thing
wraps.forEach(function(wrap) {
    const imhance = new Object;
    imhance.wrap = wrap;
    imhance.figure = wrap.querySelector('figure');
    imhance.scrollWindow = wrap.querySelector('.img-scroll-window');
    imhance.media = wrap.querySelector('.img-scroll-window-wrap, img');
    imhance.media.classList.add('imhance-media');
    const template = document.createElement('template');
    imhance.eventTarget = !imhance.scrollWindow ? 'media' : 'scrollWindow';

    // Create caption
    template.innerHTML = '<div class="imhance-caption">click image to enlarge</div>';
    imhance.wrap.append(template.content.firstChild);

    // Create close button
    template.innerHTML = closeButton;
    imhance.wrap.append(template.content.firstChild);
    imhance.close = imhance.wrap.querySelector('.imhance-close');

    // Create click plate
    template.innerHTML = '<div class="imhance-click-plate" style="display: none"></div>';
    imhance.wrap.prepend(template.content.firstChild);
    imhance.clickPlate = imhance.wrap.querySelector('.imhance-click-plate');

    // Add event listeners
    imhance[imhance.eventTarget].addEventListener('click', () => toggleGrow(imhance));
    imhance[imhance.eventTarget].addEventListener('keydown', () => mediaKeys(imhance));
    imhance[imhance.eventTarget].setAttribute('tabindex', '0');      
    imhance.close.addEventListener('click', () => shrink(imhance));
    imhance.close.addEventListener('keydown', () => closeKeys(imhance));
    imhance.clickPlate.addEventListener('click', () => shrink(imhance));
});

