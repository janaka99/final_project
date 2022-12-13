const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "janaka99",
  api_key: "966164626663286",
  api_secret: "o-1ooBQbdutknS9MMzuWeOTf08M",
});

// exports.uploads = (file, folder) => {
//   return new Promise((resolve) => {
//     cloudinary.uploader.upload(
//       file,
//       (result) => {
//         resolve({
//           url: result.url,
//           id: result.public_id,
//         });
//       },
//       {
//         resource_type: "auto",
//         folder: folder,
//       }
//     );
//   });
// };

module.exports = cloudinary;
