var url = require('../../config.js').apiUrl;

var loginFactory = function($http) {
  return {
    signIn: function(id, rawDate) {
      return $http({
        method: 'GET',
        url: url + 'login/' + rawDate + '/' + id
      });
    }
  };
};

module.exports = loginFactory;