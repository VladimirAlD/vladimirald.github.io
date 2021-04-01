(function(){
  var inner_w = window.innerWidth;
  var inner_h = window.innerHeight;
  var outer_w = window.outerWidth;
  var outer_h = window.outerHeight;
  var client_w = document.documentElement.clientWidth;
  var client_h = document.documentElement.clientHeight;
  var width = document.querySelector('#width');
  width.style.fontSize = '3rem';
  width.innerHTML = 
    `outer:${outer_w}/${outer_h} <br> inner: ${inner_w}/${inner_h} <br> client: ${client_w}/${client_h}`
  ;  
}());