var countbarTrack = document.querySelector('.countbar__track');
var countbarThumb = document.querySelector('.countbar__thumb');
var sliderLenght = sliderBlog.getInfo().slideCount;

function calcOffset(currentSlide){
  var trackStyle = window.getComputedStyle(countbarTrack);
  var thumbStyle = window.getComputedStyle(countbarThumb);

  var trackWidth = parseFloat(trackStyle.width);
  var thumbWidth = parseFloat(thumbStyle.width);

  var sliderOffset = (trackWidth - thumbWidth) / (sliderLenght - 1);
  
  countbarThumb.style.left = (currentSlide * sliderOffset) + 'px';
}

sliderBlog.events.on('indexChanged', function(){
  var currentSlide = parseInt(sliderBlog.getInfo().index);
  calcOffset(currentSlide);
  if (currentSlide < 10) {
    document.querySelector('.js__countCurrent').innerHTML = '0' + (currentSlide + 1);
  } else {
    document.querySelector('.js__countCurrent').innerHTML = currentSlide;
  }
})

window.addEventListener('resize', function() {
  var currentSlide = parseInt(sliderBlog.getInfo().index);
  calcOffset(currentSlide);
})


sliderIntro.events.on('indexChanged', function(){
  var currentSlide = parseInt(sliderIntro.getInfo().index);
  if (currentSlide < 10) {
    document.querySelector('.js__countProd').innerHTML = '0' + (currentSlide + 1);
  } else {
    document.querySelector('.js__countProd').innerHTML = currentSlide;
  }
})

