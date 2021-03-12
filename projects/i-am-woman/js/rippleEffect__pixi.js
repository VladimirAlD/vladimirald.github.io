// Set up the variables needed and loads the images to create the effect.
// Once the images are loaded the ‘setup’ function will be called.
// Aliases
let Application = PIXI.Application,
    // loader = PIXI.loader,
    // resources = PIXI.loader.resources,
    Sprite = PIXI.Sprite;
    Container = PIXI.Container;
    Filters = PIXI.filters;
let app = new Application({
  // width: window.innerWidth,
  // height: window.innerHeight,
  antialias: true,

  // autoDensity: true
  // transparent: true
});

// Add the canvas that Pixi automatically created for you to the HTML document
document.body.appendChild(app.view);

// load an image and run the `setup` function when it's done
app.loader
  .add("../imgs/jeremy-weber-DnzfCKjfaPc-unsplash.jpg")
  .add("../imgs/ripple.png")
  .load(setup);
  
// In the ‘setup’ function the displacement sprite is created
// that will create the effect and this is added to a displacement filter.
// It’s then set to move its anchor point to the centre of the image and positioned on the screen.

// Enable interaction events for the DisplayObject. 
// Touch, pointer and mouse events will not be emitted unless interactive is set to true.
app.stage.interactive = true;
let posX, displacementSprite, displacementFilter, bg, vx;
let container = new Container();
app.stage.addChild(container);

function setup() {
  posX = app.renderer.width / 2;
  displacementSprite = new Sprite(app.loader.resources["../imgs/ripple.png"].texture);
  displacementFilter = new Filters.DisplacementFilter(displacementSprite);
  // anchor shifts the origin point of the sprite's image texture, using a 0 to 1 normalized value
  displacementSprite.anchor.set(0.5);
  // Change the sprite's position -- sprite.position.set(x, y)
  displacementSprite.x = app.renderer.width / 2;
  displacementSprite.y = app.renderer.height / 2;
  // vx is used to set the sprite's speed and direction on the x axis (horizontally)
  vx = displacementSprite.x;

// To finish off the ‘setup’ function, the displacement filter scale is set and the background positioned.
// Notice the scale is ‘0’ for the displacement, that’s because it will be set to a height as soon as the mouse moves.

  app.stage.addChild(displacementSprite);
  container.filters = [displacementFilter];
  displacementFilter.scale.x = 0;
  displacementFilter.scale.y = 0;
  bg = new Sprite(app.loader.resources["../imgs/jeremy-weber-DnzfCKjfaPc-unsplash.jpg"].texture);
  bg.width = app.renderer.width;
  bg.height = app.renderer.height;
  bg.pivot.set(0.5);
  container.addChild(bg);
  // mousemove -- Fired when a pointer device (usually a mouse) is moved while over the display object
  // touchmove -- Fired when a touch point is moved along the display object
  app.stage.on('mousemove', onPointerMove).on('touchmove', onPointerMove);
  loop();
  }

// grab the position of the mouse on the x-axis whenever the mouse moves.

  function onPointerMove(eventData) {
      posX = eventData.data.global.x;
  }

// create a function that continually updates the screen. A velocity for the x-axis is worked out using the position of the mouse and the ripple.

  function loop() {
    // Call this `loop` function on the next screen refresh
    // (which happens 60 times per second)
    requestAnimationFrame(loop);
    vx += (posX - displacementSprite.x) * 0.045;
    displacementSprite.x = vx;
    let disp = Math.floor(posX - displacementSprite.x);
    if (disp < 0) disp = -disp;
    let fs = map(disp, 0, 500, 0, 120);
    disp = map(disp, 0, 500, 0.1, 0.6);
    displacementSprite.scale.x = disp;
    displacementFilter.scale.x = fs;
  }

// Finally, the map function is declared that maps value ranges to new values.


  map = function(n, start1, stop1, start2, stop2) {
      let newval = (n - start1) / (stop1 - start1) * (stop2 - start2) + start2;
      return newval;
  };