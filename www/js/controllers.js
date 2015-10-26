angular.module('starter.controllers', [])

.controller('LoginCtrl', function($scope) {
  $scope.user = {
    name: '',
    street: '',
    streetnr: '',
    date: '',
    time: '',
  };
})

.controller('CountCtrl', function($scope, categories, $cordovaDatePicker) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});
  $scope.location = "Lygten 16";
  $scope.username = "Hans Jensen";
  $scope.categories = categories.all();
  $scope.remove = function(category) {
    if (category.count >= 1) {
      category.count--;
    }
  };
  $scope.plus = function(category) {
    category.count++;
  };

  $scope.time = function() {
    var options = {
      date: new Date(),
      mode: 'time',
      doneButtonLabel: 'DONE',
      doneButtonColor: '#F2F3F4',
      cancelButtonLabel: 'CANCEL',
      cancelButtonColor: '#000000',
      minuteInterval: 15
    };
    $cordovaDatePicker.show(options).then(function(date) {
      alert(date);
    }, false);
  };
})

.controller('VehicleDetailCtrl', function($scope, $stateParams, categories) {
  $scope.category = categories.get($stateParams.vehicleId);
})

.controller('SettingsCtrl', function($scope) {
  $scope.settings = {
  };
  function uploadData() {

  }
});
