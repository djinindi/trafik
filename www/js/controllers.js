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

.controller('CountCtrl', function($scope, categories, $ionicPlatform) {
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
  $scope.hours = "";
  $scope.minutes = "";
  $scope.remove = function(category) {
    if (category.count >= 1) {
      category.count--;
    }
  };
  $scope.plus = function(category) {
    category.count++;
  };

  $scope.timePickerObject = {
    inputEpochTime: ((new Date()).getHours() * 60 * 60),
    step: 15,
    format: 24,
    setLabel: 'Vælg',
    closeLabel: 'Luk',
    setButtonType: 'button-balanced',
    closeButtpnType: 'button-stable',
    callback: function (val) {
      console.log('val: ' + (new Date().getHours() * 60 * 60));
      $scope.timePickerCallback(val);
    }
  };

  $scope.timePickerCallback = function (val) {
    if (typeof (val) === 'undefined') {
      console.log('Time not selected');
    } else {
      $scope.selectedTime = new Date((val * 1000)-(3600 * 1000));
      $scope.hours = $scope.selectedTime.getUTCHours();
      $scope.minutes = $scope.selectedTime.getUTCMinutes();

      console.log('Selected time is: ' + $scope.selectedTime);
    }
  };

  $scope.sendData = function (form) {
    if (form.$valid) {
      for (var i = 0; i < $scope.categories.length; i++) {
        console.log($scope.categories[i]);
      }
    }
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
