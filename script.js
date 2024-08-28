const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv')
dotenv.config();


cloudinary.config({
  url: process.env.CLOUDINARY_URL
})
// Handle upload and generate URL
cloudinary.uploader.upload(userUploadedImage)
  .then(result => {
    const imageUrl = cloudinary.image(result.public_id, {
      width: 600,
      height: 600,
      crop: "pad",
      format: "auto",
      quality:"auto"
    }).src;
    // Use imageUrl in your application
  })
  .catch(error => console.error(error));

//This code uploads the image, applies transformations, and generates a URL for the converted image.