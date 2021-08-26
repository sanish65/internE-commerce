const util = require('util');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    if (req.url === '/addbrand' || req.url.includes('/brandlist/')) {
      const brnd = './public/files/brand';
      if (!fs.existsSync(brnd)) {
        fs.mkdirSync(brnd, {
          recursive: true
        });
      }
      callback(null, path.join(`${__dirname}/../public/files/brand`));
    } else if (req.url === '/addcategory' || req.url.includes('/categorylist/')) {
      const cat = './public/files/category';
      if (!fs.existsSync(cat)) {
        fs.mkdirSync(cat, {
          recursive: true
        });
      }
      callback(null, path.join(`${__dirname}/../public/files/category`));
    } else if (req.url === '/addBanner' || req.url.includes('/addBanner/')) {
      const cat = './public/files/banners';
      if (!fs.existsSync(cat)) {
        fs.mkdirSync(cat, {
          recursive: true
        });
      }
      callback(null, path.join(`${__dirname}/../public/files/banners`));
    } else if (req.url === '/addLogos') {
      const cat = './public/files/logos';
      if (!fs.existsSync(cat)) {
        fs.mkdirSync(cat, {
          recursive: true
        });
      }
      callback(null, path.join(`${__dirname}/../public/files/logos`));
    } else {
      const invty = './public/files/inventory';
      if (!fs.existsSync(invty)) {
        fs.mkdirSync(invty, {
          recursive: true
        });
      }
      callback(null, path.join(`${__dirname}/../public/files/inventory`));
    }
  },
  filename: (req, file, callback) => {
    const match = ['image/png', 'image/jpeg', 'image/jpg'];

    if (match.indexOf(file.mimetype) === -1) {
      console.log(req.url);
      // const message = `<strong>${file.originalname}</strong> is invalid. Only accept png/jpeg.`;
      // return callback(message, null);
    }

    const filename = `${Date.now()}-xinney-${file.originalname}`;
    callback(null, filename);
  },
});

const uploadFiles = multer({ storage }).array('multi-files', 10);
const uploadFilesMiddleware = util.promisify(uploadFiles);
module.exports = uploadFilesMiddleware;
