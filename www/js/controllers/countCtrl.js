var countCtrl = function($scope, $rootScope, $filter, CategoryFactory, CountFactory, VarFactory, $ionicPlatform, $ionicPopup, $cordovaToast, $http) {
  $scope.$on("$ionicView.enter", function(scopes, states) {
    if(states.stateName == "tab.count") {
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

  $scope.note = function(category) {
    var myPopup = $ionicPopup.prompt({
      title: 'Note til kategori',
      inputType: 'text',
      cancelText: 'Annuller',
      cancelType: 'button-assertive',
      okText: 'Gem',
      okType: 'button-balanced'
    });
    if (typeof (category.note) === 'undefined') {
      myPopup.then(function(res) {
        category.note = res;
      });
    } else {
      myPopup.then(function(res) {
        if (typeof (res) === 'undefined') {
          return;
        } else {
          category.note = res;
        }
      });
    }
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
      if ($scope.hours.toString().length === 1) {
        $scope.hours = ('0' + $scope.hours);
      }
      if ($scope.minutes === 0) {
        $scope.minutes = '00';
      } 
      console.log('Selected time is: ' + $scope.hours + ':' + $scope.minutes);
    }
  };

  function resetCount() {
    console.log("resetting!");
    $scope.categories.forEach(function(cat) {
      cat.count = 0;
    });
  }

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
      //console.log('sendData -> \n' + JSON.stringify($scope.thisCount, null, 2));
      //console.log($scope.thisCount);
      CountFactory.sendData($scope.thisCount).then(function(status) {
        console.log(status);
        //$cordovaToast.showLongCenter('Din data er gemt....');
        resetCount();
      }, function(data, status) {
        console.log("sendData.Error -> data: " + data + ", status: " + status);
        $cordovaToast.showLongCenter('Der skete en fejl....');
      });
    }
  };
};

module.exports = countCtrl;