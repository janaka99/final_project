const adminLayoutHeaderButton = document.getElementsByClassName(
  "admin-layout-header-btn"
);
const profileBox = document.getElementsByClassName(
  "admin-layout-header-content"
);
//show Admin Settings dropdown when clicked on the profile icon on the header

let clicked = false;
adminLayoutHeaderButton[0].addEventListener("click", () => {
  profileBox[0].classList.toggle("admin-layout-header-content-hide");
  clicked = true;
});

//Hide Admin Settings Dropdown when clicked away on the screen
document.addEventListener("click", (event) => {
  console.log(event.target);
  console.log("clicked");

  if (
    !profileBox[0].contains(event.target) &&
    !adminLayoutHeaderButton[0].contains(event.target)
  ) {
    if (clicked === true) {
      profileBox[0].classList.remove("admin-layout-header-content-hide");
    }
  }
});
