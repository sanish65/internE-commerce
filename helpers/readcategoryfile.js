const fs = require('fs');
const path = require('path');

const appDir = path.dirname(require.main.filename);
const filePath = `${appDir}/helpers/categories/category.config`;

function getDateFormat() {
  const today = new Date();
  return (`${today.getFullYear() + today.getMonth() + today.getDate()}T${today.getHours()}${today.getMinutes()}${today.getHours()}`);
}

const fileRead = () => {
  const readCatFile = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(readCatFile);
};

const assignCheckedAndUnchecked = (catgs, prodCatgsDb, idNames, checker) => {
  for (let key in catgs) {
    const catIdName = key.split(':');
    const catName = catIdName[1];
    idNames[key] = catName;
    if (key in prodCatgsDb) {
      checker[key] = 1;
    }
    if (typeof catgs[key] === 'object') {
      assignCheckedAndUnchecked(catgs[key], prodCatgsDb, idNames, checker);
    }
  }
};

const checkUncheckAssignment = (catgs, prodCatgsDb, idNames, checker) => {
  for (let key in catgs) {
    const catIdName = key.split(':');
    const catName = catIdName[1];
    idNames[key] = catName;
    if (key in prodCatgsDb) {
      checker[key] = 1;
    }

    if (typeof (catgs[key]) === 'object') {
      assignCheckedAndUnchecked(catgs[key], prodCatgsDb, idNames, checker);
    }
  }
};

const categoryDisplayer = (catgs, idNames) => {
  for (let key in catgs) {
    const catIdName = key.split(':');
    const catName = catIdName[1];
    idNames[key] = catName;
    if (typeof catgs[key] === 'object') {
      categoryDisplayer(catgs[key], idNames);
    }
  }
};

const categoryFileWriteAndBackup = (path, categories) => {
  const dateTime = getDateFormat();
  const backupFile = `${path}.${dateTime}`;
  fs.copyFile(path, backupFile, (err) => {
    if (err) throw err;
    fs.writeFile(path, JSON.stringify(categories, null, 4), (err) => {
      if (err) throw err;
    });
  });
};

const assignParentsForCategory = (categories, parents, newCatIdName) => {
  for (var key in categories) {
    if (typeof (categories[key]) === 'object') {
      if (key in parents) {
        categories[key][newCatIdName] = 1;
      }
      assignParentsForCategory(categories[key], parents, newCatIdName);
    } else if (key in parents) {
      const href = {};
      href[newCatIdName] = 1;
      categories[key] = href;
    }
  }
};

module.exports = {
  fileRead,
  checkUncheckAssignment: checkUncheckAssignment,
  categoryDisplayer: categoryDisplayer,
  categoryFileWriteAndBackup: categoryFileWriteAndBackup,
  assignParentsForCategory: assignParentsForCategory
};
