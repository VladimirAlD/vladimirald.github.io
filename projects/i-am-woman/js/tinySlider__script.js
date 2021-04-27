const sliderIntro = tns({
  container: '.js__sliderIntro',
  items: 1,
  rewind: true,
  autoplay: true,
  autoplayHoverPause: true,
  autoplayButtonOutput: false,
  controls: true,
  prevButton: '.slider-intro__nav .js__prev',
  nextButton: '.slider-intro__nav .js__next',
  nav: false,
  mouseDrag: true,
  speed: 500,
  swipeAngle: 30,
  preventScrollOnTouch: 'auto'
})
const sliderMerch = tns({
  container: '.js__sliderMerch',
  items: 1,
  loop: false,
  autoplayButtonOutput: false,
  controls: true,
  prevButton: '.slider-merch__nav .js__prev',
  nextButton: '.slider-merch__nav .js__next',
  nav: false,
  mouseDrag: true,
  swipeAngle: 30,
  preventScrollOnTouch: 'auto',
  responsive: {
    764: {
      gutter: 20,
      items: 3
    },
    1180: {
      gutter: 30
    }
  },
})
const sliderBlog = tns({
  container: '.js__sliderBlog',
  items: 1,
  loop: false,
  autoplayButtonOutput: false,
  controls: false,
  nav: false,
  mouseDrag: true,
  swipeAngle: 30,
  preventScrollOnTouch: 'auto',
  responsive: {
    764: {
      gutter: 20,
      items: 2,
      center: true
    },
    1180: {
      items: 3,
      gutter: 30,
      center: true
    }
  }
})

var bg = document.querySelector('.js__bg-product');
var re = /url(.+)/;
sliderIntro.events.on('indexChanged', function(){
  var bgStyle = window.getComputedStyle(bg).backgroundImage;
  var slider = sliderIntro.getInfo();
  var currentIndex = parseInt(slider.index);
  var currentSlide = slider.slideItems[currentIndex];
  var currentImg = currentSlide.querySelector('.product__img').src;
  var newImg = 'url("' + currentImg + '")';
  var newBgStyle = bgStyle.replace(re, newImg);
  bg.style.backgroundImage = newBgStyle;
});