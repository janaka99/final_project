const fileInput1 = document.getElementById("admn-add-images1");
const fileInput2 = document.getElementById("admn-add-images2");
const fileInput3 = document.getElementById("admn-add-images3");

const removeIcon1 = document.getElementById("admn-remove-img-icon1");
const removeIcon2 = document.getElementById("admn-remove-img-icon2");
const removeIcon3 = document.getElementById("admn-remove-img-icon3");

const img1 = document.getElementById("adng-images-container-img-img1");
const img2 = document.getElementById("adng-images-container-img-img2");
const img3 = document.getElementById("adng-images-container-img-img3");

const imageContainer = document.getElementById("adng-images-container");
const images = document.getElementsByClassName("adng-images-container-img-img");
const uploadImages = document.getElementsByClassName("admn-add-images");
const removeIcon = document.getElementsByClassName("admn-remove-img-icon");

const title = document.getElementById("adng-title");
const description = document.getElementById("adng-description");
const price = document.getElementById("adng-price");

const maxImgCount = 5;
const gigImages = {
  img1: null,
  img2: null,
  img3: null,
};

//Add First image to portolfio
fileInput1.addEventListener("change", () => {
  console.log(fileInput1.files);
  if (gigImages.length >= 3) {
    console.log("Can not add More images ");
  } else {
    gigImages.img1 = fileInput1.files[0];
  }
  let reader = new FileReader();
  reader.readAsDataURL(fileInput1.files[0]);
  reader.addEventListener("load", () => {
    img1.src = reader.result;
  });
  removeIcon1.style.display = "block";
});

//Add second image to portolfio

fileInput2.addEventListener("change", () => {
  if (gigImages.length >= 3) {
    console.log("Can not add More images ");
  } else {
    gigImages.img2 = fileInput1.files[0];
  }
  let reader = new FileReader();
  reader.readAsDataURL(fileInput2.files[0]);
  reader.addEventListener("load", () => {
    img2.src = reader.result;
  });
  removeIcon2.style.display = "block";
});

// // //Add third image to portolfio

fileInput3.addEventListener("change", () => {
  if (gigImages.length >= 3) {
    console.log("Can not add More images ");
  } else {
    gigImages.img3 = fileInput1.files[0];
  }
  let reader = new FileReader();
  reader.readAsDataURL(fileInput3.files[0]);
  reader.addEventListener("load", () => {
    img3.src = reader.result;
  });
  removeIcon3.style.display = "block";
});

//Remove First image drom portolfio

removeIcon1.addEventListener("click", () => {
  img1.src =
    "https://images.unsplash.com/photo-1581388646048-3c04adad37b3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NDR8fGVtcHR5fGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60";

  removeIcon1.style.display = "none";
  gigImages.img1 = null;
});

//Remove second image from portolfio

removeIcon2.addEventListener("click", () => {
  img2.src =
    "https://images.unsplash.com/photo-1581388646048-3c04adad37b3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NDR8fGVtcHR5fGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60";

  removeIcon2.style.display = "none";
  gigImages.img2 = null;
});

// //Remove thirt image from portolfio

removeIcon3.addEventListener("click", () => {
  img3.src =
    "https://images.unsplash.com/photo-1581388646048-3c04adad37b3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NDR8fGVtcHR5fGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60";

  removeIcon3.style.display = "none";
  gigImages.img3 = fnull;
});
const errorcon = document.getElementById("adng-error-container");

function handleFormSubmit(event) {
  event.preventDefault();
  let error = false;
  errorcon.innerText = null;
  if (title.value == "" || description.value == "" || price.value == "") {
    errorcon.innerText = "All the fields must be fill";
    error = true;
  } else {
    if (Number(price.value) == NaN) {
      errorcon.innerText = "Price not valid";
    } else {
      const data = {
        title: title.value,
        description: description.value,
        price: price.value,
      };

      const gigImgs = [gigImages.img1, gigImages.img2, gigImages.img3];

      const formData = new FormData();
      formData.append("image", gigImages.img1);
      formData.append("image", gigImages.img2);
      formData.append("image", gigImages.img3);
      // formData.append("image", FileList);

      formData.append("data", JSON.stringify(data));

      fetch("http://localhost:3000/gig/add-new-gig", {
        method: "POST",
        body: formData,
      });
    }
  }
}
