const serviceCard = document.getElementsByClassName("service-card");
const sericeCardImage = document.getElementsByClassName("service-class-img");
const leftClick = document.getElementsByClassName("leftClick");
const rightClick = document.getElementsByClassName("rightClick");
const card = document.getElementsByClassName("card");
const cardg = document.getElementsByClassName("cards-grid");

function addEffectsToServiceCards() {
  for (let i = 0; i < sericeCardImage.length; i++) {
    serviceCard[i].addEventListener("mouseover", () => {
      sericeCardImage[i].classList.add("service-card-hover");
    });
    serviceCard[i].addEventListener("mouseout", () => {
      sericeCardImage[i].classList.remove("service-card-hover");
    });
  }
}
addEffectsToServiceCards();

let serviceCardWidth1 = 0;
let leftClickCount = 0;
let rightClickCount = 0;
let count = 4;
rightClick[0].addEventListener("click", () => {
  const innerW = window.innerWidth;
  if (innerW <= 568) {
    count = 7;
  } else if (innerW <= 1024) {
    count = 6;
  }
  if (rightClickCount >= count) {
    return false;
  } else {
    serviceCardWidth1 = serviceCardWidth1 - 25;
    rightClickCount++;
    leftClickCount++;
    cardg[0].style.transform = `translateX(calc(${serviceCardWidth1}% / 2)`;
    cardg[0].style.transition = "all 0.5s ease-in-out";
  }
});
leftClick[0].addEventListener("click", () => {
  if (leftClickCount <= 0) {
    return false;
  } else {
    serviceCardWidth1 = serviceCardWidth1 + 25;
    rightClickCount--;
    leftClickCount--;
    cardg[0].style.transform = `translateX(calc(${serviceCardWidth1}% / 2)`;
    cardg[0].style.transition = "all 0.5s ease-in-out";
  }
});
