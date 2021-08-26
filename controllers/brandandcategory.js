const fs = require('fs');
const path = require('path');
const Brand = require('../models/Brand');
const Category = require('../models/Category');
const {
  fileRead, categoryDisplayer, checkUncheckAssignment, categoryFileWriteAndBackup, assignParentsForCategory
} = require('../helpers/readcategoryfile');
const checkMimeFunction = require('../helpers/checkMimeFunction');

exports.getBrand = (_req, res) => {
  res.render('brand', {
    title: 'Brand',
  });
};

exports.getAddBrandForm = (_req, res) => {
  res.render('brandandcategory/addbrand', {
    title: 'Add Brand',
  });
};

exports.getEditBrand = (req, res) => {
  Brand.findById(req.params.id, (_err, brand) => {
    res.render('brandandcategory/editbrand', { brand });
  });
};

exports.getAddCategoryForm = (_req, res) => {
  const appDir = path.dirname(require.main.filename);
  const filePath = `${appDir}/helpers/categories/category.config`;
  fs.readFile(filePath, 'utf8', (_err, categories) => {
    const data = JSON.parse(categories);
    const displayCategory = {};
    const idNameCarrier = {};
    const rootCategories = data['1:default'];
    categoryDisplayer(rootCategories, idNameCarrier);
    displayCategory.default = rootCategories;
    displayCategory.idnames = idNameCarrier;
    res.render('brandandcategory/addcategory', {
      display_categories: displayCategory,
    });
  });
};

exports.getEditCategory = (req, res) => {
  const displayCategory = {};
  Category.findById(req.params.id, (_err, category) => {
    const categoriesFromFile = fileRead();
    const rootCategories = categoriesFromFile['1:default'];
    const idNameCarrier = {};
    displayCategory.name = category.name;
    displayCategory.slug = category.slug;
    displayCategory.shortdesc = category.shortdesc;
    displayCategory.description = category.description;
    displayCategory.caption = category.caption;
    displayCategory.caption1 = category.caption1;

    displayCategory.banner = category.banner;
    displayCategory.thumbnail = category.thumbnail;

    const { parents } = category;
    const parentsHref = {};
    for (let i = 0; i < parents.length; i++) {
      parentsHref[parents[i]] = 1;
    }

    const checker = {};
    checkUncheckAssignment(rootCategories, parentsHref, idNameCarrier, checker);
    displayCategory.default = rootCategories;
    displayCategory.idnames = idNameCarrier;
    displayCategory.checker = checker;
    res.render('brandandcategory/editcategory', {
      display_categories: displayCategory,
    });
  });
};

exports.getBrandsList = (_req, res) => {
  Brand.find({}, (err, result) => {
    if (err) throw err;
    const displaySet = [];
    for (let i = 0; i < result.length; i++) {
      const href = {};
      href.id = result[i]._id;
      href.count = i + 1; // Just to start number with 1;
      href.name = result[i].name;
      href.slug = result[i].slug;
      href.type = result[i].type;
      href.country = result[i].country;
      displaySet.push(href);
    }

    res.render('brandandcategory/brandlist', { brands: displaySet });
  });
};

exports.getCategoryList = (_req, res) => {
  Category.find({}, (err, result) => {
    if (err) throw err;
    const displaySet = [];
    for (let i = 0; i < result.length; i++) {
      const href = {};
      href.id = result[i]._id;
      href.count = i + 1; // Just to start number with 1;
      href.name = result[i].name;
      href.slug = result[i].slug;
      href.description = result[i].description;
      href.parents = result[i].parents;
      displaySet.push(href);
    }

    res.render('brandandcategory/categorylist', { categories: displaySet });
  });
};

exports.postBrandForm = (req, res, next) => {
  if (req.params.id) {
    Brand.findById(req.params.id, (_err, brand) => {
      const fullPath = [];
      const fullPath1 = [];

      if (!req.files.length) {
        fullPath.push({
          path: brand.banner[0].path
        });

        fullPath1.push({
          path: brand.thumbnail[0].path
        });
      } else {
        fullPath.push({
          path: `/files/brand/${req.files[0].filename}`
        });

        fullPath1.push({
          path: `/files/brand/${req.files[1].filename}`
        });
      }

      const {
        name, slug, btype, website, shortdesc, description, caption, caption1
      } = req.body;

      brand.name = name;
      brand.slug = slug;
      brand.type = btype;
      brand.website = website;
      brand.shortdesc = shortdesc;
      brand.description = description;
      brand.country = description;
      brand.caption = caption;
      brand.caption1 = caption1;
      brand.banner = fullPath;
      brand.thumbnail = fullPath1;

      const { flag, fileType } = checkMimeFunction(req);
      if (req.files && flag === 1) {
        req.flash('errors', {
          msg: `Sorry, we dont accept .${fileType} file format`,
        });
        res.redirect(brand.id);
      } else {
        brand.save((err) => {
          if (err) {
            console.log(err);
            req.flash('errors', { msg: 'Brand could not be submitted' });
            res.redirect(brand.id);
          } else {
            req.flash('success', { msg: 'Brand is sucessfully edited' });
            res.redirect(brand._id);
          }
        });
      }
    });
  } else {
    const fullPath = [];
    const href = {};
    href.path = `/files/brand/${req.files[0].filename}`;
    fullPath.push(href);

    const fullPath1 = [];
    href.path = `/files/brand/${req.files[1].filename}`;
    fullPath1.push(href);

    const {
      name, slug, btype, website, shortdesc, description, country, caption, caption1
    } = req.body;

    const brandInstance = new Brand({
      name,
      slug,
      type: btype,
      website,
      shortdesc,
      description,
      country,
      caption,
      caption1,
      banner: fullPath,
      thumbnail: fullPath1,
    });

    const { flag, fileType } = checkMimeFunction(req);
    if (req.files && flag === 1) {
      req.flash('errors', {
        msg: `Sorry, we dont accept .${fileType} file format`,
      });
      res.redirect('addbrand');
    } else {
      brandInstance.save((err) => {
        if (err) {
          console.log(err);
          req.flash('errors', {
            msg:
              'Brand Could not be submitted. Please fill out correct information',
          });
          res.redirect('addbrand');
        } else {
          req.flash('success', { msg: 'Brand was successfully submitted' });
          res.redirect('addbrand');
        }
      });
    }
  }
};

exports.postAddCategoryForm = (req, res) => {
  if (req.params.id) {
    Category.findById(req.params.id, (err, category) => {
      const fullPath = [];
      const fullPath1 = [];
      if (!req.files.length) {
        fullPath.push({
          path: category.banner[0].path
        });

        fullPath1.push({
          path: category.thumbnail[0].path
        });
      } else {
        fullPath.push({
          path: `/files/category/${req.files[0].filename}`
        });

        fullPath1.push({
          path: `/files/category/${req.files[1].filename}`
        });
      }

      const {
        name, slug, shortdesc, description, caption
      } = req.body;
      category.name = name;
      category.slug = slug;
      category.shortdesc = shortdesc;
      category.description = description;
      category.caption = caption;
      category.banner = fullPath;
      category.thumbnail = fullPath1;

      const { flag, fileType } = checkMimeFunction(req);
      if (flag === 1) {
        req.flash('errors', {
          msg: `Sorry, we dont accept .${fileType} file format`,
        });
        res.redirect(req.params.id);
      } else {
        category.save((err) => {
          if (err) {
            res.redirect(req.params.id);
          } else {
            req.flash('success', { msg: 'Category is sucessfully edited' });
            res.redirect(req.params.id);
          }
        });
      }
    });
  } else {
    var appDir = path.dirname(require.main.filename);
    var filePath = `${appDir}/helpers/categories/category.config`;
    var fileCategories = {};
    fs.readFile(filePath, 'utf8', (err, categories) => {
      const parents = {};
      fileCategories = JSON.parse(categories);
      const reqCategoriesIdsNames = req.body.category_ids_names;
      const categoryForDb = [];


      // if (Array.isArray(reqCategoriesIdsNames)) {
      //   for (let i = 0; i < reqCategoriesIdsNames.length; i++) {
      //     const reqCatIdName = reqCategoriesIdsNames[i];
      //     parents[reqCatIdName] = 1;
      //     categoryForDb.push(reqCatIdName);
      //   }
      // } else if (!reqCategoriesIdsNames) {
      //   console.log("no category has been clicked here");
      //   parents['1:default'] = 1;
      // } else {
      //   const reqCatIdName = reqCategoriesIdsNames;
      //   parents[reqCatIdName] = 1;
      //   categoryForDb.push(reqCatIdName);
      // }
      if (Array.isArray(reqCategoriesIdsNames)) {
        for (var i = 0; i < reqCategoriesIdsNames.length; i++) {
          var reqCatIdName = reqCategoriesIdsNames[i];
          parents[reqCatIdName] = 1;
          categoryForDb.push(reqCatIdName);
        }
      } else {
        if (!reqCategoriesIdsNames) {
          categoryForDb.push(reqCatIdName);
          parents["1:default"] = 1;
        } else {
          var reqCatIdName = reqCategoriesIdsNames;
          parents[reqCatIdName] = 1;
          categoryForDb.push(reqCatIdName);
        }
      }




      const fullPath = [];
      const href = {};
      href.path = `/files/category/${req.files[0].filename}`;
      fullPath.push(href);

      const fullPath1 = [];
      href.path = `/files/category/${req.files[1].filename}`;
      fullPath1.push(href);

      const {
        name, slug, shortdesc, description, caption, caption1
      } = req.body;
      const categoryInstance = new Category({
        name,
        slug,
        shortdesc,
        description,
        parents: categoryForDb,
        caption,
        caption1,
        banner: fullPath,
        thumbnail: fullPath1,
      });

      const { flag, fileType } = checkMimeFunction(req);
      if (flag === 1) {
        req.flash('errors', {
          msg: `Sorry, we dont accept .${fileType} file format`,
        });
        res.redirect('addcategory');
      } else {
        categoryInstance.save((err, data) => {
          if (err) {
            console.log(err);
            req.flash('errors', {
              msg: 'Category Could not be submitted. Please fill out correct information',
            });
            res.redirect('addcategory');
          } else {
            const newCatIdName = `${data._id}:${req.body.name}`;
            assignParentsForCategory(fileCategories, parents, newCatIdName);
            categoryFileWriteAndBackup(filePath, fileCategories);
            req.flash('success', { msg: 'Category was successfully submitted' });
            res.redirect('addcategory');
          }
        });
      }
    });
  }
};
