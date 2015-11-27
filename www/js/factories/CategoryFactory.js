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
      method: 'GET',
      url: url + 'categories/' + locationTypeId
    }).then(function(res){
      callback(res);
    }, function(err) {
      console.log('Mega ERROR', err);
    });
  }

  return {
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