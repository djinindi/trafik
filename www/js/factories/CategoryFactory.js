var url = require('../../config.js').apiUrl;

var categoryFactory = function($http, VarFactory) {
  var categories = [];

  function setCategories(array) {
    categories = array;
  }

  function getCategories() {
    return categories;
  }

  function getAllCategories(callback) {
    var locationTypeId = VarFactory.getVar('locationType');
    $http({
      method: 'POST',
      url: url + 'categories',
      data: 'locationtypeid=' + 4
    }).then(function(res){
      callback(res);
    }, function(err) {
      console.log('Mega ERROR', err);
    });
  }

  function resultToCat(res) {
    categories = [];
    var jsonData = res.data;
    var jsonKeys = Object.keys(jsonData);
    for (var i = 0; i < jsonKeys.length; i++) {
      var jsonSingle = jsonData[jsonKeys[i]];
      categories.push(jsonSingle);
    }
  }

  function getTaskCategories(locID) {
    console.log("getTaskCats: " + locID);
    var catsRes = $http({
      method: 'POST',
      url: url + 'categories',
      data: 'locationtypeid=' + locID 
    });
    catsRes.then(function(res) {
      resultToCat(res);
    });
    return categories;
  }

  return {
    getTaskCategories: getTaskCategories,
    resultToCat: resultToCat,
    getAllCategories: getAllCategories,
    all: function() {
      return categories;
    },
    remove: function(category) {
      categories.splice(categories.indexOf(category), 1);
    },
    get: function(categoryId) {
      for (var i = 0; i < categories.length; i++) {
        if (categories[i].id === parseInt(categoryId)) {
          return categories[i];
        }
      }
      return null;
    }
  };
};

module.exports = categoryFactory;