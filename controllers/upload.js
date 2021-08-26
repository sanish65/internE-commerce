const upload = require('../lib/upload');

const multipleUpload = async (req, res, next) => {
  try {
    console.log('***Checking image files***');
    console.log(req.files);

    await upload(req, res);
    for (let i = 0; i < req.files.length; i++) {
      console.log(req.files[i]);
    }
    return next();
  } catch (error) {
    console.log(error);

    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.send('Too many files to upload.');
    }
    return res.send(`Error when trying upload many files: ${error}`);
  }
};

module.exports = {
  multipleUpload,
};
