var button = document.querySelectorAll(".b");
var icon = document.querySelectorAll(".icon");

//Navbar
var nav = document.querySelector(".nav");
var icon = document.querySelector("#icon");
var iconid = document.querySelector("#iconid");

icon.addEventListener("click", function () {
  if (nav.style.transform == "translateY(-100px)") {
    nav.style.transform = "translateY(0px)";
    iconid.className = "fa fa-arrow-up";
  } else {
    nav.style.transform = "translateY(-100px)";
    iconid.className = "fa fa-arrow-down";
  }
});
