var dpr = window.devicePixelRatio || 1;
var illo = document.querySelector('.hero-home canvas');
var camera = {}, grid = {}, face = {}, layer = [], ctx = {};
illo.offscreen = [];
var taglineCurrent = document.querySelector('.tagline');

// Tagline data
const taglines = [
   '<span class="tagline-top" >Websites</span> <span class="tagline-bottom" >built for the future of tomorrow</span>',
   '<span class="tagline-top" >The Websites</span> <span class="tagline-bottom" >of tomorrow...<br><span style="display: block; text-align: right; justify-self: flex-end;">...today</span></span>',
   '<span class="tagline-top" >The future</span> <span class="tagline-bottom" >of websites is now</span>',
   '<span class="tagline-top" >Websites</span> <span class="tagline-bottom" >that span the global information platform</span>',
   '<span class="tagline-top" >Websites</span> <span class="tagline-bottom" >the future of digital communication</span>'
]

function setupCanvas(canvas, percentOfWidth = 1, percentOfHeight = 1, useAlpha = true) {
  // Get the device pixel ratio, falling back to 1.
  dpr = window.devicePixelRatio || 1;
  
  // Get the size of the illustration in CSS pixels.
  var canvasBounds = illo.getBoundingClientRect();

  // Give the canvas pixel dimensions of their CSS
  // size * the device pixel ratio.
  canvas.width = canvasBounds.width * dpr * percentOfWidth;
  canvas.height = canvasBounds.height * dpr * percentOfHeight;
  var context = canvas.getContext( '2d', { alpha: useAlpha });
  
  // Scale all drawing operations by the device pixel ratio, so you
  // don't have to worry about the difference.
  context.scale(dpr, dpr);

  return context;
}  

function prepScene() {
   ctx = setupCanvas(illo, 1, 1, false);
   // var taglineTop = taglineCurrent.children[0];
   // var taglineBottom = taglineCurrent.children[1];
   
   camera = {
      x: illo.width / 2,
      y: illo.height / 2,
      z: 900 * dpr
   }

   grid = {
      maxColumns: 21,
      columnWidth: 200,
      maxRows: 50,
   }
   grid.rowHeight = grid.columnWidth;
   grid.maxWidth = grid.maxColumns * grid.columnWidth;

   illo.parentElement.style.setProperty('--hero-width', (illo.width / dpr) + 'px');
   // illo.style=""
   // taglineCurrent.children[0].style.fontSize = (.095 * illo.width).toFixed(2) + 'px';
   // taglineCurrent.children[1].style.fontSize = (.0625 * illo.width).toFixed(2) + 'px';
}

function prepFace() {
   face = { 
      x: .05 * illo.height,
      y: .04 * illo.height,
      z: -.05 * illo.height,
      width: 675,
      height: 858,
      layerThickness: .016 * illo.height
   }
   face.scale = .85 * illo.height / face.height;

   layer.height = face.height * face.scale;
   layer.heightAbove = camera.y - face.y;
   layer.widthLeft = camera.x - face.x;
   layer.heightBelow = face.y + layer.height - camera.y;

   //  Prerender Layers
   ctx.offscreen = [];

   for (let n = 0; n < drawLayer.length; n++) {
      ctx.offscreen[n] = setupCanvas(illo.offscreen[n], .4, 1, true);
      layer[n] = {depth: camera.z - ((n * face.layerThickness) + face.z)}
      let projection = {};
      projection.heightAbove = (camera.z * layer.heightAbove) / layer[n].depth;
      projection.heightBelow = (camera.z * layer.heightBelow) / layer[n].depth;
      projection.height = projection.heightAbove + projection.heightBelow;
      projection.scale = projection.height / layer.height;
      projection.scaleProduct = face.scale * projection.scale;
      
      projection.x = Math.round(face.x - ((camera.z - layer[n].depth) * (layer.widthLeft)) / layer[n].depth);
      projection.y = Math.round(face.y + camera.y - projection.heightAbove);

      ctx.offscreen[n].fillStyle = "#222";
      ctx.offscreen[n].strokeStyle ="#36FFB4";
      ctx.offscreen[n].setTransform(projection.scaleProduct, 0, 0, projection.scaleProduct, projection.x, 0);
      ctx.offscreen[n].lineWidth = 1 / projection.scaleProduct;
   
      // ctx.offscreen.clearRect(0, 0, .4 * illo.width, illo.height);
      drawLayer[n](ctx.offscreen[n]);
      // layer[n].data = ctx.offscreen.getImageData(0, 0, .4 * illo.width, illo.height);
   }
}

function drawScene() {
   ctx.strokeStyle = "#36FFB4";
   
   camera.y = illo.height / 2 + (window.scrollY * dpr);
   
   // Keeps face transforms from applying to entire canvas
   ctx.resetTransform();
   ctx.fillStyle = "#222";
   ctx.lineWidth = 1;
   
   // Clear canvas
   ctx.fillRect(0, 0, illo.width, illo.height);
   ctx.beginPath();
   
   // Draw background grid lines
   rowYTop = 0, rowYBottom = illo.height;
   for (let row = 1; row < grid.maxRows; row++) {
         rowYTopPrev = rowYTop;
         rowYTop = .5 + Math.round(camera.y - (camera.z * camera.y) / (camera.z + (row * grid.rowHeight)));
         rowYBottomPrev = rowYBottom;
         rowYBottom = .5 + Math.round(camera.y + (camera.z * (illo.height - camera.y)) / (camera.z + (row * grid.rowHeight)));
         
         if ((row > 0) && (rowYTopPrev === rowYTop) && (rowYBottomPrev === rowYBottomPrev)) {
            break;
         }

         // Draw top horizontal
         ctx.moveTo(0, rowYTop);
         ctx.lineTo(illo.width, rowYTop);

         // Draw bottom horizontal
         ctx.moveTo(0, rowYBottom);
         ctx.lineTo(illo.width, rowYBottom);
   }

   // Draw lines to vanishing point
   for (let column = 0; column < grid.maxColumns; column++) {
      let columnX = camera.x - (grid.maxWidth / 2) + (column * grid.columnWidth);
      ctx.moveTo(columnX, 0);
      ctx.lineTo(camera.x, camera.y);
      ctx.lineTo(columnX, illo.height);
   }
  
    ctx.stroke();
    
   // Fill in horizon green
   ctx.fillStyle = "#36FFB4";
   ctx.moveTo(0, 0);
   ctx.fillRect(0, rowYTopPrev, illo.width, (rowYBottomPrev - rowYTopPrev));

   // Render face
   layer.heightAbove = camera.y - face.y;
   layer.heightBelow = face.y + layer.height - camera.y;
   
   // Stack rendered layers and transform y into place based on camera position
   for (let n = 0; n < drawLayer.length; n++) {
      let projection = {};
      projection.heightAbove = (camera.z * layer.heightAbove) / layer[n].depth;
      projection.y = Math.round(face.y + camera.y - projection.heightAbove);

      ctx.drawImage(illo.offscreen[n], 0, projection.y);
      // console.log(projection.y, face.y, camera.y, projection.heightAbove);
   }

   // ctx.drawImage(illo.offscreen, 0, 0);

}

function handleScroll() {
   window.requestAnimationFrame(drawScene);
}

function handleResize() {
   if (window.scrollY < illo.height) {
      prepScene();
      prepFace();
      drawScene();
   }
}

function updateTagline() {
   let index = Math.floor(Math.random() * taglines.length);
   taglineCurrent.innerHTML = taglines[index];
}

function handleClick() {
   updateTagline();
}

 // Face path data
 var drawLayer = [];
 drawLayer[0] = function(ctx) {
   ctx.beginPath();
   ctx.moveTo(155.1,782);
   ctx.bezierCurveTo(146.96,757.44,146.45,731.65,147,706.1);
   ctx.bezierCurveTo(117.25,679.70,97.92,641.59,100.43,601.26);
   ctx.bezierCurveTo(113.00,567.37,46.58,581.62,59.30,541.48);
   ctx.bezierCurveTo(59.03,519.36,70.76,496.94,60.41,475.63);
   ctx.bezierCurveTo(42.21,448.67,70.25,420.20,82.54,419.48);
   ctx.bezierCurveTo(65.42,415.52,84.04,390.72,74.9,381.1);
   ctx.bezierCurveTo(77.67,351.61,75.24,326.21,76.5,297.1);
   ctx.bezierCurveTo(73.17,280.16,92.46,249.44,78.78,256.83);
   ctx.bezierCurveTo(86.82,235.45,65.81,271.52,64,253);
   ctx.bezierCurveTo(67.65,249.01,90.22,229.27,66,245.8);
   ctx.bezierCurveTo(80.57,236.78,113.70,206.12,75.48,220.81);
   ctx.bezierCurveTo(68.95,222.98,126.64,205.80,88.08,200.13);
   ctx.bezierCurveTo(65.70,201.11,43.65,133.01,71.9,165.8);
   ctx.bezierCurveTo(76.29,178.90,120.21,186.06,89.4,170.60);
   ctx.bezierCurveTo(75.54,164.99,51.75,149.79,79.4,158.60);
   ctx.bezierCurveTo(97.18,164.84,103.75,156.25,84.30,147.3);
   ctx.bezierCurveTo(93.91,153.67,139.04,167.86,109.4,152.8);
   ctx.bezierCurveTo(98.05,148.43,91.27,138.35,81.41,132.59);
   ctx.bezierCurveTo(71.92,127.32,57.66,124.88,60.58,121.35);
   ctx.bezierCurveTo(53.17,115.45,78.08,127.85,84,129.5);
   ctx.bezierCurveTo(80.93,123.53,55.19,112.76,68.3,114.7);
   ctx.bezierCurveTo(54.28,109.02,75.16,111.31,68.89,109.17);
   ctx.bezierCurveTo(83.88,122.68,84.38,116.69,80.42,112.08);
   ctx.bezierCurveTo(93.63,125.93,93.90,121.41,83.53,108.07);
   ctx.bezierCurveTo(73.23,96.07,83.79,101.55,82.59,95.46);
   ctx.bezierCurveTo(82.99,86.48,108.08,129.70,92.94,96.01);
   ctx.bezierCurveTo(88.53,58.95,108.98,127.97,101.9,91.7);
   ctx.bezierCurveTo(103.40,80.36,114.14,83.35,114.39,78.91);
   ctx.bezierCurveTo(111.59,65.47,121.62,69.11,119.35,70.01);
   ctx.bezierCurveTo(125.67,83.01,118.62,58.37,127.9,71.20);
   ctx.bezierCurveTo(131.55,48.37,134.18,80.59,137.21,81.68);
   ctx.bezierCurveTo(132.42,62.74,139.00,74.05,141.7,60.6);
   ctx.bezierCurveTo(145.91,78.71,157.88,78.70,148.29,61.2);
   ctx.bezierCurveTo(159.22,67.15,167.50,96.54,162.80,66.19);
   ctx.bezierCurveTo(160.67,62.51,178.76,75.52,191.97,72.81);
   ctx.bezierCurveTo(208.27,73.53,227.60,75.08,221.46,69.85);
   ctx.bezierCurveTo(250.07,75.31,225.63,67.58,231.43,67.95);
   ctx.bezierCurveTo(253.37,70.39,264.41,67.55,239.89,62.6);
   ctx.bezierCurveTo(260.76,62.01,281.63,62.77,302.5,62.6);
   ctx.bezierCurveTo(282.89,57.45,317.72,63.69,312.59,60.04);
   ctx.bezierCurveTo(324.60,60.81,344.56,63.45,322.64,56.14);
   ctx.bezierCurveTo(285.82,40.53,365.44,74.57,344.78,58.51);
   ctx.bezierCurveTo(361.81,67.38,366.74,65.24,366.26,57.76);
   ctx.bezierCurveTo(385.38,78.20,391.64,69.51,378.62,63.83);
   ctx.bezierCurveTo(402.32,74.71,388.09,61.69,384.79,60.12);
   ctx.bezierCurveTo(404.22,68.23,424.22,74.64,441,87.8);
   ctx.bezierCurveTo(422.22,66.50,431.55,75.57,447.53,87.51);
   ctx.bezierCurveTo(464.58,92.72,492.36,143.28,493.33,100.27);
   ctx.bezierCurveTo(500.98,80.64,490.97,140.21,499.79,107.6);
   ctx.bezierCurveTo(503.16,80.36,495.49,147.99,503.29,116.1);
   ctx.bezierCurveTo(494.95,135.79,522.48,159.15,516.63,122.78);
   ctx.bezierCurveTo(517.85,99.12,521.47,149.02,526.15,118.06);
   ctx.bezierCurveTo(530.68,110.61,523.61,145.85,519.39,155.6);
   ctx.bezierCurveTo(528.13,176.42,550.51,175.33,558.39,193.1);
   ctx.bezierCurveTo(579.00,214.34,600.35,234.10,610.49,263.6);
   ctx.bezierCurveTo(628.90,292.83,595.35,264.06,599.98,269.08);
   ctx.bezierCurveTo(601.06,286.84,618.00,312.56,608.76,317.01);
   ctx.bezierCurveTo(615.40,329.80,608.59,345.07,609.20,358.07);
   ctx.bezierCurveTo(613.08,364.74,599.32,353.69,606.39,371.5);
   ctx.bezierCurveTo(601.96,376.61,600.30,390.58,601.83,404.02);
   ctx.bezierCurveTo(594.17,405.56,588.81,428.90,609.16,430.57);
   ctx.bezierCurveTo(629.83,455.07,622.96,492.01,616.59,521.10);
   ctx.bezierCurveTo(621.61,555.76,590.62,602.13,553.71,577.66);
   ctx.bezierCurveTo(532.91,587.08,546.05,640.80,529.51,665.71);
   ctx.bezierCurveTo(509.31,693.98,495.42,722.07,490.68,756.35);
   ctx.bezierCurveTo(485.63,770.21,473.38,771.67,458.66,775.30);
   ctx.bezierCurveTo(433.43,781.32,408.56,790.74,383.10,794.68);
   ctx.bezierCurveTo(371.50,793.55,360.51,791.14,349.05,794.88);
   ctx.bezierCurveTo(323.96,795.64,298.34,796.09,274.31,802.68);
   ctx.bezierCurveTo(241.75,809.68,210.34,805.61,179.92,792.36);
   ctx.bezierCurveTo(173.02,786.56,158.90,790.62,155.1,782);
   ctx.closePath();
   ctx.fill();
   ctx.stroke();
 }
 
 drawLayer[1] = function(ctx) {
    ctx.beginPath();
   ctx.moveTo(155.1,782.1);
   ctx.bezierCurveTo(140.44,749.36,157.29,706.11,128.23,680.46);
   ctx.bezierCurveTo(104.88,652.44,107.69,614.35,104.6,580.3);
   ctx.bezierCurveTo(78.16,584.86,43.80,552.74,77.94,534.63);
   ctx.bezierCurveTo(89.01,525.55,108.15,538.53,98.89,515.35);
   ctx.bezierCurveTo(108.06,481.61,76.44,455.73,77.8,428.3);
   ctx.bezierCurveTo(94.73,422.48,86.87,402.41,75.45,414.33);
   ctx.bezierCurveTo(87.26,390.30,73.00,367.52,78.19,341.69);
   ctx.bezierCurveTo(77.87,316.63,74.77,289.56,83.2,265.5);
   ctx.bezierCurveTo(92.54,240.62,69.85,271.48,84.10,245.3);
   ctx.bezierCurveTo(69.26,251.56,68.85,261.74,68.30,251.60);
   ctx.bezierCurveTo(74.03,242.79,102.78,222.37,77.80,237.60);
   ctx.bezierCurveTo(52.97,252.95,115.21,205.41,88.02,216.16);
   ctx.bezierCurveTo(102.42,211.58,119.38,195.16,91.78,197.06);
   ctx.bezierCurveTo(73.27,197.95,47.89,159.50,62.6,156.1);
   ctx.bezierCurveTo(65.18,171.00,120.31,191.23,89.4,170.5);
   ctx.bezierCurveTo(75.54,164.89,51.75,149.69,79.4,158.5);
   ctx.bezierCurveTo(97.18,164.74,103.75,156.15,84.30,147.2);
   ctx.bezierCurveTo(93.91,153.57,139.04,167.76,109.4,152.7);
   ctx.bezierCurveTo(98.00,148.47,91.24,138.45,81.41,132.69);
   ctx.bezierCurveTo(71.92,127.42,57.66,124.98,60.58,121.45);
   ctx.bezierCurveTo(53.17,115.55,78.08,127.95,84,129.6);
   ctx.bezierCurveTo(80.93,123.63,55.19,112.86,68.3,114.8);
   ctx.bezierCurveTo(54.28,109.12,75.16,111.41,68.89,109.27);
   ctx.bezierCurveTo(83.88,122.78,84.38,116.79,80.42,112.18);
   ctx.bezierCurveTo(93.63,126.03,93.90,121.51,83.53,108.17);
   ctx.bezierCurveTo(73.23,96.17,83.79,101.65,82.59,95.56);
   ctx.bezierCurveTo(82.99,86.58,108.08,129.80,92.94,96.11);
   ctx.bezierCurveTo(88.53,59.05,108.98,128.07,101.9,91.8);
   ctx.bezierCurveTo(103.43,80.42,114.08,83.52,114.44,78.96);
   ctx.bezierCurveTo(111.51,65.30,121.56,69.02,119.35,70.01);
   ctx.bezierCurveTo(125.67,83.01,118.62,58.37,127.9,71.2);
   ctx.bezierCurveTo(131.55,48.37,134.18,80.59,137.21,81.68);
   ctx.bezierCurveTo(132.42,62.74,139.00,74.05,141.7,60.6);
   ctx.bezierCurveTo(145.91,78.71,157.88,78.70,148.29,61.2);
   ctx.bezierCurveTo(159.22,67.15,167.50,96.54,162.80,66.19);
   ctx.bezierCurveTo(160.67,62.51,178.76,75.52,191.97,72.81);
   ctx.bezierCurveTo(208.27,73.53,227.60,75.08,221.46,69.85);
   ctx.bezierCurveTo(250.07,75.31,225.63,67.58,231.43,67.95);
   ctx.bezierCurveTo(253.37,70.39,264.41,67.55,239.89,62.6);
   ctx.bezierCurveTo(260.76,62.01,281.63,62.77,302.5,62.6);
   ctx.bezierCurveTo(282.89,57.45,317.72,63.69,312.59,60.04);
   ctx.bezierCurveTo(324.60,60.81,344.58,63.41,322.57,56.30);
   ctx.bezierCurveTo(285.73,40.74,360.02,73.22,346.01,59.78);
   ctx.bezierCurveTo(345.94,53.95,375.57,78.73,363.3,55);
   ctx.bezierCurveTo(376.18,74.19,398.99,74.58,376.41,63.31);
   ctx.bezierCurveTo(391.22,70.25,403.56,70.69,380.8,58.80);
   ctx.bezierCurveTo(401.28,67.73,422.82,73.97,440.6,88);
   ctx.bezierCurveTo(422.15,66.48,431.75,75.79,447.53,87.61);
   ctx.bezierCurveTo(467.25,90.65,491.66,142.92,493.33,100.37);
   ctx.bezierCurveTo(500.98,80.74,490.97,140.31,499.79,107.7);
   ctx.bezierCurveTo(503.17,80.45,495.49,148.10,503.29,116.2);
   ctx.bezierCurveTo(494.66,138.18,527.25,159.83,521.12,123.3);
   ctx.bezierCurveTo(520.63,99.35,526.20,148.24,527.43,116.53);
   ctx.bezierCurveTo(526.55,117.27,533.51,146.67,522.16,157.45);
   ctx.bezierCurveTo(525.38,169.91,543.68,182.02,548.36,178.38);
   ctx.bezierCurveTo(561.74,202.25,585.17,212.66,595.73,234.13);
   ctx.bezierCurveTo(604.26,243.86,613.48,253.08,596.40,246.89);
   ctx.bezierCurveTo(601.84,251.62,611.57,283.14,597.80,265.4);
   ctx.bezierCurveTo(607.33,282.66,606.40,298.94,606.55,304.63);
   ctx.bezierCurveTo(611.94,318.63,612.81,329.45,608.90,341.59);
   ctx.bezierCurveTo(611.14,355.15,604.50,354.78,602.72,370.08);
   ctx.bezierCurveTo(599.52,380.10,599.77,391.29,599.50,401.99);
   ctx.bezierCurveTo(597.03,409.31,594.46,424.68,583.90,425.29);
   ctx.bezierCurveTo(574.49,437.81,623.03,420.99,607.51,445.54);
   ctx.bezierCurveTo(586.15,456.33,574.05,487.94,566.91,508.86);
   ctx.bezierCurveTo(563.28,529.12,559.22,556.59,582.85,536.46);
   ctx.bezierCurveTo(617.64,503.80,621.68,578.99,589.2,582.69);
   ctx.bezierCurveTo(574.92,592.55,545.24,572.33,549.48,576.09);
   ctx.bezierCurveTo(536.25,611.40,544.16,653.25,519.03,684.47);
   ctx.bezierCurveTo(495.54,706.57,503.08,744.65,485.3,767.3);
   ctx.bezierCurveTo(451.96,775.98,418.80,786.35,385.35,793.99);
   ctx.bezierCurveTo(373.73,793.94,362.64,789.25,351.30,794.09);
   ctx.bezierCurveTo(325.57,794.98,299.27,795.18,274.61,801.98);
   ctx.bezierCurveTo(242.05,808.98,210.64,804.91,180.22,791.66);
   ctx.bezierCurveTo(173.19,785.31,159.05,790.13,155.1,782.1);
   ctx.closePath();
ctx.fill();
ctx.stroke();
 }
   
   drawLayer[2] = function(ctx) {
      ctx.beginPath();
   ctx.moveTo(151.3,780.3);
   ctx.bezierCurveTo(146.63,744.38,151.25,708.99,121.12,683.37);
   ctx.bezierCurveTo(99.95,649.23,108.39,607.20,100.26,569.50);
   ctx.bezierCurveTo(95.18,541.47,95.46,513.14,94.9,484.8);
   ctx.bezierCurveTo(74.41,462.61,89.39,429.23,86.15,402.17);
   ctx.bezierCurveTo(71.62,393.81,76.25,367.87,72.26,350.07);
   ctx.bezierCurveTo(81.08,323.41,69.94,300.88,75.91,273.33);
   ctx.bezierCurveTo(84.74,267.46,86.22,256.64,83.96,263.13);
   ctx.bezierCurveTo(93.47,243.99,109.98,237.52,82.4,245.6);
   ctx.bezierCurveTo(70.99,251.01,65.68,263.93,69.79,250.84);
   ctx.bezierCurveTo(66.74,248.32,102.14,223.03,81.85,235.45);
   ctx.bezierCurveTo(66.93,243.98,44.85,251.26,70.4,234.27);
   ctx.bezierCurveTo(77.44,225.59,111.49,211.12,81.10,218.6);
   ctx.bezierCurveTo(99.85,213.41,110.23,209.37,84.32,205.42);
   ctx.bezierCurveTo(54.21,204.22,46.31,125.54,77.68,170.77);
   ctx.bezierCurveTo(84.99,182.00,117.29,182.68,89.3,170.6);
   ctx.bezierCurveTo(75.44,164.99,51.65,149.79,79.3,158.6);
   ctx.bezierCurveTo(97.08,164.84,103.65,156.25,84.2,147.29);
   ctx.bezierCurveTo(93.81,153.67,138.94,167.86,109.30,152.79);
   ctx.bezierCurveTo(97.90,148.57,91.14,138.55,81.31,132.79);
   ctx.bezierCurveTo(71.82,127.52,57.56,125.08,60.48,121.55);
   ctx.bezierCurveTo(53.07,115.65,77.98,128.05,83.9,129.7);
   ctx.bezierCurveTo(80.83,123.73,55.09,112.96,68.2,114.9);
   ctx.bezierCurveTo(54.18,109.22,75.06,111.51,68.79,109.37);
   ctx.bezierCurveTo(83.78,122.88,84.28,116.89,80.32,112.28);
   ctx.bezierCurveTo(93.50,126.19,93.85,121.54,83.53,108.17);
   ctx.bezierCurveTo(73.23,96.17,83.79,101.65,82.59,95.56);
   ctx.bezierCurveTo(82.99,86.58,108.08,129.80,92.94,96.11);
   ctx.bezierCurveTo(88.53,59.05,108.98,128.07,101.9,91.8);
   ctx.bezierCurveTo(103.43,80.42,114.08,83.52,114.44,78.96);
   ctx.bezierCurveTo(111.51,65.30,121.56,69.02,119.35,70.01);
   ctx.bezierCurveTo(125.67,83.01,118.62,58.37,127.9,71.2);
   ctx.bezierCurveTo(131.55,48.37,134.18,80.59,137.21,81.68);
   ctx.bezierCurveTo(132.42,62.74,139.00,74.05,141.7,60.6);
   ctx.bezierCurveTo(145.91,78.71,157.88,78.70,148.29,61.2);
   ctx.bezierCurveTo(163.73,77.75,161.51,83.00,166.93,71.73);
   ctx.bezierCurveTo(175.01,85.35,194.47,77.96,207.98,79.15);
   ctx.bezierCurveTo(224.72,81.11,203.05,69.00,225.4,73.9);
   ctx.bezierCurveTo(203.95,63.59,256.48,76.85,226.8,67);
   ctx.bezierCurveTo(254.58,72.05,260.88,66.19,241.82,62.80);
   ctx.bezierCurveTo(255.76,66.73,269.55,65.58,283.45,62.5);
   ctx.bezierCurveTo(296.72,63.14,303.28,62.17,297.24,60.32);
   ctx.bezierCurveTo(307.41,60.57,322.58,60.53,333.39,60.66);
   ctx.bezierCurveTo(323.37,56.53,296.44,45.77,323.43,56.21);
   ctx.bezierCurveTo(337.40,63.93,354.58,64.04,345.63,58.58);
   ctx.bezierCurveTo(370.59,73.33,361.83,61.35,365.86,57.96);
   ctx.bezierCurveTo(384.98,78.40,391.24,69.71,378.22,64.03);
   ctx.bezierCurveTo(401.70,75.32,388.22,60.94,383.97,61.06);
   ctx.bezierCurveTo(399.26,74.57,418.94,80.48,437.20,88.01);
   ctx.bezierCurveTo(444.11,83.73,416.39,63.35,437.55,83.27);
   ctx.bezierCurveTo(451.52,92.44,478.24,138.86,487.40,105.5);
   ctx.bezierCurveTo(496.78,105.30,483.21,133.79,493.40,109.5);
   ctx.bezierCurveTo(498.20,107.15,487.39,142.80,496.90,118);
   ctx.bezierCurveTo(488.26,139.98,520.85,161.63,514.72,125.1);
   ctx.bezierCurveTo(514.23,101.15,519.80,150.04,521.03,118.33);
   ctx.bezierCurveTo(519.67,118.75,528.05,149.11,515.08,158.79);
   ctx.bezierCurveTo(510.16,178.33,508.83,181.88,533.00,173.29);
   ctx.bezierCurveTo(552.67,197.54,578.24,210.78,593.40,239);
   ctx.bezierCurveTo(601.84,256.16,596.69,273.55,599.11,283.77);
   ctx.bezierCurveTo(599.89,304.39,603.21,310.05,602.32,327.55);
   ctx.bezierCurveTo(600.03,336.27,599.00,342.10,602.01,358.24);
   ctx.bezierCurveTo(592.57,342.44,598.74,361.97,596.4,369.9);
   ctx.bezierCurveTo(596.42,387.94,583.26,365.27,586.3,388.7);
   ctx.bezierCurveTo(588.66,402.07,579.62,409.05,579.81,414.64);
   ctx.bezierCurveTo(577.92,438.60,582.48,464.57,563.69,483.6);
   ctx.bezierCurveTo(567.93,514.07,558.86,544.94,555.61,576.56);
   ctx.bezierCurveTo(537.04,612.56,550.72,657.89,524.02,690.84);
   ctx.bezierCurveTo(498.86,714.82,516.22,761.66,481.69,778.40);
   ctx.bezierCurveTo(465.61,789.93,447.70,796.47,428.14,798.44);
   ctx.bezierCurveTo(405.42,804.12,380.96,805.88,359.07,796.37);
   ctx.bezierCurveTo(327.81,792.34,296.35,801.16,264.98,797.94);
   ctx.bezierCurveTo(229.53,795.58,193.76,800.33,158.5,796.2);
   ctx.bezierCurveTo(155.81,791.04,153.01,785.88,151.3,780.30);
   ctx.closePath();
ctx.fill();
ctx.stroke();
   }
   
   drawLayer[4] = function(ctx) {
      ctx.beginPath();
   ctx.moveTo(160.3,783.9);
   ctx.bezierCurveTo(155.30,752.08,165.43,716.44,134.22,695.73);
   ctx.bezierCurveTo(99.58,653.42,110.24,595.96,99.82,545.80);
   ctx.bezierCurveTo(102.10,510.68,95.02,479.57,85.92,447.68);
   ctx.bezierCurveTo(83.16,423.85,103.98,376.92,81.77,370.50);
   ctx.bezierCurveTo(80.72,359.28,79.68,322.45,89.9,303.6);
   ctx.bezierCurveTo(76.97,328.78,80.72,306.15,86.9,292.20);
   ctx.bezierCurveTo(63.22,310.37,100.38,277.59,94.75,263.81);
   ctx.bezierCurveTo(108.00,250.96,141.46,223.12,104.99,234.35);
   ctx.bezierCurveTo(109.32,229.96,164.17,209.73,121.91,216.08);
   ctx.bezierCurveTo(105.31,217.58,88.61,217.22,115.26,211.27);
   ctx.bezierCurveTo(120.56,198.03,61.83,195.90,64.68,165.47);
   ctx.bezierCurveTo(45.89,133.79,91.76,193.06,100.5,177.65);
   ctx.bezierCurveTo(90.01,169.84,45.11,149.19,79.4,158.4);
   ctx.bezierCurveTo(97.18,164.64,103.75,156.05,84.30,147.1);
   ctx.bezierCurveTo(93.91,153.47,139.04,167.66,109.4,152.6);
   ctx.bezierCurveTo(99.30,146.94,88.08,141.28,84,129.6);
   ctx.bezierCurveTo(77.09,124.47,48.94,120.04,67.83,114.06);
   ctx.bezierCurveTo(79.95,115.63,82.86,120.50,78.96,110.89);
   ctx.bezierCurveTo(90.98,122.02,95.26,126.16,85.54,109.30);
   ctx.bezierCurveTo(80.35,94.17,82.26,88.86,92.42,103.85);
   ctx.bezierCurveTo(105.90,125.48,80.29,66.00,99.04,99.19);
   ctx.bezierCurveTo(107.49,114.51,96.33,71.41,111.59,84.25);
   ctx.bezierCurveTo(115.53,79.77,110.81,66.80,116.34,71.52);
   ctx.bezierCurveTo(118.42,62.00,122.90,85.01,123.14,66.01);
   ctx.bezierCurveTo(126.88,81.22,131.97,52.57,134.47,74.17);
   ctx.bezierCurveTo(141.03,98.70,131.44,59.16,138.02,69.36);
   ctx.bezierCurveTo(139.49,46.85,150.87,87.96,150.2,71.3);
   ctx.bezierCurveTo(148.66,51.74,155.99,74.24,164.39,80.6);
   ctx.bezierCurveTo(156.89,56.58,181.37,90.36,196.19,79.67);
   ctx.bezierCurveTo(212.79,81.04,214.80,77.17,216.86,73.70);
   ctx.bezierCurveTo(232.25,75.45,207.06,64.91,233.13,71.05);
   ctx.bezierCurveTo(248.04,73.81,210.04,62.57,238,68.8);
   ctx.bezierCurveTo(268.25,70.59,248.43,64.88,241.72,62.90);
   ctx.bezierCurveTo(255.66,66.83,269.45,65.68,283.35,62.6);
   ctx.bezierCurveTo(296.62,63.24,303.18,62.27,297.14,60.42);
   ctx.bezierCurveTo(307.31,60.66,322.48,60.64,333.29,60.75);
   ctx.bezierCurveTo(323.30,56.57,296.44,45.73,323.43,56.21);
   ctx.bezierCurveTo(337.40,63.93,354.58,64.04,345.63,58.58);
   ctx.bezierCurveTo(370.59,73.33,361.83,61.35,365.86,57.96);
   ctx.bezierCurveTo(384.98,78.40,391.24,69.71,378.22,64.03);
   ctx.bezierCurveTo(401.70,75.32,388.22,60.94,383.97,61.06);
   ctx.bezierCurveTo(399.26,74.57,418.94,80.48,437.19,88.01);
   ctx.bezierCurveTo(442.97,82.43,416.40,64.10,439.66,83.27);
   ctx.bezierCurveTo(454.68,93.67,472.12,114.66,485.95,120.00);
   ctx.bezierCurveTo(489.03,105.05,500.86,99.79,492.94,120.31);
   ctx.bezierCurveTo(500.94,100.42,499.76,113.67,496.99,128.1);
   ctx.bezierCurveTo(500.13,98.66,497.99,166.52,512.86,141.03);
   ctx.bezierCurveTo(514.96,119.89,517.03,109.82,515.61,133.91);
   ctx.bezierCurveTo(509.62,157.57,527.33,128.77,530.46,146.35);
   ctx.bezierCurveTo(520.77,154.64,523.85,166.74,518.18,175.61);
   ctx.bezierCurveTo(506.94,185.93,489.10,195.16,516.29,186.66);
   ctx.bezierCurveTo(530.94,165.11,550.56,180.06,545.69,200.5);
   ctx.bezierCurveTo(568.07,218.67,595.29,228.64,599.34,259.63);
   ctx.bezierCurveTo(595.52,276.12,601.01,289.92,601.28,309.17);
   ctx.bezierCurveTo(600.47,313.29,608.82,337.39,598.78,336.28);
   ctx.bezierCurveTo(595.78,350.59,598.00,364.37,587.19,374.2);
   ctx.bezierCurveTo(584.37,386.82,586.01,395.47,578.11,404.28);
   ctx.bezierCurveTo(575.17,422.51,577.68,442.02,578.31,460.42);
   ctx.bezierCurveTo(565.37,480.32,568.12,508.69,564.71,533.55);
   ctx.bezierCurveTo(563.55,572.70,545.62,609.06,545.57,648.45);
   ctx.bezierCurveTo(544.17,683.97,509.26,703.98,500.79,736.71);
   ctx.bezierCurveTo(490.90,764.28,486.57,799.02,449.44,794.35);
   ctx.bezierCurveTo(420.41,799.14,389.50,809.81,361.2,796.5);
   ctx.bezierCurveTo(329.34,791.63,297.18,801.11,265.18,797.74);
   ctx.bezierCurveTo(234.12,796.86,203.06,797.49,172,797.79);
   ctx.bezierCurveTo(166.86,794.51,162.40,789.68,160.3,783.89);
   ctx.closePath();
ctx.fill();
ctx.stroke();
   }
 
 drawLayer[3] = function(ctx) {
      ctx.beginPath();
 ctx.moveTo(150.10,779.03);
 ctx.bezierCurveTo(140.80,750.10,154.94,713.61,131.70,690.28);
 ctx.bezierCurveTo(107.98,660.00,106.41,621.10,104.32,584.41);
 ctx.bezierCurveTo(69.65,588.18,69.15,543.20,99.50,535.00);
 ctx.bezierCurveTo(96.95,517.27,97.51,499.34,96.47,481.57);
 ctx.bezierCurveTo(95.81,469.94,79.04,468.97,82.85,455.64);
 ctx.bezierCurveTo(78.68,436.06,94.10,407.11,78.40,402.46);
 ctx.bezierCurveTo(76.57,397.03,83.33,388.28,77.59,385.19);
 ctx.bezierCurveTo(80.34,368.77,72.79,352.44,76.35,336.21);
 ctx.bezierCurveTo(74.55,327.68,78.59,318.83,73.05,310.89);
 ctx.bezierCurveTo(82.28,294.12,70.15,272.98,85.10,259.07);
 ctx.bezierCurveTo(76.13,279.07,89.71,242.45,81.27,253.26);
 ctx.bezierCurveTo(72.55,264.78,85.24,245.22,81.29,244.44);
 ctx.bezierCurveTo(77.38,245.93,74.28,249.01,69.75,251.61);
 ctx.bezierCurveTo(65.11,262.69,66.97,243.87,78.79,238.50);
 ctx.bezierCurveTo(108.50,215.78,44.16,256.24,76.19,233.24);
 ctx.bezierCurveTo(87.99,228.73,105.50,207.88,80.07,217.42);
 ctx.bezierCurveTo(94.11,215.38,123.66,193.66,90.59,195.79);
 ctx.bezierCurveTo(72.09,196.70,46.65,158.29,61.44,154.92);
 ctx.bezierCurveTo(66.10,171.61,120.21,189.19,86.40,168.24);
 ctx.bezierCurveTo(78.90,163.49,64.63,159.91,63.25,153.54);
 ctx.bezierCurveTo(70.37,155.26,76.88,158.53,84.48,158.70);
 ctx.bezierCurveTo(116.79,165.83,66.23,136.58,93.40,151.50);
 ctx.bezierCurveTo(110.28,155.91,130.94,164.06,106.58,150.52);
 ctx.bezierCurveTo(95.75,146.70,89.73,136.86,80.41,131.57);
 ctx.bezierCurveTo(70.95,126.36,56.61,123.73,59.47,120.36);
 ctx.bezierCurveTo(51.93,114.42,76.76,126.76,82.76,128.46);
 ctx.bezierCurveTo(79.50,122.50,53.96,111.72,66.95,113.67);
 ctx.bezierCurveTo(51.46,106.85,75.55,112.75,66.02,106.92);
 ctx.bezierCurveTo(76.74,116.42,83.25,120.20,77.62,109.79);
 ctx.bezierCurveTo(87.51,119.19,96.14,127.00,84.81,109.91);
 ctx.bezierCurveTo(74.75,100.41,77.77,94.85,82.10,98.21);
 ctx.bezierCurveTo(77.09,81.47,92.45,105.01,96.50,109.17);
 ctx.bezierCurveTo(87.49,96.78,92.24,66.55,98.39,97.48);
 ctx.bezierCurveTo(104.96,109.77,100.74,97.09,100.61,91.67);
 ctx.bezierCurveTo(97.05,86.30,105.59,73.88,109.22,84.42);
 ctx.bezierCurveTo(112.91,76.06,113.17,73.95,112.30,67.49);
 ctx.bezierCurveTo(119.30,74.51,114.86,60.52,121.95,75.17);
 ctx.bezierCurveTo(116.52,55.58,127.97,80.28,129.50,61.79);
 ctx.bezierCurveTo(132.97,70.36,138.80,92.29,134.10,71.40);
 ctx.bezierCurveTo(135.38,63.18,138.34,68.28,141.28,61.06);
 ctx.bezierCurveTo(145.46,79.29,156.42,75.31,147.04,60.05);
 ctx.bezierCurveTo(157.95,65.98,166.21,95.38,161.55,65.05);
 ctx.bezierCurveTo(159.46,61.29,177.00,74.29,190.04,71.50);
 ctx.bezierCurveTo(201.32,71.89,212.71,72.23,224.06,72.77);
 ctx.bezierCurveTo(202.94,62.58,254.97,75.72,225.47,65.90);
 ctx.bezierCurveTo(243.66,69.63,268.16,66.90,238.53,61.43);
 ctx.bezierCurveTo(259.35,60.76,280.17,61.64,301.01,61.43);
 ctx.bezierCurveTo(281.56,56.30,316.10,62.53,310.93,58.93);
 ctx.bezierCurveTo(319.92,59.11,344.25,62.94,323.30,56.00);
 ctx.bezierCurveTo(294.56,43.99,327.84,57.42,341.19,61.73);
 ctx.bezierCurveTo(343.82,62.70,353.92,62.79,346.68,59.73);
 ctx.bezierCurveTo(334.65,48.68,378.25,78.93,362.00,55.31);
 ctx.bezierCurveTo(365.54,64.84,404.01,78.69,376.08,63.49);
 ctx.bezierCurveTo(372.77,60.53,412.26,76.35,382.95,59.66);
 ctx.bezierCurveTo(382.92,59.49,416.11,70.68,425.50,77.79);
 ctx.bezierCurveTo(454.40,103.67,423.04,64.90,428.72,73.44);
 ctx.bezierCurveTo(450.45,84.66,471.50,108.73,488.73,116.61);
 ctx.bezierCurveTo(491.71,109.03,491.97,100.74,492.77,92.71);
 ctx.bezierCurveTo(498.37,105.74,492.18,129.52,498.57,102.58);
 ctx.bezierCurveTo(501.25,86.29,494.71,146.31,502.09,114.99);
 ctx.bezierCurveTo(493.41,136.63,526.15,159.68,519.95,122.14);
 ctx.bezierCurveTo(519.41,97.73,525.06,146.86,526.20,115.92);
 ctx.bezierCurveTo(527.34,106.95,526.95,120.41,526.23,123.24);
 ctx.bezierCurveTo(536.02,136.86,517.51,151.05,523.83,161.65);
 ctx.bezierCurveTo(528.53,174.07,544.98,179.25,547.25,177.19);
 ctx.bezierCurveTo(556.43,199.97,584.93,207.00,589.00,227.90);
 ctx.bezierCurveTo(596.97,235.49,616.56,254.26,595.24,245.78);
 ctx.bezierCurveTo(600.73,250.48,610.38,281.95,596.63,264.23);
 ctx.bezierCurveTo(601.58,276.53,612.17,305.49,603.99,300.61);
 ctx.bezierCurveTo(609.08,309.54,606.56,318.93,613.13,327.13);
 ctx.bezierCurveTo(600.83,335.75,612.58,351.04,605.43,355.36);
 ctx.bezierCurveTo(602.63,361.16,599.74,374.31,598.86,383.77);
 ctx.bezierCurveTo(596.74,395.80,600.07,412.46,591.92,416.33);
 ctx.bezierCurveTo(585.28,428.73,578.45,423.03,581.02,440.38);
 ctx.bezierCurveTo(576.99,467.70,563.36,493.76,566.99,522.16);
 ctx.bezierCurveTo(555.55,538.90,564.56,550.35,583.39,542.24);
 ctx.bezierCurveTo(616.18,570.05,572.05,595.03,552.74,580.36);
 ctx.bezierCurveTo(540.17,612.70,548.23,650.40,528.33,680.64);
 ctx.bezierCurveTo(512.82,696.84,504.48,714.56,503.54,736.58);
 ctx.bezierCurveTo(500.26,756.33,486.71,771.66,469.34,780.84);
 ctx.bezierCurveTo(449.36,793.75,424.10,792.43,401.55,798.38);
 ctx.bezierCurveTo(386.91,800.78,371.56,801.63,357.95,795.00);
 ctx.bezierCurveTo(328.17,790.85,298.12,799.40,268.24,796.55);
 ctx.bezierCurveTo(231.32,794.07,194.07,798.86,157.34,794.72);
 ctx.bezierCurveTo(154.54,789.69,151.81,784.56,150.10,779.03);
 ctx.closePath();
 ctx.fill();
ctx.stroke();
   }
 
   drawLayer[5] = function(ctx) {
      ctx.beginPath();
   ctx.moveTo(180.1,781.7);
   ctx.bezierCurveTo(182.22,745.83,163.09,717.35,136.77,695.18);
   ctx.bezierCurveTo(103.89,658.92,113.00,607.36,104.06,562.82);
   ctx.bezierCurveTo(97.28,534.57,103.76,501.32,98.77,475.82);
   ctx.bezierCurveTo(77.39,448.66,91.22,406.69,111.39,383.24);
   ctx.bezierCurveTo(111.00,368.32,125.75,324.92,108.1,333.4);
   ctx.bezierCurveTo(89.43,355.66,124.56,290.97,108.94,296.63);
   ctx.bezierCurveTo(119.77,282.14,129.48,268.44,105.1,283.7);
   ctx.bezierCurveTo(80.27,287.85,116.25,251.80,126.17,242.77);
   ctx.bezierCurveTo(143.95,237.52,194.35,205.98,150.18,210.79);
   ctx.bezierCurveTo(130.57,209.46,112.19,198.16,94.5,190.1);
   ctx.bezierCurveTo(75.75,179.59,55.36,119.90,85.8,158.68);
   ctx.bezierCurveTo(93.60,170.22,134.63,187.02,103.1,165.7);
   ctx.bezierCurveTo(83.59,162.06,73.39,137.08,99.1,147.2);
   ctx.bezierCurveTo(87.18,140.43,86.03,133.66,95.33,134.66);
   ctx.bezierCurveTo(90.69,125.36,89.57,116.28,84.63,105.51);
   ctx.bezierCurveTo(82.10,86.88,101.38,122.06,101.8,103.3);
   ctx.bezierCurveTo(96.23,96.92,103.10,83.23,112.37,80.69);
   ctx.bezierCurveTo(111.13,77.92,127.08,71.93,122.92,72.48);
   ctx.bezierCurveTo(130.70,95.62,126.30,52.56,132.68,68.46);
   ctx.bezierCurveTo(140.36,74.86,138.62,54.92,144.87,67.67);
   ctx.bezierCurveTo(143.45,54.93,158.54,82.55,148.2,61.2);
   ctx.bezierCurveTo(160.41,58.69,163.71,79.67,165.99,58.61);
   ctx.bezierCurveTo(178.17,68.02,188.73,78.13,205.91,76.95);
   ctx.bezierCurveTo(213.94,81.17,247.53,73.26,226.3,70);
   ctx.bezierCurveTo(242.72,73.11,237.00,70.77,226.70,66.9);
   ctx.bezierCurveTo(247.71,71.86,243.12,61.61,264.70,67.9);
   ctx.bezierCurveTo(248.24,56.54,253.80,55.52,270.6,59.80);
   ctx.bezierCurveTo(277.58,63.32,303.78,63.50,298.66,61.36);
   ctx.bezierCurveTo(288.53,58.58,317.89,62.58,312.39,60.58);
   ctx.bezierCurveTo(330.25,66.83,350.43,63.68,366.89,66.98);
   ctx.bezierCurveTo(392.10,73.12,383.41,70.71,386.48,66.79);
   ctx.bezierCurveTo(407.23,75.20,377.51,56.41,397.67,67.78);
   ctx.bezierCurveTo(423.80,79.51,448.76,91.16,472.86,106.22);
   ctx.bezierCurveTo(480.46,118.90,492.26,126.46,505.61,132.08);
   ctx.bezierCurveTo(513.47,140.09,518.90,153.46,531.8,144.50);
   ctx.bezierCurveTo(532.56,155.39,528.43,168.21,522.15,168.18);
   ctx.bezierCurveTo(503.50,164.60,488.41,203.82,519.50,185.87);
   ctx.bezierCurveTo(536.55,173.23,558.78,195.05,534.39,204.50);
   ctx.bezierCurveTo(545.08,221.26,560.73,254.34,574.28,256.14);
   ctx.bezierCurveTo(557.56,223.68,591.50,257.14,594.80,267.62);
   ctx.bezierCurveTo(599.14,290.56,608.82,298.82,605.09,321.70);
   ctx.bezierCurveTo(599.84,307.94,591.05,313.32,583.29,298.90);
   ctx.bezierCurveTo(584.87,314.58,578.61,332.78,579.81,352.15);
   ctx.bezierCurveTo(574.63,383.03,578.34,414.97,577.25,446.56);
   ctx.bezierCurveTo(576.60,472.73,564.01,494.87,566.47,524.83);
   ctx.bezierCurveTo(562.62,569.89,550.74,613.84,545.45,658.79);
   ctx.bezierCurveTo(537.62,700.69,493.42,722.00,481.10,761.30);
   ctx.bezierCurveTo(491.76,788.33,459.84,797.84,439.11,798.97);
   ctx.bezierCurveTo(412.77,802.48,384.86,807.45,359.67,796.37);
   ctx.bezierCurveTo(328.41,792.34,296.95,801.16,265.58,797.94);
   ctx.bezierCurveTo(238.32,797.37,211.06,797.31,183.8,797.3);
   ctx.bezierCurveTo(182.23,792.17,181.60,786.83,180.10,781.69);
   ctx.closePath();
ctx.fill();
ctx.stroke();
   }
   
   drawLayer[6] = function(ctx) {
      ctx.beginPath();
   ctx.moveTo(206.3,780.8);
   ctx.bezierCurveTo(195.09,737.66,151.44,717.11,129.9,680.9);
   ctx.bezierCurveTo(106.74,641.67,112.46,594.58,107.06,551.08);
   ctx.bezierCurveTo(102.39,517.99,111.48,484.73,104,452.2);
   ctx.bezierCurveTo(116.66,422.07,114.95,388.24,122.57,356.49);
   ctx.bezierCurveTo(124.49,339.28,129.80,325.22,120.82,318.85);
   ctx.bezierCurveTo(114.99,299.33,128.80,278.31,124.61,274.95);
   ctx.bezierCurveTo(140.19,265.77,150.46,242.91,123.5,254.30);
   ctx.bezierCurveTo(146.32,233.60,184.26,232.57,201.40,200.27);
   ctx.bezierCurveTo(218.47,191.04,220.16,175.30,200.21,190.17);
   ctx.bezierCurveTo(173.15,210.09,135.05,216.27,109.50,189.82);
   ctx.bezierCurveTo(97.13,181.05,73.16,143.44,98.22,174.00);
   ctx.bezierCurveTo(116.71,202.10,153.86,202.06,177.8,181.2);
   ctx.bezierCurveTo(146.79,175.14,123.04,152.43,93.20,143.2);
   ctx.bezierCurveTo(111.79,145.84,99.25,132.60,105.38,130.66);
   ctx.bezierCurveTo(92.23,113.08,109.06,135.28,114.31,130.85);
   ctx.bezierCurveTo(141.25,142.51,169.66,161.68,199.89,149.02);
   ctx.bezierCurveTo(211.67,144.38,162.76,147.52,158.76,128.23);
   ctx.bezierCurveTo(145.55,111.45,121.32,97.35,129.27,90.77);
   ctx.bezierCurveTo(116.59,76.05,138.51,78.50,134.8,70.2);
   ctx.bezierCurveTo(139.00,67.37,138.57,67.11,142.41,62.36);
   ctx.bezierCurveTo(147.03,76.53,144.94,51.40,150.2,71.2);
   ctx.bezierCurveTo(148.40,55.95,157.11,54.45,171.49,58.32);
   ctx.bezierCurveTo(181.25,53.30,192.29,74.30,207.74,69.71);
   ctx.bezierCurveTo(224.69,72.81,245.01,72.55,229.01,67.35);
   ctx.bezierCurveTo(246.88,72.78,246.60,58.66,267.42,67.18);
   ctx.bezierCurveTo(276.40,70.03,268.02,53.01,287.95,59.79);
   ctx.bezierCurveTo(291.25,58.34,255.46,46.49,270.80,48.96);
   ctx.bezierCurveTo(287.88,47.64,310.87,63.51,312.16,60.40);
   ctx.bezierCurveTo(336.47,65.52,362.12,56.37,384.91,68.48);
   ctx.bezierCurveTo(399.38,74.62,390.67,65.22,400.47,66.76);
   ctx.bezierCurveTo(415.22,72.62,459.00,88.30,479.16,105.88);
   ctx.bezierCurveTo(493.37,120.88,508.64,134.98,522.05,150.62);
   ctx.bezierCurveTo(531.59,162.36,530.61,164.27,518.21,163.61);
   ctx.bezierCurveTo(494.09,137.85,508.68,188.92,481,188.4);
   ctx.bezierCurveTo(502.33,208.77,533.82,170.30,542.9,198.9);
   ctx.bezierCurveTo(520.51,217.45,571.42,231.69,570.02,257.71);
   ctx.bezierCurveTo(580.33,275.00,593.42,301.77,583.94,305.13);
   ctx.bezierCurveTo(587.01,317.63,560.94,310.50,573.99,330.98);
   ctx.bezierCurveTo(576.25,341.45,565.50,336.19,575.08,352.71);
   ctx.bezierCurveTo(587.90,380.14,556.26,324.31,561.75,363.6);
   ctx.bezierCurveTo(570.16,430.89,575.22,499.41,562.69,566.61);
   ctx.bezierCurveTo(553.22,609.99,560.20,659.11,531.54,696.32);
   ctx.bezierCurveTo(513.44,724.70,478.27,740.86,465.80,772.56);
   ctx.bezierCurveTo(468.29,796.56,446.46,805.75,426.56,802.71);
   ctx.bezierCurveTo(403.15,804.04,378.89,804.94,356.85,796.14);
   ctx.bezierCurveTo(326.18,792.99,295.42,801.06,264.68,798.04);
   ctx.bezierCurveTo(237.42,797.47,210.16,797.41,182.9,797.4);
   ctx.bezierCurveTo(190.60,792.75,203.56,790.36,206.3,780.8);
   ctx.closePath();
   ctx.moveTo(502.3,219.09);
   ctx.bezierCurveTo(518.68,237.04,537.31,251.40,548.69,273.48);
   ctx.bezierCurveTo(558.99,272.92,533.51,231.88,523.46,219.4);
   ctx.bezierCurveTo(522.86,208.32,496.77,208.02,502.3,219.1);
   ctx.closePath();
   ctx.moveTo(196.8,183.5);
   ctx.bezierCurveTo(182.38,183.01,149.97,195.30,148.16,203.36);
   ctx.bezierCurveTo(169.92,211.73,181.06,192.15,196.8,183.5);
   ctx.closePath();
ctx.fill();
ctx.stroke();
   }
   
   drawLayer[7] = function(ctx) {
      ctx.beginPath();
   ctx.moveTo(226.6,773.7);
   ctx.bezierCurveTo(198.34,735.59,144.95,719.33,126.01,672.86);
   ctx.bezierCurveTo(108.43,638.89,111.37,598.97,110.68,561.83);
   ctx.bezierCurveTo(111.87,524.21,110.10,486.44,115.86,449.16);
   ctx.bezierCurveTo(115.30,412.43,128.70,377.25,131.99,340.89);
   ctx.bezierCurveTo(144.11,311.31,139.37,274.28,165.56,251.43);
   ctx.bezierCurveTo(186.36,228.98,207.03,205.90,230.48,186.43);
   ctx.bezierCurveTo(215.89,182.80,186.63,192.98,173.3,189.60);
   ctx.bezierCurveTo(204.69,183.43,149.77,175.81,182.55,173.01);
   ctx.bezierCurveTo(183.86,170.36,159.64,173.82,153.86,165.11);
   ctx.bezierCurveTo(149.37,155.35,125.58,153.59,129.24,150.83);
   ctx.bezierCurveTo(139.11,144.52,128.42,129.00,146.54,138.46);
   ctx.bezierCurveTo(165.43,142.65,185.65,149.75,206.70,146.30);
   ctx.bezierCurveTo(168.91,154.60,148.10,106.33,125.86,93.97);
   ctx.bezierCurveTo(144.03,102.16,140.60,96.00,131.78,82.76);
   ctx.bezierCurveTo(145.03,92.16,129.13,57.30,139.2,80.8);
   ctx.bezierCurveTo(144.44,70.77,139.09,55.99,145.59,66.95);
   ctx.bezierCurveTo(144.49,55.39,154.16,81.98,158.5,62.7);
   ctx.bezierCurveTo(154.28,51.48,172.70,59.49,179.58,57.87);
   ctx.bezierCurveTo(187.39,74.65,207.62,61.68,220.18,70.31);
   ctx.bezierCurveTo(244.57,76.25,232.90,69.12,229.01,67.55);
   ctx.bezierCurveTo(246.88,72.98,246.60,58.86,267.42,67.38);
   ctx.bezierCurveTo(276.40,70.23,268.02,53.21,287.95,59.99);
   ctx.bezierCurveTo(266.67,46.37,311.13,55.90,312.06,60.40);
   ctx.bezierCurveTo(336.37,65.52,362.02,56.37,384.81,68.48);
   ctx.bezierCurveTo(401.48,74.94,386.82,61.46,405.01,73.70);
   ctx.bezierCurveTo(427.77,63.82,450.30,94.40,475.14,101.35);
   ctx.bezierCurveTo(488.52,118.05,506.36,130.55,518.80,148.1);
   ctx.bezierCurveTo(518.70,164.94,501.56,148.52,500.60,161.4);
   ctx.bezierCurveTo(481.65,130.64,501.78,189.42,477.10,189.20);
   ctx.bezierCurveTo(495.24,183.66,523.12,211.08,521.10,181.9);
   ctx.bezierCurveTo(544.63,183.19,522.33,219.37,551.37,224.61);
   ctx.bezierCurveTo(563.30,242.66,582.03,267.65,580.77,286.29);
   ctx.bezierCurveTo(554.77,261.81,539.91,223.99,506.7,208.4);
   ctx.bezierCurveTo(491.03,206.39,464.08,195.53,488.78,216.68);
   ctx.bezierCurveTo(508.02,240.59,532.09,261.55,544.09,290.4);
   ctx.bezierCurveTo(566.39,299.74,541.32,320.18,553.60,340.01);
   ctx.bezierCurveTo(557.90,403.47,573.14,466.90,563.33,530.69);
   ctx.bezierCurveTo(560.19,574.77,558.04,619.43,548.89,662.63);
   ctx.bezierCurveTo(535.67,704.96,498.33,730.68,465.1,756.6);
   ctx.bezierCurveTo(442.06,768.11,444.92,812.99,415.67,804.46);
   ctx.bezierCurveTo(395.88,803.04,375.60,803.40,357.05,795.84);
   ctx.bezierCurveTo(331.25,792.19,304.99,800.41,279.33,797.10);
   ctx.bezierCurveTo(261.52,790.35,241.63,785.69,226.6,773.7);
   ctx.closePath();
ctx.fill();
ctx.stroke();
   }
   
   drawLayer[8] = function(ctx) {
      ctx.beginPath();
   ctx.moveTo(508.6,253);
   ctx.bezierCurveTo(532.20,287.74,543.03,329.01,545.96,370.46);
   ctx.bezierCurveTo(552.81,409.96,557.03,449.98,562.86,489.68);
   ctx.bezierCurveTo(560.88,543.13,557.07,596.78,549.43,649.71);
   ctx.bezierCurveTo(541.26,698.25,499.34,731.82,457.36,752.07);
   ctx.bezierCurveTo(427.40,759.30,431.42,804.45,402.78,803.35);
   ctx.bezierCurveTo(386.43,804.22,370.57,800.67,355.23,795.71);
   ctx.bezierCurveTo(330.86,793.32,306.32,799.35,282,798);
   ctx.bezierCurveTo(248.25,783.07,232.96,745.08,197.84,732.32);
   ctx.bezierCurveTo(159.08,720.18,129.60,686.86,121.3,647.3);
   ctx.bezierCurveTo(117.76,583.03,118.02,518.29,122.91,454.10);
   ctx.bezierCurveTo(131.84,403.22,142.41,352.70,157.9,303.4);
   ctx.bezierCurveTo(162.67,268.18,193.46,244.51,214.04,217.75);
   ctx.bezierCurveTo(246.45,184.99,290.56,169.40,333.61,156.49);
   ctx.bezierCurveTo(318.41,155.60,293.08,166.39,293.75,158.28);
   ctx.bezierCurveTo(263.96,173.85,240.19,161.34,210.3,170.1);
   ctx.bezierCurveTo(190.44,177.52,149.54,134.19,191.91,149.41);
   ctx.bezierCurveTo(210.24,155.95,233.74,146.78,201.54,141.26);
   ctx.bezierCurveTo(181.05,132.43,144.49,119.04,147.70,92.26);
   ctx.bezierCurveTo(159.87,92.58,155.43,88.20,147.2,75.7);
   ctx.bezierCurveTo(165.06,85.04,147.36,50.95,160.43,77.79);
   ctx.bezierCurveTo(172.06,86.15,154.82,42.75,170.6,69.3);
   ctx.bezierCurveTo(173.32,61.51,170.87,51.15,183.29,63.8);
   ctx.bezierCurveTo(191.85,42.47,188.12,86.70,202.67,76.66);
   ctx.bezierCurveTo(212.79,60.70,223.39,81.84,238.26,73.12);
   ctx.bezierCurveTo(215.04,62.08,246.11,73.18,258.84,68.58);
   ctx.bezierCurveTo(259.72,58.00,277.71,69.67,286.89,69.6);
   ctx.bezierCurveTo(286.95,61.88,332.15,83.59,318.59,72.3);
   ctx.bezierCurveTo(324.44,60.11,345.35,76.88,345.19,63.52);
   ctx.bezierCurveTo(355.95,65.32,365.11,68.03,358.00,62.22);
   ctx.bezierCurveTo(372.89,63.94,387.85,71.01,400.92,73.74);
   ctx.bezierCurveTo(407.64,70.48,440.42,90.29,452.62,89.11);
   ctx.bezierCurveTo(465.39,100.57,476.46,103.55,480.68,105.60);
   ctx.bezierCurveTo(485.74,116.42,496.22,120.74,506.49,125.3);
   ctx.bezierCurveTo(518.53,135.43,508.71,152.75,505.71,145.45);
   ctx.bezierCurveTo(504.40,156.68,492.23,130.82,497.97,155.56);
   ctx.bezierCurveTo(503.07,169.63,489.24,170.36,488.39,182.7);
   ctx.bezierCurveTo(468.41,204.67,473.77,153.63,460.79,180.89);
   ctx.bezierCurveTo(441.86,178.75,469.27,162.83,441.78,164.90);
   ctx.bezierCurveTo(416.48,166.55,417.60,142.98,397.37,134.18);
   ctx.bezierCurveTo(383.51,116.79,413.23,155.97,389.70,152.35);
   ctx.bezierCurveTo(383.17,166.29,434.08,176.54,449.24,194.24);
   ctx.bezierCurveTo(471.38,210.81,491.22,231.53,508.6,253);
   ctx.closePath();
ctx.fill();
ctx.stroke();
   }
   
   drawLayer[9] = function(ctx) {
      ctx.beginPath();
   ctx.moveTo(373.5,170.7);
   ctx.bezierCurveTo(413.51,183.65,451.00,207.06,479.94,237.59);
   ctx.bezierCurveTo(503.36,267.35,518.68,302.01,527.5,338.7);
   ctx.bezierCurveTo(554.34,365.18,527.48,393.15,533.96,424.06);
   ctx.bezierCurveTo(547.59,459.37,562.29,496.03,555.23,534.73);
   ctx.bezierCurveTo(547.82,582.62,551.59,633.91,530.3,678.5);
   ctx.bezierCurveTo(513.19,715.89,475.25,733.80,441.22,752.32);
   ctx.bezierCurveTo(414.15,765.37,396.47,793.89,383.56,814.77);
   ctx.bezierCurveTo(353.54,820.91,323.52,827.05,293.5,833.2);
   ctx.bezierCurveTo(269.23,808.69,270.84,762.15,236.11,744.62);
   ctx.bezierCurveTo(203.48,726.39,164.17,716.65,142.55,683.20);
   ctx.bezierCurveTo(115.36,638.72,124.67,585.79,124.39,536.48);
   ctx.bezierCurveTo(124.89,500.98,122.93,470.98,139.34,438.20);
   ctx.bezierCurveTo(153.30,409.28,144.76,378.23,152.28,348.56);
   ctx.bezierCurveTo(169.01,316.58,175.01,279.18,200.02,251.40);
   ctx.bezierCurveTo(227.26,207.32,278.10,185.06,326.13,172.21);
   ctx.bezierCurveTo(341.74,170.37,357.88,167.43,373.5,170.69);
   ctx.closePath();
   ctx.moveTo(364.4,155.29);
   ctx.bezierCurveTo(335.71,160.05,310.27,134.12,279.04,149.88);
   ctx.bezierCurveTo(255.08,165.76,232.63,164.64,204.68,176.34);
   ctx.bezierCurveTo(185.01,185.93,201.88,171.76,209.94,166.41);
   ctx.bezierCurveTo(246.98,145.31,151.87,183.78,194.88,163.89);
   ctx.bezierCurveTo(208.49,155.13,270.65,131.29,225.78,130.81);
   ctx.bezierCurveTo(205.02,133.79,143.29,96.51,152.29,99.21);
   ctx.bezierCurveTo(175.34,102.14,152.93,92.51,157.8,82.3);
   ctx.bezierCurveTo(170.36,88.40,215.01,83.52,179.32,80.25);
   ctx.bezierCurveTo(147.70,69.92,204.36,81.13,216.73,79.90);
   ctx.bezierCurveTo(216.96,70.10,258.70,88.14,236.78,68.54);
   ctx.bezierCurveTo(231.45,62.40,264.95,81.37,246.46,62.02);
   ctx.bezierCurveTo(246.62,58.52,270.15,70.04,271.94,67.39);
   ctx.bezierCurveTo(273.64,62.91,292.22,76.07,301.14,69.38);
   ctx.bezierCurveTo(314.90,69.54,282.39,53.38,305.87,62.21);
   ctx.bezierCurveTo(321.40,65.87,353.29,58.41,353.81,60.18);
   ctx.bezierCurveTo(341.25,49.15,378.40,68.74,360.60,53.7);
   ctx.bezierCurveTo(383.67,56.04,404.64,67.37,422.50,81.7);
   ctx.bezierCurveTo(427.26,99.29,429.41,108.06,449.97,106.48);
   ctx.bezierCurveTo(461.06,105.27,437.52,93.93,433.45,90.79);
   ctx.bezierCurveTo(414.06,63.60,471.26,107.89,445.5,80.8);
   ctx.bezierCurveTo(457.08,91.59,466.40,99.69,464.46,79.72);
   ctx.bezierCurveTo(458.75,106.81,535.56,119.70,493.37,138.23);
   ctx.bezierCurveTo(480.13,142.51,512.34,165.83,484.23,169.38);
   ctx.bezierCurveTo(463.79,180.61,448.21,159.87,431.15,161.92);
   ctx.bezierCurveTo(421.10,146.78,400.08,137.57,387.3,118.80);
   ctx.bezierCurveTo(388.24,133.08,356.38,108.19,381.68,130.90);
   ctx.bezierCurveTo(398.93,134.12,374.67,147.66,379.95,150.70);
   ctx.bezierCurveTo(374.77,152.23,369.58,153.76,364.40,155.3);
   ctx.closePath();
ctx.fill();
ctx.stroke();
   }
   
   drawLayer[10] = function(ctx) {
      ctx.beginPath();
   ctx.moveTo(407.3,198.8);
   ctx.bezierCurveTo(442.63,216.46,472.15,244.02,490.84,278.94);
   ctx.bezierCurveTo(505.11,304.82,520.08,337.62,530.07,360.46);
   ctx.bezierCurveTo(532.19,391.85,495.71,424.17,529.89,450.98);
   ctx.bezierCurveTo(550.01,479.24,553.52,515.42,547.72,548.9);
   ctx.bezierCurveTo(544.13,594.07,536.80,640.02,518.30,681.59);
   ctx.bezierCurveTo(501.69,714.54,468.75,731.31,436.64,745.53);
   ctx.bezierCurveTo(404.79,759.12,384.57,786.46,365.7,814);
   ctx.bezierCurveTo(354.93,828.17,334.38,824.86,318.8,830.4);
   ctx.bezierCurveTo(302.53,796.28,282.51,762.51,248.94,742.75);
   ctx.bezierCurveTo(217.59,719.78,171.76,717.84,151.80,680.28);
   ctx.bezierCurveTo(122.47,629.46,134.35,568.89,130.35,513.02);
   ctx.bezierCurveTo(124.38,470.42,158.59,438.52,167.22,400.35);
   ctx.bezierCurveTo(151.13,366.09,157.05,334.16,180.62,306.60);
   ctx.bezierCurveTo(203.51,265.90,228.39,219.30,276.85,205.59);
   ctx.bezierCurveTo(312.32,186.19,354.91,179.01,393.58,193.11);
   ctx.bezierCurveTo(398.31,194.59,403.01,196.26,407.30,198.8);
   ctx.closePath();
   ctx.moveTo(364.40,144.5);
   ctx.bezierCurveTo(349.91,165.35,335.60,138.63,315.54,148.12);
   ctx.bezierCurveTo(286.66,136.79,257.59,162.88,237.28,171.08);
   ctx.bezierCurveTo(225.45,173.52,213.62,175.96,201.80,178.4);
   ctx.bezierCurveTo(213.98,164.12,227.68,151.76,245.25,144.37);
   ctx.bezierCurveTo(258.64,136.97,293.34,120.57,257.29,126.11);
   ctx.bezierCurveTo(228.46,132.01,199.48,119.17,173.09,110.29);
   ctx.bezierCurveTo(168.43,101.04,163.05,98.13,177.73,92.55);
   ctx.bezierCurveTo(188.40,87.37,201.08,88.58,212.6,86.1);
   ctx.bezierCurveTo(195.72,72.06,252.53,88.57,263.19,85.98);
   ctx.bezierCurveTo(281.18,95.19,315.14,76.73,280.92,71.23);
   ctx.bezierCurveTo(256.68,62.40,283.73,55.73,294.22,65.41);
   ctx.bezierCurveTo(307.05,70.09,320.90,65.12,306.1,52.7);
   ctx.bezierCurveTo(326.11,62.12,339.02,53.36,356.18,63.05);
   ctx.bezierCurveTo(336.72,43.44,386.65,78.86,367.5,53.7);
   ctx.bezierCurveTo(383.63,59.54,403.28,63.47,413.15,78.46);
   ctx.bezierCurveTo(406.20,94.64,433.27,108.29,450.07,106.48);
   ctx.bezierCurveTo(465.64,106.73,425.16,87.62,439.35,94.20);
   ctx.bezierCurveTo(468.40,96.15,495.35,122.46,485.68,139.13);
   ctx.bezierCurveTo(505.79,168.52,445.94,175.61,441.40,149.10);
   ctx.bezierCurveTo(421.98,171.39,421.70,125.28,397.04,125.29);
   ctx.bezierCurveTo(380.50,112.30,376.08,108.37,360.36,114.93);
   ctx.bezierCurveTo(330.15,109.51,361.45,126.22,370.98,131.82);
   ctx.bezierCurveTo(347.76,136.47,335.34,133.42,362.34,143.62);
   ctx.lineTo(364.14,144.39);
   ctx.closePath();
ctx.fill();
ctx.stroke();
   }
   
   drawLayer[11] = function(ctx) {
      ctx.beginPath();
   ctx.moveTo(360.7,203.7);
   ctx.bezierCurveTo(392.17,211.85,424.87,221.15,445.42,248.51);
   ctx.bezierCurveTo(466.83,271.56,492.33,292.31,504.8,322.09);
   ctx.bezierCurveTo(544.97,340.41,510.78,375.19,499.70,400.00);
   ctx.bezierCurveTo(505.14,418.01,522.57,408.88,498.50,415);
   ctx.bezierCurveTo(493.75,453.81,546.26,467.65,545.43,506.76);
   ctx.bezierCurveTo(548.61,552.14,535.35,597.20,524.37,640.85);
   ctx.bezierCurveTo(509.29,678.49,488.41,718.75,447.6,733.2);
   ctx.bezierCurveTo(414.68,749.12,381.94,770.23,344.97,774.07);
   ctx.bezierCurveTo(297.38,769.18,262.09,731.45,217.84,716.47);
   ctx.bezierCurveTo(180.38,704.28,156.79,666.74,154.40,628.46);
   ctx.bezierCurveTo(147.90,582.94,139.96,536.40,145.19,490.49);
   ctx.bezierCurveTo(145.56,456.25,198.90,424.61,188.63,402.44);
   ctx.bezierCurveTo(203.78,392.43,168.62,358.37,172.53,335.82);
   ctx.bezierCurveTo(171.02,315.31,206.85,307.28,211.40,283.17);
   ctx.bezierCurveTo(242.46,241.35,289.36,210.54,341.87,205.72);
   ctx.bezierCurveTo(347.37,201.83,354.51,200.96,360.70,203.69);
   ctx.closePath();
   ctx.moveTo(308.7,123.49);
   ctx.bezierCurveTo(336.62,132.29,308.53,133.02,310.2,138.57);
   ctx.bezierCurveTo(293.49,142.86,261.51,168.24,243.17,160.24);
   ctx.bezierCurveTo(228.94,161.16,211.71,175.80,230.78,157.82);
   ctx.bezierCurveTo(243.96,145.63,306.72,119.89,257.91,123.51);
   ctx.bezierCurveTo(241.96,130.40,224.61,122.34,235.26,117.87);
   ctx.bezierCurveTo(218.17,119.97,157.28,106.15,202.73,99.55);
   ctx.bezierCurveTo(213.07,100.18,189.86,90.70,211.89,91.44);
   ctx.bezierCurveTo(228.09,93.00,235.17,91.94,223.53,87.35);
   ctx.bezierCurveTo(244.49,89.10,265.67,96.61,286.1,88);
   ctx.bezierCurveTo(298.46,89.63,327.99,66.45,300.1,72.6);
   ctx.bezierCurveTo(307.33,62.15,326.77,69.18,311.17,53.57);
   ctx.bezierCurveTo(321.01,56.50,365.63,61.72,358.41,60.18);
   ctx.bezierCurveTo(346.06,46.55,390.58,77.71,370.57,55.58);
   ctx.bezierCurveTo(389.65,61.91,392.68,80.05,409.21,76.22);
   ctx.bezierCurveTo(406.57,105.46,431.44,89.85,446.68,97.33);
   ctx.bezierCurveTo(455.86,101.00,471.08,104.29,471.88,115.82);
   ctx.bezierCurveTo(475.86,127.26,449.49,95.68,456.75,112.40);
   ctx.bezierCurveTo(461.97,114.00,485.32,134.12,468.62,127.38);
   ctx.bezierCurveTo(453.62,128.20,455.48,107.69,442.05,105.92);
   ctx.bezierCurveTo(412.19,94.52,435.07,142.51,452.73,141.58);
   ctx.bezierCurveTo(462.64,153.15,418.56,142.62,427.91,126.54);
   ctx.bezierCurveTo(417.89,102.98,416.44,111.90,413.51,118.25);
   ctx.bezierCurveTo(404.25,109.87,441.24,163.23,417.94,133);
   ctx.bezierCurveTo(393.45,119.46,371.86,73.02,338.69,88.3);
   ctx.bezierCurveTo(372.33,106.92,316.21,95.55,319.32,102.87);
   ctx.bezierCurveTo(333.40,108.57,342.78,113.42,321.66,112.78);
   ctx.bezierCurveTo(309.55,108.54,371.11,132.51,336.25,122.57);
   ctx.bezierCurveTo(327.09,121.53,317.78,122.01,308.69,123.5);
   ctx.closePath();
   ctx.moveTo(459.6,152.2);
   ctx.bezierCurveTo(470.56,162.43,482.25,149.02,464,149.39);
   ctx.bezierCurveTo(462.53,150.33,461.06,151.26,459.6,152.2);
   ctx.closePath();
ctx.fill();
ctx.stroke();
   }
   
   drawLayer[12] = function(ctx) {
      ctx.beginPath();
   ctx.moveTo(250.1,96.6);
   ctx.bezierCurveTo(246.78,84.29,272.28,92.14,279.07,82.41);
   ctx.bezierCurveTo(291.38,87.01,325.01,68.17,295.7,72.6);
   ctx.bezierCurveTo(315.09,66.70,306.61,53.67,328.6,59.5);
   ctx.bezierCurveTo(340.56,49.21,358.03,66.46,359.26,75.82);
   ctx.bezierCurveTo(373.11,85.94,369.73,51.67,391.5,67.7);
   ctx.bezierCurveTo(389.09,89.58,414.86,100.87,425.42,101.38);
   ctx.bezierCurveTo(430.36,118.03,426.04,134.74,412.52,110.37);
   ctx.bezierCurveTo(388.89,102.00,361.07,87.21,332.39,81);
   ctx.bezierCurveTo(322.74,89.44,335.30,99.80,314.06,99.95);
   ctx.bezierCurveTo(307.66,104.73,347.55,113.03,322.98,112.56);
   ctx.bezierCurveTo(310.84,113.01,299.51,131.99,287.93,133.65);
   ctx.bezierCurveTo(283.10,159.99,251.78,155.97,237.81,157.05);
   ctx.bezierCurveTo(223.80,162.99,263.03,138.56,267.90,133.01);
   ctx.bezierCurveTo(295.10,112.22,216.53,142.29,250.04,114.91);
   ctx.bezierCurveTo(260.08,107.64,252.08,104.38,250.09,96.60);
   ctx.closePath();
   ctx.moveTo(534.3,535.4);
   ctx.bezierCurveTo(538.15,491.37,498.86,465.78,475.99,434.59);
   ctx.bezierCurveTo(476.09,416.28,484.74,424.82,484.39,417.79);
   ctx.bezierCurveTo(470.68,415.36,457.68,412.31,470.29,393.79);
   ctx.bezierCurveTo(483.47,394.66,493.37,419.10,505.37,404.34);
   ctx.bezierCurveTo(487.74,405.05,487.65,398.07,494.98,392.69);
   ctx.bezierCurveTo(471.98,405.17,512.69,375.64,485.99,391.59);
   ctx.bezierCurveTo(492.65,383.18,471.21,390.97,488.99,373.99);
   ctx.bezierCurveTo(499.61,353.05,523.13,335.34,492.65,321.91);
   ctx.bezierCurveTo(474.62,293.28,449.53,269.13,419.08,253.63);
   ctx.bezierCurveTo(393.16,232.39,355.19,218.05,322.35,228.87);
   ctx.bezierCurveTo(287.27,247.60,245.27,258.23,220.13,291.27);
   ctx.bezierCurveTo(200.08,311.49,170.40,328.39,192.03,360.96);
   ctx.bezierCurveTo(204.57,373.67,207.22,385.13,201.29,387.29);
   ctx.bezierCurveTo(202.84,395.01,195.49,391.60,193.95,397.75);
   ctx.bezierCurveTo(193.30,405.95,222.19,377.42,218.18,400.24);
   ctx.bezierCurveTo(225.42,407.79,192.41,394.73,202.09,407.99);
   ctx.bezierCurveTo(218.27,396.46,205.49,416.69,217.49,405.29);
   ctx.bezierCurveTo(213.49,414.41,230.16,399.20,220.79,414.79);
   ctx.bezierCurveTo(223.45,415.16,233.31,400.50,234.29,421.89);
   ctx.bezierCurveTo(208.71,431.57,181.07,442.67,164.99,466.89);
   ctx.bezierCurveTo(136.69,516.61,160.26,574.02,166.71,626.02);
   ctx.bezierCurveTo(172.77,660.46,187.86,698.26,221.53,713.36);
   ctx.bezierCurveTo(257.85,730.22,292.75,754.49,333.31,759.07);
   ctx.bezierCurveTo(366.55,758.83,400.50,750.52,430.82,736.67);
   ctx.bezierCurveTo(481.40,720.01,499.86,664.91,514.42,618.95);
   ctx.bezierCurveTo(521.57,591.32,531.49,563.90,534.3,535.4);
   ctx.closePath();
   ctx.moveTo(485.5,424);
   ctx.lineTo(485.5,424.6);
   ctx.closePath();
ctx.fill();
ctx.stroke();
   }
   
   drawLayer[13] = function(ctx) {
      ctx.beginPath();
   ctx.moveTo(221,408);
   ctx.bezierCurveTo(220.73,413.02,216.71,408.64,216.60,413.11);
   ctx.bezierCurveTo(212.13,421.58,216.72,406.56,221,408);
   ctx.closePath();
   ctx.moveTo(199.3,378.8);
   ctx.lineTo(199.5,379);
   ctx.closePath();
   ctx.moveTo(232,408.3);
   ctx.bezierCurveTo(220.84,416.44,232.48,421.25,232,408.3);
   ctx.closePath();
   ctx.moveTo(299.2,748.1);
   ctx.bezierCurveTo(351.32,760.44,409.68,749.06,452.13,716.51);
   ctx.bezierCurveTo(480.06,688.68,487.16,647.26,499.44,611.10);
   ctx.bezierCurveTo(510.54,573.21,527.01,528.99,503.3,492.3);
   ctx.bezierCurveTo(481.48,467.67,449.59,453.27,419.85,440.23);
   ctx.bezierCurveTo(395.61,437.42,350.62,388.96,389.61,380.49);
   ctx.bezierCurveTo(423.33,370.78,463.46,373.40,489.5,346.62);
   ctx.bezierCurveTo(498.63,328.24,467.29,317.72,457.04,306.18);
   ctx.bezierCurveTo(433.20,276.45,395.71,273.60,364.96,255.07);
   ctx.bezierCurveTo(329.73,239.90,295.29,270.82,259.8,273.5);
   ctx.bezierCurveTo(236.79,290.01,199.57,307.87,193.18,332.32);
   ctx.bezierCurveTo(196.61,346.70,226.48,371.03,220.01,374.36);
   ctx.bezierCurveTo(213.56,367.94,218.71,375.71,209.83,381.94);
   ctx.bezierCurveTo(205.41,369.80,204.98,383.07,201.95,377.36);
   ctx.bezierCurveTo(209.34,384.41,191.90,377.92,207.69,385.5);
   ctx.bezierCurveTo(178.32,389.28,222.19,386.36,230.59,379.5);
   ctx.bezierCurveTo(251.82,380.47,262.88,392.43,265.9,371.2);
   ctx.bezierCurveTo(295.44,355.54,330.99,399.59,290.09,410.09);
   ctx.bezierCurveTo(273.08,422.36,236.69,390.17,234.29,415.99);
   ctx.bezierCurveTo(245.20,440.53,187.05,444.71,177.87,469.18);
   ctx.bezierCurveTo(160.24,493.73,151.75,524.04,159.20,554.06);
   ctx.bezierCurveTo(172.64,602.05,175.76,655.24,205.49,696.89);
   ctx.bezierCurveTo(231.50,720.74,265.30,738.61,299.19,748.09);
   ctx.closePath();
   ctx.moveTo(426,385.3);
   ctx.bezierCurveTo(425.23,375.26,418.23,388.55,428.40,389.09);
   ctx.lineTo(427.91,388);
   ctx.closePath();
   ctx.moveTo(440.5,386.5);
   ctx.bezierCurveTo(445.14,367.23,430.26,380.46,436.6,387.4);
   ctx.closePath();
   ctx.moveTo(444.1,386.2);
   ctx.bezierCurveTo(457.16,385.96,458.28,370.99,451.57,376.21);
   ctx.bezierCurveTo(451.52,365.44,446.81,385.18,444.1,386.2);
   ctx.closePath();
   ctx.moveTo(455.70,386.8);
   ctx.bezierCurveTo(476.72,398.47,492.23,377.56,473.92,386.67);
   ctx.bezierCurveTo(482.41,369.08,467.86,394.53,472.30,379.40);
   ctx.bezierCurveTo(463.20,391.33,469.40,372.02,461.82,376.27);
   ctx.bezierCurveTo(458.61,379.11,457.33,383.15,455.30,386.8);
   ctx.moveTo(304.9,91.6);
   ctx.bezierCurveTo(286.10,85.09,275.98,82.47,280.70,87.61);
   ctx.bezierCurveTo(275.09,86.14,265.02,93.53,262.85,94);
   ctx.bezierCurveTo(270.97,90.47,312.83,102.98,304.90,91.6);
   ctx.closePath();
   ctx.moveTo(360.9,92.19);
   ctx.bezierCurveTo(351.20,82.33,320.26,66.27,333.96,78.77);
   ctx.bezierCurveTo(313.09,70.95,369.84,105.59,360.9,92.2);
   ctx.closePath();
   ctx.moveTo(261.5,142.5);
   ctx.bezierCurveTo(239.18,145.53,256.91,150.61,254.12,151.23);
   ctx.bezierCurveTo(258.73,150.59,276.37,147.28,261.5,142.5);
   ctx.closePath();
   ctx.moveTo(276,150.9);
   ctx.bezierCurveTo(260.06,159.03,266.30,161.28,278.5,151.5);
   ctx.lineTo(276.60,151.04);
   ctx.closePath();
ctx.fill();
ctx.stroke();
   }
   
   drawLayer[14] = function(ctx) {
      ctx.beginPath();
   ctx.moveTo(333.4,732.4);
   ctx.bezierCurveTo(372.56,733.44,421.02,733.00,447.37,699.06);
   ctx.bezierCurveTo(459.07,668.74,465.20,635.74,472.32,603.96);
   ctx.bezierCurveTo(476.82,569.10,496.75,531.78,478.70,497.63);
   ctx.bezierCurveTo(453.53,469.55,407.43,471.00,388,437.21);
   ctx.bezierCurveTo(372.34,414.44,341.56,358.41,387.14,350.83);
   ctx.bezierCurveTo(409.11,346.26,472.92,327.74,427.78,304.46);
   ctx.bezierCurveTo(391.07,283.10,347.09,299.07,308.59,284.53);
   ctx.bezierCurveTo(278.21,277.94,232.74,280.81,218.69,312.61);
   ctx.bezierCurveTo(229.01,351.77,281.53,330.58,305.76,355.38);
   ctx.bezierCurveTo(332.44,378.93,302.95,416.23,281.53,432.59);
   ctx.bezierCurveTo(254.96,458.94,211.86,455.66,183.48,476.57);
   ctx.bezierCurveTo(154.79,506.51,172.23,549.40,180.12,584.11);
   ctx.bezierCurveTo(186.82,613.21,192.98,642.92,199.12,671.73);
   ctx.bezierCurveTo(215.49,714.17,263.74,728.49,305.22,730.63);
   ctx.bezierCurveTo(314.59,731.50,323.99,732.14,333.39,732.40);
   ctx.closePath();
ctx.fill();
ctx.stroke();
   }
   
   drawLayer[15] = function(ctx) {
      ctx.beginPath();
   ctx.moveTo(341.1,727.1);
   ctx.bezierCurveTo(376.43,725.92,424.79,726.98,442.41,689.49);
   ctx.bezierCurveTo(453.53,653.85,438.40,616.67,451.4,581.1);
   ctx.bezierCurveTo(456.63,548.11,439.99,520.56,409.96,506.52);
   ctx.bezierCurveTo(395.58,496.10,400.22,470.96,385.2,455.3);
   ctx.bezierCurveTo(365.42,432.11,373.21,369.33,330.4,379.4);
   ctx.bezierCurveTo(311.26,404.00,308.56,439.06,290.31,462.45);
   ctx.bezierCurveTo(281.15,489.41,258.41,492.89,231.36,494.79);
   ctx.bezierCurveTo(194.53,508.81,211.17,551.67,213.36,580.60);
   ctx.bezierCurveTo(222.72,616.41,217.64,655.20,230.67,689.61);
   ctx.bezierCurveTo(246.89,725.87,292.95,722.69,326.22,726.53);
   ctx.bezierCurveTo(331.18,726.78,336.14,726.97,341.1,727.09);
   ctx.closePath();
ctx.fill();
ctx.stroke();
   }
   
   drawLayer[16] = function(ctx) {
      ctx.beginPath();
   ctx.moveTo(343.2,717.2);
   ctx.bezierCurveTo(373.95,719.10,417.55,718.50,428.62,682.75);
   ctx.bezierCurveTo(426.00,652.76,416.53,623.73,407.13,595.19);
   ctx.bezierCurveTo(394.72,574.65,416.20,555.20,391.80,536.54);
   ctx.bezierCurveTo(378.36,529.22,346.87,493.58,382.7,500.1);
   ctx.bezierCurveTo(414.62,479.65,355.19,458.02,359.43,429.60);
   ctx.bezierCurveTo(355.44,399.10,321.38,396.63,316.3,428);
   ctx.bezierCurveTo(317.11,451.72,271.59,474.88,289.40,491.6);
   ctx.bezierCurveTo(322.60,477.97,303.77,533.49,282.8,539.5);
   ctx.bezierCurveTo(267.86,551.91,272.75,568.50,281.45,576.40);
   ctx.bezierCurveTo(263.30,602.52,272.01,639.11,257.1,663.30);
   ctx.bezierCurveTo(245.47,703.76,292.51,722.38,325.14,717.54);
   ctx.bezierCurveTo(331.16,717.42,337.17,717.05,343.20,717.2);
   ctx.closePath();
ctx.fill();
ctx.stroke();
   }
   
   drawLayer[17] = function(ctx) {
      ctx.beginPath();
   ctx.moveTo(344.7,714.5);
   ctx.bezierCurveTo(373.26,719.52,414.79,704.28,412.28,669.94);
   ctx.bezierCurveTo(396.91,641.30,375.75,614.96,386.96,581.5);
   ctx.bezierCurveTo(380.65,564.47,388.25,550.02,365.84,541.55);
   ctx.bezierCurveTo(334.75,522.42,346.96,485.73,378.87,481.18);
   ctx.bezierCurveTo(369.09,457.28,342.80,398.30,316.2,440.9);
   ctx.bezierCurveTo(299.17,460.21,286.10,491.77,323.09,493.2);
   ctx.bezierCurveTo(340.07,523.99,305.17,536.28,294.54,558.35);
   ctx.bezierCurveTo(328.33,567.70,282.39,583.32,301.88,601.39);
   ctx.bezierCurveTo(318.61,636.63,247.16,669.64,287.55,702.30);
   ctx.bezierCurveTo(304.14,713.69,325.26,714.48,344.69,714.50);
   ctx.closePath();
ctx.fill();
ctx.stroke();
   }
   
   drawLayer[18] = function(ctx) {
      ctx.beginPath();
   ctx.moveTo(340.5,502.1);
   ctx.bezierCurveTo(372.07,492.96,374.78,445.12,340.92,434.92);
   ctx.bezierCurveTo(298.43,436.71,295.59,490.73,340.5,502.1);
   ctx.closePath();
   ctx.moveTo(356.7,580.30);
   ctx.bezierCurveTo(324.60,596.98,327.62,562.54,356.7,580.30);
   ctx.closePath();
   ctx.moveTo(353.4,630.00);
   ctx.bezierCurveTo(383.19,633.62,415.27,673.26,381.67,693.92);
   ctx.bezierCurveTo(355.31,711.67,301.98,709.05,292.08,673.81);
   ctx.bezierCurveTo(291.42,645.47,326.26,619.20,353.4,630);
   ctx.closePath();
ctx.fill();
ctx.stroke();
   }
   
   drawLayer[19] = function(ctx) {
      ctx.beginPath();
   ctx.moveTo(365.5,648.9);
   ctx.bezierCurveTo(408.56,676.22,349.76,700.46,323.51,683.13);
   ctx.bezierCurveTo(285.54,663.63,344.00,631.99,365.5,648.9);
   ctx.closePath();
   ctx.moveTo(350.1,493.5);
   ctx.bezierCurveTo(388.89,462.64,321.38,414.10,312.40,466);
   ctx.bezierCurveTo(312.26,482.13,333.26,506.42,350.1,493.5);
   ctx.closePath();
ctx.fill();
ctx.stroke();
   }
   
   drawLayer[20] = function(ctx) {
   ctx.beginPath();
   ctx.moveTo(352.6,484.1);
   ctx.bezierCurveTo(379.83,447.45,299.62,447.83,327.82,484.47);
   ctx.bezierCurveTo(332.69,495.00,347.72,493.64,352.6,484.1);
   ctx.closePath();
ctx.fill();
ctx.stroke();
   }



// illo.offscreen = [];
for(let n = 0; n < drawLayer.length; n++) {
    illo.offscreen[n] = document.createElement('canvas');
}


prepScene();
prepFace();
drawScene();
// updateTagline();

window.addEventListener('scroll', handleScroll);
window.addEventListener('resize', handleResize);
// illo.addEventListener('click', handleClick);
