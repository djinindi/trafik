var settingsCtrl = function($scope, CountFactory, VarFactory) {
  $scope.settings = {};

  function init() {
    $scope.getCountHistory();
  }

  $scope.getCountHistory = function() {
    console.log('Getting History!');
    CountFactory.getHistory(VarFactory.getVar('task')).then(function(res) {
      if (res.status == 200) {
        console.log(res.data);
        $scope.history = res.data;
        filterHistoryTimes();
      }
      if (res.status == 404) {
        console.log("HISTORY NOT FOUND!");
      }
    });
  };

  function filterHistoryTimes() {
    $scope.times = [];
    angular.forEach($scope.history, function(value, key) {
      if ($scope.times.indexOf(value.Time) == -1) {
        $scope.times.push(value.Time);
      }
    });
  }

  $scope.timeSelected = function() {
    console.log("updated time to: " + $scope.settings.selectedTime);
  };
  
  init();
};

module.exports = settingsCtrl;