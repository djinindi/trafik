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
    setCategories: setCategories,
    getCategories: getCategories
  };
};

module.exports = categoryFactory;