const mainImage = document.querySelector("#dgig-rating-profile-img");
const images = document.getElementsByClassName("dgig-rating-profile-imges");
mainImage.src = images[0].src;
for (let i = 0; i < images.length; i++) {
  images[i].addEventListener("click", () => {
    mainImage.src = images[i].src;
  });
}
