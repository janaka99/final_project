const burger = document.getElementsByClassName("burger");
const navigation = document.getElementsByClassName("navigation");
navigation[0].classList.remove("show");
burger[0].addEventListener("click", () => {
  navigation[0].classList.toggle("show");
});
