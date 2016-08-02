"use strict";

var canvas = document.getElementById('canvas'),
	ctx = canvas.getContext('2d'),
	w = canvas.width = window.innerWidth,
	h = canvas.height = window.innerHeight,
	hue = 217,
	stars = [],
	count = 0,
	maxStars = 3000;
$( window ).resize(function() {
	w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
	console.log("tets");
});

// START CANVAS CACHED GRADIENT
var canvas2 = document.createElement('canvas');
var w2 = canvas2.width = 100;
var h2 = canvas2.height = 100;
var ctx2 = canvas2.getContext("2d");
// draw a big beefy gradient in the center of the dummy canvas
var gradientCache = ctx2.createRadialGradient(
        w2 / 2,
        h2 / 2,
        0,
        w2 / 2,
        h2 / 2,
        w2 / 2
);
gradientCache.addColorStop(0.075, '#fff');
gradientCache.addColorStop(0.1, 'hsl(' + hue + ', 61%, 33%)');
gradientCache.addColorStop(0.25, 'hsl(' + hue + ', 64%, 20%)');
gradientCache.addColorStop(1, 'transparent');
ctx2.fillStyle = gradientCache;
ctx2.beginPath();
ctx2.arc(w2 / 2, h2 / 2, w2 / 2, 0, Math.PI * 2);
ctx2.fill();
// END CANVAS CACHED GRADIENT

function random(min, max) {
	if (arguments.length < 2) {
		max = min;
		min = 0;
	}

	if (min > max) {
		var hold = max;
		max = min;
		min = hold;
	}

	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function maxOrbit(x,y) {
	var max = Math.max(x,y),
		diameter = Math.round(Math.sqrt(max*max + max*max));
	return diameter/2;
}

var Star = function() {
	this.orbitRadius = random(maxOrbit(w,h));
	this.radius = random(60, this.orbitRadius) / 10;
	this.orbitX = w / 2;
	this.orbitY = h / 2;
	this.timePassed = random(0, maxStars);
	this.speed = random(this.orbitRadius) / 30000;
	this.alpha = random(2, 10) / 10;

	count++;
	stars[count] = this;
}

Star.prototype.draw = function() {
	var x = Math.tan(this.timePassed) * this.orbitRadius + this.orbitX,
		y = Math.cos(this.timePassed) * this.orbitRadius + this.orbitY,
		twinkle = random(10);

	if (twinkle === 1 && this.alpha > 0) {
		this.alpha -= 0.05;
	} else if (twinkle === 2 && this.alpha < 1) {
		this.alpha += 0.05;
	}

	ctx.globalAlpha = this.alpha;
	// draw the cached gradient canvas image
	ctx.drawImage( canvas2, x - this.radius / 2, y - this.radius / 2, this.radius, this.radius );
	this.timePassed += this.speed;
}

for (var i = 0; i < maxStars; i++) {
	new Star();
}

function animation() {
	ctx.globalCompositeOperation = 'source-over';
	ctx.globalAlpha = 0.8;
	ctx.fillStyle = 'hsla(' + hue + ', 64%, 6%, 1)';
	ctx.fillRect(0, 0, w, h)

	ctx.globalCompositeOperation = 'lighter';
	for (var i = 1, l = stars.length; i < l; i++) {
		stars[i].draw();
	};
	window.requestAnimationFrame(animation);
}

animation();


$(function() {
  var native_width = 0;
  var native_height = 0;
  var mouse = {x: 0, y: 0};
  var magnify;
  var cur_img;

  var ui = {
    magniflier: $('.magniflier')
  };

  // Add the magnifying glass
  if (ui.magniflier.length) {
    var div = document.createElement('div');
    div.setAttribute('class', 'glass');
    ui.glass = $(div);

    $('body').append(div);
  }


  // All the magnifying will happen on "mousemove"

  var mouseMove = function(e) {
    var $el = $(this);

    // Container offset relative to document
    var magnify_offset = cur_img.offset();

    // Mouse position relative to container
    // pageX/pageY - container's offsetLeft/offetTop
    mouse.x = e.pageX - magnify_offset.left;
    mouse.y = e.pageY - magnify_offset.top;

    // The Magnifying glass should only show up when the mouse is inside
    // It is important to note that attaching mouseout and then hiding
    // the glass wont work cuz mouse will never be out due to the glass
    // being inside the parent and having a higher z-index (positioned above)
    if (
      mouse.x < cur_img.width() &&
      mouse.y < cur_img.height() &&
      mouse.x > 0 &&
      mouse.y > 0
      ) {

      magnify(e);
    }
    else {
      ui.glass.fadeOut(100);
    }

    return;
  };

  var magnify = function(e) {

    // The background position of div.glass will be
    // changed according to the position
    // of the mouse over the img.magniflier
    //
    // So we will get the ratio of the pixel
    // under the mouse with respect
    // to the image and use that to position the
    // large image inside the magnifying glass

    var rx = Math.round(mouse.x/cur_img.width()*native_width - ui.glass.width()/2)*-1;
    var ry = Math.round(mouse.y/cur_img.height()*native_height - ui.glass.height()/2)*-1;
    var bg_pos = rx + "px " + ry + "px";

    // Calculate pos for magnifying glass
    //
    // Easy Logic: Deduct half of width/height
    // from mouse pos.

    // var glass_left = mouse.x - ui.glass.width() / 2;
    // var glass_top  = mouse.y - ui.glass.height() / 2;
    var glass_left = e.pageX - ui.glass.width() / 2;
    var glass_top  = e.pageY - ui.glass.height() / 2;
    //console.log(glass_left, glass_top, bg_pos)
    // Now, if you hover on the image, you should
    // see the magnifying glass in action
    ui.glass.css({
      left: glass_left,
      top: glass_top,
      backgroundPosition: bg_pos
    });

    return;
  };

  $('.magniflier').on('mousemove', function() {
    ui.glass.fadeIn(100);

    cur_img = $(this);

    var large_img_loaded = cur_img.data('large-img-loaded');
    var src = cur_img.data('large') || cur_img.attr('src');

    // Set large-img-loaded to true
    // cur_img.data('large-img-loaded', true)

    if (src) {
      ui.glass.css({
        'background-image': 'url(' + src + ')',
        'background-repeat': 'no-repeat'
      });
    }

    // When the user hovers on the image, the script will first calculate
    // the native dimensions if they don't exist. Only after the native dimensions
    // are available, the script will show the zoomed version.
    //if(!native_width && !native_height) {

      if (!cur_img.data('native_width')) {
        // This will create a new image object with the same image as that in .small
        // We cannot directly get the dimensions from .small because of the
        // width specified to 200px in the html. To get the actual dimensions we have
        // created this image object.
        var image_object = new Image();

        image_object.onload = function() {
          // This code is wrapped in the .load function which is important.
          // width and height of the object would return 0 if accessed before
          // the image gets loaded.
          native_width = image_object.width;
          native_height = image_object.height;

          cur_img.data('native_width', native_width);
          cur_img.data('native_height', native_height);

          //console.log(native_width, native_height);

          mouseMove.apply(this, arguments);

          ui.glass.on('mousemove', mouseMove);
        };


        image_object.src = src;

        return;
      } else {

        native_width = cur_img.data('native_width');
        native_height = cur_img.data('native_height');
      }
    //}
    //console.log(native_width, native_height);

    mouseMove.apply(this, arguments);

    ui.glass.on('mousemove', mouseMove);
  });

  ui.glass.on('mouseout', function() {
    ui.glass.off('mousemove', mouseMove);
  });

});
