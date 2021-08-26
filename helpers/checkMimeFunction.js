const checkMimeFunction = (req) => {
  console.log('inside checkmime function');
  let flag = 0;
  let fileType = '';
  const match = ['png', 'jpeg', 'jpg'];
  for (let i = 0; i < req.files.length; i++) {
    console.log(req.files[i].filename);
    const filetype = req.files[i].filename.split('.')[1];
    if (match.indexOf(filetype) === -1) {
      flag = 1;
      fileType = filetype;
      break;
    }
  }
  return { flag, fileType };
};

module.exports = checkMimeFunction;
