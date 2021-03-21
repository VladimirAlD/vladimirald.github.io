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