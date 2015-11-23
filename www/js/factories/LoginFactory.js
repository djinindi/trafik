var url = require('../../config.js').apiUrl;

var loginFactory = function($http) {
  return {
    signIn: function(id, rawDate) {
      return $http({
        method: 'POST',
        url: url + 'login',
        data: 'userid=' + id + '&date=' + rawDate
      });
    }
  };


};

module.exports = loginFactory;