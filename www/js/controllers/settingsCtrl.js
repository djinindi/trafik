var settingsCtrl = function($scope, CountFactory, VarFactory) {
  $scope.settings = {};

  $scope.getCountHistory = function() {
    console.log('Getting History!');
    CountFactory.getHistory(VarFactory.getVar('task')).then(function(res) {
      console.log(res.data);
      $scope.history = res.data;
      filterHistoryTimes();
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
  $scope.getCountHistory();
};

module.exports = settingsCtrl;