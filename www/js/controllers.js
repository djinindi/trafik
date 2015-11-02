angular.module('starter.controllers', [])

.controller('LoginCtrl', function($scope, $rootScope, LoginService, $state, $http, $cordovaToast, $filter) {
  $scope.user = {
    date: $filter('date')(new Date(), 'd MMMM yyyy')
  };

  $scope.login = function() {
    var link = 'http://jonasja.dk/api.php';
    $http.post(link, {userid : $scope.user.id}).then(function(res) {
      if (res.data.status == 'success') {
        console.log(res.data.name);
        $rootScope.userDate = $scope.user.date;
        $rootScope.userName = res.data.name;
        $rootScope.userId = res.data.id;
        $state.go("tab.count");
        console.log("Great Success");
      } else {
        console.log(res);
        console.log("WRONG!");
        $cordovaToast.showLongBottom("Forkert ID");
      }
    });
    console.log("Login, ID: " + $scope.user.id + " - Date: " + $scope.user.date);
  };
})

.controller('CountCtrl', function($scope, $rootScope, $filter, categories, $ionicPlatform, $cordovaToast) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.$on('$ionicView.enter', function(e) {
    $scope.thisCount.name = $rootScope.userName;
  });

  $scope.categories = categories.all();
  $scope.thisCount = {
    date: $rootScope.userDate,
    userid: $rootScope.userId,
    name: $rootScope.userName
  };

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
      $scope.timePicker = new Date((val * 1000)-(3600 * 1000));
      $scope.selectedTime = $filter('date')($scope.timePicker, 'HH:mm');
      $scope.hours = $scope.timePicker.getHours();
      $scope.minutes = $scope.timePicker.getMinutes();

      console.log('Selected time is: ' + $scope.hours + ':' + $scope.minutes);
    }
  };

  $scope.sendData = function (form) {
    if (form.$valid) {
      $scope.categories.forEach(function(cat) {
        if (typeof (cat.count) === 'undefined') {
          cat.count = 0;
        }
        console.log('ID: ' + cat.id + '\nCount: ' + cat.count);
      });
      $scope.thisCount.hour = $scope.hours;
      $scope.thisCount.minut = $scope.minutes;
      $scope.thisCount.categories = $scope.categories;
      //console.log('$scope.categories: ' + JSON.stringify($scope.thisCount.categories, null, 2));
      console.log('sendData -> \n' + JSON.stringify($scope.thisCount, null, 2));
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
