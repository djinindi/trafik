var url = require('../../config.js').apiUrl;

var categoryFactory = function($http, VarFactory) {
  var categories = [];

  function setCategories(array) {
    categories = array;
  }

  function getCategories() {
    return categories;
  }

  function getAllCategories() {
    var locationTypeId = VarFactory.getVar('locationType');
    return $http({
      method: 'GET',
      url: url + 'categories/' + locationTypeId
    });
  }

  return {
    getAllCategories: getAllCategories,
    setCategories: setCategories,
    getCategories: getCategories
  };
};

module.exports = categoryFactory;