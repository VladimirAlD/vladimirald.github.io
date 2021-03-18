document.addEventListener('DOMContentLoaded', function(){
  let sliderIntro = document.querySelector('.js__slider-intro');
  let sliderBlog = document.querySelector('.js__slider-blog');
  let sliderMerch = document.querySelector('.js__slider-merch');

  function handleEvent(e) {
    let count = document.querySelector('.js__countProd');
    let current = document.querySelector('.js__slide.active');
    let image = current.querySelector('img').getAttribute('src');
    let bgImage = document.querySelector('.js__bg-product');
    count.innerHTML = current.dataset.indexNumber;
    bgImage.style.setProperty('--product', "url(\"." + image + "\")");
  }
  
  sliderIntro.addEventListener('after.lory.slide', handleEvent);
  
  // init the slider
  let lorySlider = lory(sliderIntro, {
    slidesToScroll: 1,
    // infinite: 1,
    rewind: true,
    enableMouseEvents: false,
    slideSpeed: 500,
    classNameFrame: 'js__frame',
    classNameSlideContainer: 'js__slides',
    classNamePrevCtrl: 'js__prev',
    classNameNextCtrl: 'js__next'
  })

  let lorySliderTwo = lory(sliderBlog, {
    slidesToScroll: 1,
    // infinite: 1,
    rewind: true,
    enableMouseEvents: true,
    slideSpeed: 500,
    classNameFrame: 'js__frame',
    classNameSlideContainer: 'js__slides',
    classNamePrevCtrl: 'js__prev',
    classNameNextCtrl: 'js__next'
  })

  let lorySliderThree = lory(sliderMerch, {
    slidesToScroll: 1,
    // infinite: 1,
    rewind: true,
    enableMouseEvents: true,
    slideSpeed: 500,
    classNameFrame: 'js__frame',
    classNameSlideContainer: 'js__slides',
    classNamePrevCtrl: 'js__prev',
    classNameNextCtrl: 'js__next'
  })

  // animation

  let stop = false;
  let fps, fpsInterval, startTime, now, then, elapsed;

  // begin animation (autoplay)
  function startAnimating(fps) {
    fpsInterval = 1000 / fps;
    then = Date.now();
    startTime = then;
    animate();
  };

  function animate() {
    requestAnimationFrame(animate);

    now = Date.now();
    elapsed = now - then;

    if ((elapsed > fpsInterval) && !stop) {
      then = now - (elapsed % fpsInterval);
      lorySlider.next();
    };
  };

  // reset timer
  function resetTimer() {
    now = Date.now();
    elapsed = now - then;
    then = now - (elapsed % fpsInterval);
  }

  // start the animation process with seed time
  startAnimating(.2); // every five seconds

  // mouseover 
  sliderIntro.addEventListener('mouseover', function(e) {
    stop = true;
  }); 
  
  // mouseout
  sliderIntro.addEventListener('mouseout', function(e) {
    resetTimer();
    stop = false;
  });
});