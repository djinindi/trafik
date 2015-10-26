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

.controller('CountCtrl', function($scope, categories, $cordovaDatePicker, $ionicPlatform) {
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
      titleText: 'Tidsrum',
      okText: 'Ok',
      cancelText: 'Annuller',
      doneButtonLabel: 'DONE',
      doneButtonColor: '#F2F3F4',
      cancelButtonLabel: 'CANCEL',
      cancelButtonColor: '#000000',
      minuteInterval: 15,
      is24Hour: true,
      locale: 'dk_DK',
      x: '200',
      y: '200'
    };
    function onSuccess(date) {
      console.log("cordovaDatePicker: " + date);
      $scope.kvarter = date;
    }
    function onError(error) {
      console.log("DatePicker error: " + error);
    }
    $ionicPlatform.ready(function() {
      $cordovaDatePicker.show(options, onSuccess, onError);
    });
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
