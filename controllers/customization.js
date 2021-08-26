const fs = require('fs');
const Banner = require('../models/Banner');
const Cache = require('../models/cache');
const Logo = require('../models/Logo');

function checkMimeFunction(req) {
  let flag = 0;
  let fileType = '';
  const match = ['png', 'jpeg', 'jpg'];
  for (let i = 0; i < req.files.length; i++) {
    const filetype = req.files[i].filename.split('.')[1];
    if (match.indexOf(filetype) === -1) {
      flag = 1;
      fileType = filetype;
      break;
    }
  }
  const funcobj = { flag, fileType };
  return funcobj;
}

exports.getAddBanner = (req, res) => {
  res.render('dynamic/banner', {
    title: 'Add Banner'
  });
};

exports.postLogos = (req, res) => {
  const checkmimereturn = checkMimeFunction(req);
  const flg = checkmimereturn.flag;
  const fltype = checkmimereturn.fileType;

  const fullPath = [];
  for (let i = 0; i < req.files.length; i++) {
    const href = {};
    href.path = `/files/logos/${req.files[i].filename}`;
    fullPath.push(href);
  }

  const document = new Logo({
    photos: fullPath
  });

  if (req.files.length > 1) {
    req.flash('errors', {
      msg: 'Only one logo is to be choosen',
    });
    res.redirect('addbanner');
  } else if (flg === 1) {
    req.flash('errors', {
      msg:
        `Sorry, we dont accept .${fltype} file format`,
    });
    res.redirect('addbanner');
  } else {
    document.save((error) => {
      if (error) {
        console.log(error);
        req.flash('errors', {
          msg:
            'Logo could not be submitted. Please fill out correct information',
        });
        res.redirect('addbanner');
      } else {
        req.flash('success', { msg: 'Logo is sucessfully added' });
        res.redirect('addbanner');
      }
    });
  }
};

exports.postAddBanner = (req, res) => {
  const checkmimereturn = checkMimeFunction(req);
  const flg = checkmimereturn.flag;
  const fltype = checkmimereturn.fileType;

  if (req.params.id) {
    Banner.findById(req.params.id, (err, banner) => {
      const fullPath = [];
      if (req.files.length) {
        for (let i = 0; i < req.files.length; i++) {
          const href = {};
          href.path = `/files/banners/${req.files[i].filename}`;
          fullPath.push(href);
        }
      } else {
        for (let i = 0; i < banner.photos.length; i++) {
          const href = {};
          href.path = banner.photos[i].path;
          fullPath.push(href);
        }
      }
      banner.name = req.body.name;
      banner.subname = req.body.subname;
      banner.photos = fullPath;

      if (req.files.length && req.files.length < 3) {
        req.flash('errors', {
          msg: 'Image is a mandatory,please select atleast 3 images',
        });
        res.redirect(`/customization/editbanner/${banner._id}`);
      } else if (flg === 1) {
        req.flash('errors', {
          msg:
              `Sorry, we dont accept .${fltype} file format`,
        });
        res.redirect(`/customization/editbanner/${banner._id}`);
      } else {
        banner.save((error, result) => {
          if (error) {
            console.log(error);
            req.flash('errors', {
              msg:
                  'Banner could not be submitted. Please fill out correct information',
            });
            res.redirect(`/customization/editbanner/${banner._id}`);
          } else {
            req.flash('success', { msg: 'Banner is sucessfully updated' });
            res.redirect(`/customization/editbanner/${banner._id}`);
          }
        });
      }
    });
  } else {
    const fullPath = [];
    for (let i = 0; i < req.files.length; i++) {
      const href = {};
      href.path = `/files/banners/${req.files[i].filename}`;
      fullPath.push(href);
    }

    const document = new Banner({
      name: req.body.name,
      subname: req.body.subname,
      photos: fullPath
    });

    if (req.files.length < 3) {
      req.flash('errors', {
        msg: 'Image is a mandatory,please select atleast 3 images',
      });
      res.redirect('addbanner');
    } else if (flg === 1) {
      req.flash('errors', {
        msg:
          `Sorry, we dont accept .${fltype} file format`,
      });
      res.redirect('addbanner');
    } else {
      document.save((error) => {
        if (error) {
          console.log(error);
          req.flash('errors', {
            msg:
              'Banner could not be submitted. Please fill out correct information',
          });
          res.redirect('addbanner');
        } else {
          req.flash('success', { msg: 'Banner is sucessfully added' });
          console.log('Is this running');
          res.redirect('addbanner');
        }
      });
    }
  }
};

exports.getListBanner = (req, res) => {
  let name;
  let subname;
  let logos = '';
  Cache.find({}, (err, cache) => {
    if (err) {
      console.log(err);
      res.redirect('/customization/listbanner');
    }
    if (cache.length !== 0) {
      name = cache[0].name;
      subname = cache[0].subname;
      logos = cache[0].logos;
    }

    Banner.find({}, (err, result) => {
      if (err) console.log(err);

      const displayset = [];
      for (let i = 0; i < result.length; i++) {
        const href = {};
        if (name === result[i].name && subname === result[i].subname) {
          href.match = 'matched';
        }
        href._id = result[i]._id;
        href.sn = i + 1;
        href.name = result[i].name;
        href.subname = result[i].subname;
        displayset.push(href);
      }
      Logo.find({}, (err, logo) => {
        if (err) console.log(err);

        const logoset = [];
        for (let i = 0; i < logo.length; i++) {
          const href = {};
          if (cache.length !== 0 && logos[0].path === logo[i].photos[0].path) {
            href.match = 'matched';
          }
          href._id = logo[i]._id;
          href.sn = i + 1;
          href.photos = logo[i].photos;
          logoset.push(href);
        }
        console.log('Checking logoset');
        console.log(logoset);
        console.log('Checking displayset');
        console.log(displayset);
        res.render('dynamic/editDisplay', { displayset, logoset });
      });
    });
  }).sort({ _id: -1 }).limit(1);
};

exports.getEditBanner = (req, res) => {
  Banner.findById(req.params.id, (err, result) => {
    if (err) console.log(err);
    res.render('dynamic/editbanner', {
      banner: result,
    });
  });
};

exports.getBannerUse = (req, res) => {
  let cachelen;
  Cache.find({}, (err, cacheresult) => {
    if (err) {
      req.flash('console.error();', { msg: 'sorry unable to find your request' });
      res.render('dynamic/listbanner');
    }
    cachelen = cacheresult.length;
    if (cachelen === 0) {
      Logo.find({}, (err, logo) => {
        if (err) {
          console.log(err);
          req.flash('console.error();', { msg: 'sorry unable to find your request' });
          res.render('dynamic/addbanner');
        } else {
          Banner.find({}, (err, banner) => {
            if (err) {
              console.log(err);
              req.flash('console.error();', { msg: 'sorry unable to find your request' });
              res.render('dynamic/addbanner');
            } else {
              if (req.url.includes('/usebanner/')) {
                let pathToLogo = [];
                let logohref = {};
                logohref.path = '/uploaded_logo.png';
                pathToLogo.push(logohref);               
                const document = new Cache({
                  name: banner.length > 0 ? banner[0].name : 'On Demand',
                  subname: banner.length > 0 ? banner[0].subname : 'Authentic Cosmetics products from us',
                  banners: banner[0].photos,
                  logos: logo.length > 0 ? logo[0].photos : pathToLogo,
                });

                document.save((err) => {
                  if (err) {
                    console.log(err);
                    req.flash('console.error();', { msg: 'sorry unable to find your request' });
                    res.render('dynamic/addbanner');
                  } else {
                    req.flash('success', { msg: 'Banner is set sucessfully' });
                    res.redirect('/customization/listbanner');
                  }
                });
            }
            else{
                let pathToImage = [];
                let href1 = {};
                let href2 = {};
                let href3 = {};
                href1.path = '/bg-image-1.jpg';
                href2.path = '/bg-image-2.jpg';
                href3.path = '/bg-image-3.jpg';
                pathToImage.push(href1); 
                pathToImage.push(href2);       
                pathToImage.push(href3);       
                const src = `public${logo[0].photos[0].path}`;

                fs.readFile(src, (err, data) => {
                  if (err) throw err;
                  fs.writeFile('public/uploaded_logo.png', data, 'base64', (err) => {
                    if (err) throw err;
                    console.log('It\'s saved!');
                  });
                });
  
                const document = new Cache({
                  name: banner.length > 0 ? banner[0].name : 'On Demand',
                  subname: banner.length > 0 ? banner[0].subname : 'Authentic Cosmetics products from us',
                  banners: banner.length > 0 ? banner[0].photos : pathToImage,
                  logos: logo[0].photos,
                });
                  document.save((err) => {
                  if (err) {
                    console.log(err);
                    req.flash('console.error();', { msg: 'sorry unable to find your request' });
                    res.render('dynamic/addbanner');
                  } else {
                    req.flash('success', { msg: 'Banner is set sucessfully' });
                    res.redirect('/customization/listbanner');
                  }
                });
              
            }
          }
          }).sort({ _id: -1 }).limit(1);
        }
      }).sort({ _id: -1 }).limit(1);
    } else {
      Cache.find({}, (err, cache) => {
        if (err) {
          console.log(err);
        } else {
          const id = cache[0]._id;
          if (req.url.includes('/usebanner/')) {
            Banner.findById(req.params.id, (err, banner) => {
              if (err) {
                console.log(err);
              }
              const newvalues = {
                $set:
             {
               name: banner.name,
               subname: banner.subname,
               banners: banner.photos,
             }
              };
              Cache.findByIdAndUpdate(id, newvalues, (err, result) => {
                if (err) {
                  console.log(err);
                } else {
                  req.flash('success', { msg: 'Banner is set sucessfully' });
                  res.redirect('/customization/listbanner');
                }
              });
            });
          } else {
            Logo.findById(req.params.id, (err, logo) => {
              if (err) {
                console.log(err);
              }

              if (fs.existsSync('public/files/logos/1622641122554-xinney-logo-white.png')) {
                console.log('The file exists.');
              } else {
                console.log('The file does not exist.');
              }
              const src = `public${logo.photos[0].path}`;

              fs.readFile(src, (err, data) => {
                if (err) throw err;
                fs.writeFile('public/uploaded_logo.png', data, 'base64', (err) => {
                  if (err) throw err;
                  console.log('It\'s saved!');
                });
              });

              const newvalues = {
                $set:
             {
               logos: logo.photos,
             }
              };
              Cache.findByIdAndUpdate(id, newvalues, (err, result) => {
                if (err) {
                  console.log(err);
                } else {
                  req.flash('success', { msg: 'Logo is set sucessfully' });
                  res.redirect('/customization/listbanner');
                }
              });
            });
          }
        }
      }).limit(1);
    }
  });
};
