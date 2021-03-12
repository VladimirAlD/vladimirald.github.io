let mainNavLinks = document.querySelectorAll(".scroll-nav__item");

// This should probably be throttled.
// Especially because it triggers during smooth scrolling.
// https://lodash.com/docs/4.17.10#throttle
// You could do like...
// window.addEventListener("scroll", () => {
//    _.throttle(doThatStuff, 100);
// });
// Only not doing it here to keep this Pen dependency-free.

window.addEventListener("scroll", event => {
  let fromTop = window.scrollY;
  console.log("Start");
  mainNavLinks.forEach(link => {
    let section = document.querySelector(link.hash);

    if (
      section.offsetTop <= fromTop &&
      section.offsetTop + section.offsetHeight > fromTop
    ) {
      console.log("fromTop: " + fromTop);
      console.log("section.offsetTop: " + section.offsetTop);
      console.log("section.offsetHeight: " + section.offsetHeight);
      console.log(section.offsetTop <= fromTop &&
      section.offsetTop + section.offsetHeight > fromTop);
      console.log(link);
      console.log("______")
      link.classList.add("scroll-nav__item--active");
    } else {
      link.classList.remove("scroll-nav__item--active");
      console.log("False: " + link);
    }
    console.log("*****");
    console.log("fromTop: " + fromTop);
  });
  console.log("Stop");
});