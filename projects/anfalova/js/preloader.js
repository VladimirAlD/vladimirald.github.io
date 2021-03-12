// window.addEventListener("load", function() {
//   const loader = this.document.querySelector(".preloader");
//   loader.className += " done";
// })

document.body.style.overflow = "hidden";
document.body.onload = function() {
  setTimeout(function (){
    var preloader = document.getElementById("js-preloader");
    if (!preloader.classList.contains("done")){
      preloader.classList.add("done");
    }
    document.body.style.overflow = "auto";
  }, 1000);
}

