var url = require('../../config.js').apiUrl;

var countFactory = function($http) {
  return {
    sendData: sendData,
    getHistory: getHistory
  };

  function sendData(count) {
    return $http({
      method: 'POST',
      url: url + 'post/count',
      data: JSON.stringify(count),
      headers: {
        'Content-Type': 'application/json' 
      }
    });
  }

  function getHistory(taskid) {
    return $http({
      method: 'GET',
      url: url + 'get/count/' + taskid
    });
  }


};

module.exports = countFactory;