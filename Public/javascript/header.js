const burger = document.getElementsByClassName("header-burger");
const navigation = document.getElementsByClassName("header-navigation");
navigation[0].classList.remove("header-show");
burger[0].addEventListener("click", () => {
  navigation[0].classList.toggle("header-show");
});
