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

.controller('CountCtrl', function($scope, categories, $ionicPlatform, $cordovaToast) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.toggleInfo = function(category) {
    if ($scope.isInfoShown(category)) {
      $scope.shownInfo = null;
    } else {
      $scope.shownInfo = category;
    }
  };

  $scope.isInfoShown = function(category) {
    return $scope.shownInfo === category;
  };
  
  $scope.location = "Lygten 16";
  $scope.username = "Hans Jensen";
  $scope.categories = categories.all();
  $scope.hours = "";
  $scope.minutes = "";
  $scope.minus = function(category) {
    if (typeof (category.count) === 'undefined') {
      category.count = 0;
    } else {
      if (category.count >= 1) {
        category.count--;
      }
    }
  };
  $scope.plus = function(category) {
    if (typeof (category.count) === 'undefined') {
      category.count = 1;
    } else {
      category.count++;
    }
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
      $scope.hours = $scope.selectedTime.getHours();
      $scope.minutes = $scope.selectedTime.getMinutes();

      console.log('Selected time is: ' + $scope.hours + ':' + $scope.minutes);
    }
  };

  $scope.sendData = function (form) {
    if (form.$valid) {
      console.log(JSON.stringify($scope.categories, null, 2));
      $cordovaToast.showLongCenter('Din data er gemt...');
    }
  };
})

.controller('CategoryDetailCtrl', function($scope, $stateParams, categories) {
  $scope.category = categories.get($stateParams.categoryId);
})

.controller('SettingsCtrl', function($scope) {
  $scope.settings = {
  };
  function uploadData() {

  }
});
