document.getElementById('close').addEventListener('click', function(e) {
  e.preventDefault();
  document.querySelector('.navlist--header').style.display = 'none';
  document.querySelector('html').style.overflowY = 'scroll'
}, false);

document.getElementById('open').addEventListener('click', function(e) {
  e.preventDefault();
  document.querySelector('.navlist--header').style.display = 'block';
  document.querySelector('html').style.overflowY = 'hidden'
}, false); 