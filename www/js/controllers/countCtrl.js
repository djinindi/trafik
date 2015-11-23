var url = require('../../config.js').apiUrl;
var countCtrl = function($scope, $rootScope, $filter, CategoryFactory, VarFactory, $ionicPlatform, $cordovaToast, $http) {
  $scope.$on("$ionicView.enter", function(scopes, states) {
    if(states.fromCache && states.stateName == "tab.count") {
      $scope.thisCount.name = VarFactory.getVar('userName');
      $scope.thisCount.start = VarFactory.getVar('taskStart');
      $scope.thisCount.end = VarFactory.getVar('taskEnd');
      if (typeof ($scope.categories) === 'undefined') {
        $scope.getCategoryData();
      }
    }
  });

  $scope.getCategoryData = function() {
    CategoryFactory.getAllCategories(function(cats) {
      $scope.categories = cats.data;
    });
  };

  $scope.thisCount = {
    date: $rootScope.userDate,
    userid: $rootScope.userId
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
      });
      $scope.thisCount.hour = $scope.hours;
      $scope.thisCount.minut = $scope.minutes;
      $scope.thisCount.locType = VarFactory.getVar('locationType');
      $scope.thisCount.loc = VarFactory.getVar('location');
      $scope.thisCount.task = VarFactory.getVar('task');
      $scope.thisCount.categories = $scope.categories;
      //console.log('$scope.categories: ' + JSON.stringify($scope.thisCount.categories, null, 2));
      console.log('sendData -> \n' + JSON.stringify($scope.thisCount, null, 2));
      $http({
        method: 'POST',
        url: url + 'sendCount',
        data: $scope.thisCount,
        headers: {
          'Content-Type': 'application/json' 
        }
      }).then(function(res) {
        //console.log('sendData -> ', res);
      });
      $cordovaToast.showLongCenter('Din data er gemt...');
    }
  };
};

module.exports = countCtrl;