const cloudinary = require('cloudinary').v2;

cloudinary.config({ 
    cloud_name: 'ds0j7y0xb', 
    api_key: '877572888774593', 
    api_secret: 'hvIchf_R3qgf763R0li6il7vvPI'
  });

  const opts = {
    overwrite: true,
    invalidate: true,
    resource_type: "auto",
  };

module.exports = (image) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload(image, opts, (error, result) => {
            if(result && result.secure_url) {
                return resolve(result.secure_url)
            }
            console.log(error.message)
            return reject({message: error.message})
        })
    })
}