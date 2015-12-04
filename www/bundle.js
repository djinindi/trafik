(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = {
  //"apiUrl" : "http://localhost/trafik/Slim/index.php/"
  "apiUrl" : "http://jonasja.dk/Slim/index.php/"
};
},{}],2:[function(require,module,exports){
var categoryDetailCtrl = function($scope, $stateParams, categories) {
  $scope.category = categories.get($stateParams.categoryId);
};

module.exports = categoryDetailCtrl;
},{}],3:[function(require,module,exports){
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
    CategoryFactory.getAllCategories().then(function(res) {
      if (res.status == 200) {
        $scope.categories = res.data;
      }
      else {
        $cordovaToast.showLongBottom("Der skete en fejl...");
      }
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
      CountFactory.sendData($scope.thisCount).then(function(res) {
        if (res.status == 200) {
          console.log(status);
          $cordovaToast.showLongCenter('Din data er gemt....');
          resetCount();
        }
        if (res.status == 404) {
          console.log(status);
          $cordovaToast.showLongCenter('Din data blev IKKE gemt!');
        }
      }, function(data, status) {
        console.log("sendData.Error -> data: " + data + ", status: " + status);
        $cordovaToast.showLongCenter('Der skete en fejl....');
      });
    }
  };
};

module.exports = countCtrl;
},{}],4:[function(require,module,exports){
var loginCtrl = function($scope, $rootScope, $state, $http, $cordovaToast, $filter, LoginFactory, VarFactory) {
  $scope.user = {
    date: $filter('date')(new Date(), 'dd-MM-yy')
  };

  $scope.login = function() {
    var rawDate = $scope.user.date.replace(/-/g, "");

    LoginFactory.signIn($scope.user.id, rawDate).then(function(res) {
      if (res.status == 200) {
        console.log(res);
        VarFactory.setVar("locationType", res.data.LocationTypeID);
        VarFactory.setVar("userName", res.data.Name);
        VarFactory.setVar("taskStart", res.data.TimeFrom);
        VarFactory.setVar("taskEnd", res.data.TimeTo);
        VarFactory.setVar("location", res.data.LocationID);
        VarFactory.setVar("task", res.data.TaskID);
        $rootScope.userDate = $scope.user.date;
        $rootScope.userId = res.data.UserID;
        $state.go("tab.count");
      } 
      else if (res.status == 404) {
        console.log(res.data, res.status);
        console.log("Bad Request");
        $cordovaToast.showLongBottom("Forkert ID eller Dato");
      }
      else if (res.status == 400) {
        console.log(res.data, res.status);
        console.log("User id is blank");
        $cordovaToast.showLongBottom("Bruger ID mangler");
      }
    });
    console.log("Login, ID: " + $scope.user.id + " - Date: " + $scope.user.date);
  };

  function destoryUserCredentials() {
    varFactory.deleteVar("");
  }
};

module.exports = loginCtrl;
},{}],5:[function(require,module,exports){
var settingsCtrl = function($scope, CountFactory, VarFactory) {
  $scope.settings = {};

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
  $scope.getCountHistory();
};

module.exports = settingsCtrl;
},{}],6:[function(require,module,exports){
var url = require('../../config.js').apiUrl;

var categoryFactory = function($http, VarFactory) {
  var categories = [];

  function setCategories(array) {
    categories = array;
  }

  function getCategories() {
    return categories;
  }

  function getAllCategories() {
    var locationTypeId = VarFactory.getVar('locationType');
    return $http({
      method: 'GET',
      url: url + 'categories/' + locationTypeId
    });
  }

  return {
    getAllCategories: getAllCategories,
    setCategories: setCategories,
    getCategories: getCategories
  };
};

module.exports = categoryFactory;
},{"../../config.js":1}],7:[function(require,module,exports){
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
},{"../../config.js":1}],8:[function(require,module,exports){
var url = require('../../config.js').apiUrl;

var loginFactory = function($http) {
  return {
    signIn: function(id, rawDate) {
      return $http({
        method: 'GET',
        url: url + 'login/' + rawDate + '/' + id
      });
    }
  };
};

module.exports = loginFactory;
},{"../../config.js":1}],9:[function(require,module,exports){
var varFactory = function(){
  return {
    getVar:getVar,
    setVar:setVar
  };

  function getVar (key) {
    return window.localStorage.getItem(key);
  }

  function setVar (key, value) {
    if (typeof value === "undefined"){
      window.localStorage.removeItem(key);
    } 
    else {
      window.localStorage.setItem(key, value);
    }
  }
};

module.exports = varFactory;
},{}],10:[function(require,module,exports){
//Register the angular app module
var kaunta = angular.module('kaunta', [
    'ionic',
    'ngCordova',
    'ionic-timepicker',
]);

//Register angular components
require('./ngBoot')(kaunta);

//Register the navigation states
require('./navigation')(kaunta);

kaunta.config(function($httpProvider) {
  $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
});

kaunta.run(function($ionicPlatform, $rootScope) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleLightContent();
    }
  });

  $rootScope.$on("$stateChangeStart", function (event, toState, toParams, fromState, fromParams) {
    console.log("$stateChangeStart!");
    console.log("toState: " + toState.name + ", fromState: " + fromState.name);
  });
});
},{"./navigation":11,"./ngBoot":12}],11:[function(require,module,exports){
module.exports = function(app) {
  app.config(function($stateProvider, $urlRouterProvider, $compileProvider) {
    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/tab/login');

    // setup an abstract state for the tabs directive
    $stateProvider.state('tab', {
      url: '/tab',
      abstract: true,
      templateUrl: 'templates/tabs.html'
    });

  
    // Each tab has its own nav history stack:
    $stateProvider.state('tab.login', {
      url: '/login',
      views: {
        'tab-login': {
          templateUrl: 'templates/tab-login.html',
          controller: 'LoginCtrl'
        }
      }
    });

    $stateProvider.state('tab.count', {
      url: '/count',
      views: {
        'tab-count': {
          templateUrl: 'templates/tab-count.html',
          controller: 'CountCtrl'
        }
      }
    });

    $stateProvider.state('tab.category-detail', {
      url: '/count/:categoryId',
      views: {
        'tab-count': {
          templateUrl: 'templates/category-detail.html',
          controller: 'CategoryDetailCtrl'
        }
      }
    });

    $stateProvider.state('tab.settings', {
      url: '/settings',
      views: {
        'tab-settings': {
          templateUrl: 'templates/tab-settings.html',
          controller: 'SettingsCtrl'
        }
      }
    });
  });
};
},{}],12:[function(require,module,exports){
module.exports = function(app) {
  //Controllers
  app.controller('LoginCtrl', require('./controllers/LoginCtrl'));
  app.controller('CountCtrl', require('./controllers/CountCtrl'));
  app.controller('CategoryDetailCtrl', require('./controllers/CategoryDetailCtrl'));
  app.controller('SettingsCtrl', require('./controllers/SettingsCtrl'));

  //Factories
  app.factory('CategoryFactory', require('./factories/CategoryFactory'));
  app.factory('LoginFactory', require('./factories/LoginFactory'));
  app.factory('VarFactory', require('./factories/VarFactory'));
  app.factory('CountFactory', require('./factories/CountFactory'));
};
},{"./controllers/CategoryDetailCtrl":2,"./controllers/CountCtrl":3,"./controllers/LoginCtrl":4,"./controllers/SettingsCtrl":5,"./factories/CategoryFactory":6,"./factories/CountFactory":7,"./factories/LoginFactory":8,"./factories/VarFactory":9}]},{},[10])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJ3d3cvY29uZmlnLmpzIiwid3d3L2pzL2NvbnRyb2xsZXJzL0NhdGVnb3J5RGV0YWlsQ3RybC5qcyIsInd3dy9qcy9jb250cm9sbGVycy9Db3VudEN0cmwuanMiLCJ3d3cvanMvY29udHJvbGxlcnMvTG9naW5DdHJsLmpzIiwid3d3L2pzL2NvbnRyb2xsZXJzL1NldHRpbmdzQ3RybC5qcyIsInd3dy9qcy9mYWN0b3JpZXMvQ2F0ZWdvcnlGYWN0b3J5LmpzIiwid3d3L2pzL2ZhY3Rvcmllcy9Db3VudEZhY3RvcnkuanMiLCJ3d3cvanMvZmFjdG9yaWVzL0xvZ2luRmFjdG9yeS5qcyIsInd3dy9qcy9mYWN0b3JpZXMvVmFyRmFjdG9yeS5qcyIsInd3dy9qcy9tYWluIiwid3d3L2pzL25hdmlnYXRpb24uanMiLCJ3d3cvanMvbmdCb290LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3REQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJtb2R1bGUuZXhwb3J0cyA9IHtcbiAgLy9cImFwaVVybFwiIDogXCJodHRwOi8vbG9jYWxob3N0L3RyYWZpay9TbGltL2luZGV4LnBocC9cIlxuICBcImFwaVVybFwiIDogXCJodHRwOi8vam9uYXNqYS5kay9TbGltL2luZGV4LnBocC9cIlxufTsiLCJ2YXIgY2F0ZWdvcnlEZXRhaWxDdHJsID0gZnVuY3Rpb24oJHNjb3BlLCAkc3RhdGVQYXJhbXMsIGNhdGVnb3JpZXMpIHtcbiAgJHNjb3BlLmNhdGVnb3J5ID0gY2F0ZWdvcmllcy5nZXQoJHN0YXRlUGFyYW1zLmNhdGVnb3J5SWQpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBjYXRlZ29yeURldGFpbEN0cmw7IiwidmFyIGNvdW50Q3RybCA9IGZ1bmN0aW9uKCRzY29wZSwgJHJvb3RTY29wZSwgJGZpbHRlciwgQ2F0ZWdvcnlGYWN0b3J5LCBDb3VudEZhY3RvcnksIFZhckZhY3RvcnksICRpb25pY1BsYXRmb3JtLCAkaW9uaWNQb3B1cCwgJGNvcmRvdmFUb2FzdCwgJGh0dHApIHtcbiAgJHNjb3BlLiRvbihcIiRpb25pY1ZpZXcuZW50ZXJcIiwgZnVuY3Rpb24oc2NvcGVzLCBzdGF0ZXMpIHtcbiAgICBpZihzdGF0ZXMuc3RhdGVOYW1lID09IFwidGFiLmNvdW50XCIpIHtcbiAgICAgICRzY29wZS50aGlzQ291bnQubmFtZSA9IFZhckZhY3RvcnkuZ2V0VmFyKCd1c2VyTmFtZScpO1xuICAgICAgJHNjb3BlLnRoaXNDb3VudC5zdGFydCA9IFZhckZhY3RvcnkuZ2V0VmFyKCd0YXNrU3RhcnQnKTtcbiAgICAgICRzY29wZS50aGlzQ291bnQuZW5kID0gVmFyRmFjdG9yeS5nZXRWYXIoJ3Rhc2tFbmQnKTtcbiAgICAgIGlmICh0eXBlb2YgKCRzY29wZS5jYXRlZ29yaWVzKSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgJHNjb3BlLmdldENhdGVnb3J5RGF0YSgpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgJHNjb3BlLmdldENhdGVnb3J5RGF0YSA9IGZ1bmN0aW9uKCkge1xuICAgIENhdGVnb3J5RmFjdG9yeS5nZXRBbGxDYXRlZ29yaWVzKCkudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgIGlmIChyZXMuc3RhdHVzID09IDIwMCkge1xuICAgICAgICAkc2NvcGUuY2F0ZWdvcmllcyA9IHJlcy5kYXRhO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgICRjb3Jkb3ZhVG9hc3Quc2hvd0xvbmdCb3R0b20oXCJEZXIgc2tldGUgZW4gZmVqbC4uLlwiKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcblxuICAkc2NvcGUudGhpc0NvdW50ID0ge1xuICAgIGRhdGU6ICRyb290U2NvcGUudXNlckRhdGUsXG4gICAgdXNlcmlkOiAkcm9vdFNjb3BlLnVzZXJJZFxuICB9O1xuXG4gICRzY29wZS50b2dnbGVJbmZvID0gZnVuY3Rpb24oY2F0ZWdvcnkpIHtcbiAgICBpZiAoJHNjb3BlLmlzSW5mb1Nob3duKGNhdGVnb3J5KSkge1xuICAgICAgJHNjb3BlLnNob3duSW5mbyA9IG51bGw7XG4gICAgfSBlbHNlIHtcbiAgICAgICRzY29wZS5zaG93bkluZm8gPSBjYXRlZ29yeTtcbiAgICB9XG4gIH07XG5cbiAgJHNjb3BlLmlzSW5mb1Nob3duID0gZnVuY3Rpb24oY2F0ZWdvcnkpIHtcbiAgICByZXR1cm4gJHNjb3BlLnNob3duSW5mbyA9PT0gY2F0ZWdvcnk7XG4gIH07XG5cbiAgJHNjb3BlLm5vdGUgPSBmdW5jdGlvbihjYXRlZ29yeSkge1xuICAgIHZhciBteVBvcHVwID0gJGlvbmljUG9wdXAucHJvbXB0KHtcbiAgICAgIHRpdGxlOiAnTm90ZSB0aWwga2F0ZWdvcmknLFxuICAgICAgaW5wdXRUeXBlOiAndGV4dCcsXG4gICAgICBjYW5jZWxUZXh0OiAnQW5udWxsZXInLFxuICAgICAgY2FuY2VsVHlwZTogJ2J1dHRvbi1hc3NlcnRpdmUnLFxuICAgICAgb2tUZXh0OiAnR2VtJyxcbiAgICAgIG9rVHlwZTogJ2J1dHRvbi1iYWxhbmNlZCdcbiAgICB9KTtcbiAgICBpZiAodHlwZW9mIChjYXRlZ29yeS5ub3RlKSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIG15UG9wdXAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgY2F0ZWdvcnkubm90ZSA9IHJlcztcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBteVBvcHVwLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgIGlmICh0eXBlb2YgKHJlcykgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNhdGVnb3J5Lm5vdGUgPSByZXM7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcblxuICAkc2NvcGUubWludXMgPSBmdW5jdGlvbihjYXRlZ29yeSkge1xuICAgIGlmICh0eXBlb2YgKGNhdGVnb3J5LmNvdW50KSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIGNhdGVnb3J5LmNvdW50ID0gMDtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKGNhdGVnb3J5LmNvdW50ID49IDEpIHtcbiAgICAgICAgY2F0ZWdvcnkuY291bnQtLTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgJHNjb3BlLnBsdXMgPSBmdW5jdGlvbihjYXRlZ29yeSkge1xuICAgIGlmICh0eXBlb2YgKGNhdGVnb3J5LmNvdW50KSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIGNhdGVnb3J5LmNvdW50ID0gMTtcbiAgICB9IGVsc2Uge1xuICAgICAgY2F0ZWdvcnkuY291bnQrKztcbiAgICB9XG4gIH07XG5cbiAgJHNjb3BlLnRpbWVQaWNrZXJPYmplY3QgPSB7XG4gICAgaW5wdXRFcG9jaFRpbWU6ICgobmV3IERhdGUoKSkuZ2V0SG91cnMoKSAqIDYwICogNjApLFxuICAgIHN0ZXA6IDE1LFxuICAgIGZvcm1hdDogMjQsXG4gICAgc2V0TGFiZWw6ICdWw6ZsZycsXG4gICAgY2xvc2VMYWJlbDogJ0x1aycsXG4gICAgc2V0QnV0dG9uVHlwZTogJ2J1dHRvbi1iYWxhbmNlZCcsXG4gICAgY2xvc2VCdXR0cG5UeXBlOiAnYnV0dG9uLXN0YWJsZScsXG4gICAgY2FsbGJhY2s6IGZ1bmN0aW9uICh2YWwpIHtcbiAgICAgIGNvbnNvbGUubG9nKCd2YWw6ICcgKyAobmV3IERhdGUoKS5nZXRIb3VycygpICogNjAgKiA2MCkpO1xuICAgICAgJHNjb3BlLnRpbWVQaWNrZXJDYWxsYmFjayh2YWwpO1xuICAgIH1cbiAgfTtcblxuICAkc2NvcGUudGltZVBpY2tlckNhbGxiYWNrID0gZnVuY3Rpb24gKHZhbCkge1xuICAgIGlmICh0eXBlb2YgKHZhbCkgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBjb25zb2xlLmxvZygnVGltZSBub3Qgc2VsZWN0ZWQnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgJHNjb3BlLnRpbWVQaWNrZXIgPSBuZXcgRGF0ZSgodmFsICogMTAwMCktKDM2MDAgKiAxMDAwKSk7XG4gICAgICAkc2NvcGUuc2VsZWN0ZWRUaW1lID0gJGZpbHRlcignZGF0ZScpKCRzY29wZS50aW1lUGlja2VyLCAnSEg6bW0nKTtcbiAgICAgICRzY29wZS5ob3VycyA9ICRzY29wZS50aW1lUGlja2VyLmdldEhvdXJzKCk7XG4gICAgICAkc2NvcGUubWludXRlcyA9ICRzY29wZS50aW1lUGlja2VyLmdldE1pbnV0ZXMoKTtcbiAgICAgIGlmICgkc2NvcGUuaG91cnMudG9TdHJpbmcoKS5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgJHNjb3BlLmhvdXJzID0gKCcwJyArICRzY29wZS5ob3Vycyk7XG4gICAgICB9XG4gICAgICBpZiAoJHNjb3BlLm1pbnV0ZXMgPT09IDApIHtcbiAgICAgICAgJHNjb3BlLm1pbnV0ZXMgPSAnMDAnO1xuICAgICAgfSBcbiAgICAgIGNvbnNvbGUubG9nKCdTZWxlY3RlZCB0aW1lIGlzOiAnICsgJHNjb3BlLmhvdXJzICsgJzonICsgJHNjb3BlLm1pbnV0ZXMpO1xuICAgIH1cbiAgfTtcblxuICBmdW5jdGlvbiByZXNldENvdW50KCkge1xuICAgIGNvbnNvbGUubG9nKFwicmVzZXR0aW5nIVwiKTtcbiAgICAkc2NvcGUuY2F0ZWdvcmllcy5mb3JFYWNoKGZ1bmN0aW9uKGNhdCkge1xuICAgICAgY2F0LmNvdW50ID0gMDtcbiAgICB9KTtcbiAgfVxuXG4gICRzY29wZS5zZW5kRGF0YSA9IGZ1bmN0aW9uIChmb3JtKSB7XG4gICAgaWYgKGZvcm0uJHZhbGlkKSB7XG4gICAgICAkc2NvcGUuY2F0ZWdvcmllcy5mb3JFYWNoKGZ1bmN0aW9uKGNhdCkge1xuICAgICAgICBpZiAodHlwZW9mIChjYXQuY291bnQpID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIGNhdC5jb3VudCA9IDA7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgJHNjb3BlLnRoaXNDb3VudC5ob3VyID0gJHNjb3BlLmhvdXJzO1xuICAgICAgJHNjb3BlLnRoaXNDb3VudC5taW51dCA9ICRzY29wZS5taW51dGVzO1xuICAgICAgJHNjb3BlLnRoaXNDb3VudC5sb2NUeXBlID0gVmFyRmFjdG9yeS5nZXRWYXIoJ2xvY2F0aW9uVHlwZScpO1xuICAgICAgJHNjb3BlLnRoaXNDb3VudC5sb2MgPSBWYXJGYWN0b3J5LmdldFZhcignbG9jYXRpb24nKTtcbiAgICAgICRzY29wZS50aGlzQ291bnQudGFzayA9IFZhckZhY3RvcnkuZ2V0VmFyKCd0YXNrJyk7XG4gICAgICAkc2NvcGUudGhpc0NvdW50LmNhdGVnb3JpZXMgPSAkc2NvcGUuY2F0ZWdvcmllcztcbiAgICAgIC8vY29uc29sZS5sb2coJyRzY29wZS5jYXRlZ29yaWVzOiAnICsgSlNPTi5zdHJpbmdpZnkoJHNjb3BlLnRoaXNDb3VudC5jYXRlZ29yaWVzLCBudWxsLCAyKSk7XG4gICAgICAvL2NvbnNvbGUubG9nKCdzZW5kRGF0YSAtPiBcXG4nICsgSlNPTi5zdHJpbmdpZnkoJHNjb3BlLnRoaXNDb3VudCwgbnVsbCwgMikpO1xuICAgICAgLy9jb25zb2xlLmxvZygkc2NvcGUudGhpc0NvdW50KTtcbiAgICAgIENvdW50RmFjdG9yeS5zZW5kRGF0YSgkc2NvcGUudGhpc0NvdW50KS50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICBpZiAocmVzLnN0YXR1cyA9PSAyMDApIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhzdGF0dXMpO1xuICAgICAgICAgICRjb3Jkb3ZhVG9hc3Quc2hvd0xvbmdDZW50ZXIoJ0RpbiBkYXRhIGVyIGdlbXQuLi4uJyk7XG4gICAgICAgICAgcmVzZXRDb3VudCgpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChyZXMuc3RhdHVzID09IDQwNCkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKHN0YXR1cyk7XG4gICAgICAgICAgJGNvcmRvdmFUb2FzdC5zaG93TG9uZ0NlbnRlcignRGluIGRhdGEgYmxldiBJS0tFIGdlbXQhJyk7XG4gICAgICAgIH1cbiAgICAgIH0sIGZ1bmN0aW9uKGRhdGEsIHN0YXR1cykge1xuICAgICAgICBjb25zb2xlLmxvZyhcInNlbmREYXRhLkVycm9yIC0+IGRhdGE6IFwiICsgZGF0YSArIFwiLCBzdGF0dXM6IFwiICsgc3RhdHVzKTtcbiAgICAgICAgJGNvcmRvdmFUb2FzdC5zaG93TG9uZ0NlbnRlcignRGVyIHNrZXRlIGVuIGZlamwuLi4uJyk7XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNvdW50Q3RybDsiLCJ2YXIgbG9naW5DdHJsID0gZnVuY3Rpb24oJHNjb3BlLCAkcm9vdFNjb3BlLCAkc3RhdGUsICRodHRwLCAkY29yZG92YVRvYXN0LCAkZmlsdGVyLCBMb2dpbkZhY3RvcnksIFZhckZhY3RvcnkpIHtcbiAgJHNjb3BlLnVzZXIgPSB7XG4gICAgZGF0ZTogJGZpbHRlcignZGF0ZScpKG5ldyBEYXRlKCksICdkZC1NTS15eScpXG4gIH07XG5cbiAgJHNjb3BlLmxvZ2luID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHJhd0RhdGUgPSAkc2NvcGUudXNlci5kYXRlLnJlcGxhY2UoLy0vZywgXCJcIik7XG5cbiAgICBMb2dpbkZhY3Rvcnkuc2lnbkluKCRzY29wZS51c2VyLmlkLCByYXdEYXRlKS50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgaWYgKHJlcy5zdGF0dXMgPT0gMjAwKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKHJlcyk7XG4gICAgICAgIFZhckZhY3Rvcnkuc2V0VmFyKFwibG9jYXRpb25UeXBlXCIsIHJlcy5kYXRhLkxvY2F0aW9uVHlwZUlEKTtcbiAgICAgICAgVmFyRmFjdG9yeS5zZXRWYXIoXCJ1c2VyTmFtZVwiLCByZXMuZGF0YS5OYW1lKTtcbiAgICAgICAgVmFyRmFjdG9yeS5zZXRWYXIoXCJ0YXNrU3RhcnRcIiwgcmVzLmRhdGEuVGltZUZyb20pO1xuICAgICAgICBWYXJGYWN0b3J5LnNldFZhcihcInRhc2tFbmRcIiwgcmVzLmRhdGEuVGltZVRvKTtcbiAgICAgICAgVmFyRmFjdG9yeS5zZXRWYXIoXCJsb2NhdGlvblwiLCByZXMuZGF0YS5Mb2NhdGlvbklEKTtcbiAgICAgICAgVmFyRmFjdG9yeS5zZXRWYXIoXCJ0YXNrXCIsIHJlcy5kYXRhLlRhc2tJRCk7XG4gICAgICAgICRyb290U2NvcGUudXNlckRhdGUgPSAkc2NvcGUudXNlci5kYXRlO1xuICAgICAgICAkcm9vdFNjb3BlLnVzZXJJZCA9IHJlcy5kYXRhLlVzZXJJRDtcbiAgICAgICAgJHN0YXRlLmdvKFwidGFiLmNvdW50XCIpO1xuICAgICAgfSBcbiAgICAgIGVsc2UgaWYgKHJlcy5zdGF0dXMgPT0gNDA0KSB7XG4gICAgICAgIGNvbnNvbGUubG9nKHJlcy5kYXRhLCByZXMuc3RhdHVzKTtcbiAgICAgICAgY29uc29sZS5sb2coXCJCYWQgUmVxdWVzdFwiKTtcbiAgICAgICAgJGNvcmRvdmFUb2FzdC5zaG93TG9uZ0JvdHRvbShcIkZvcmtlcnQgSUQgZWxsZXIgRGF0b1wiKTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKHJlcy5zdGF0dXMgPT0gNDAwKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKHJlcy5kYXRhLCByZXMuc3RhdHVzKTtcbiAgICAgICAgY29uc29sZS5sb2coXCJVc2VyIGlkIGlzIGJsYW5rXCIpO1xuICAgICAgICAkY29yZG92YVRvYXN0LnNob3dMb25nQm90dG9tKFwiQnJ1Z2VyIElEIG1hbmdsZXJcIik7XG4gICAgICB9XG4gICAgfSk7XG4gICAgY29uc29sZS5sb2coXCJMb2dpbiwgSUQ6IFwiICsgJHNjb3BlLnVzZXIuaWQgKyBcIiAtIERhdGU6IFwiICsgJHNjb3BlLnVzZXIuZGF0ZSk7XG4gIH07XG5cbiAgZnVuY3Rpb24gZGVzdG9yeVVzZXJDcmVkZW50aWFscygpIHtcbiAgICB2YXJGYWN0b3J5LmRlbGV0ZVZhcihcIlwiKTtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBsb2dpbkN0cmw7IiwidmFyIHNldHRpbmdzQ3RybCA9IGZ1bmN0aW9uKCRzY29wZSwgQ291bnRGYWN0b3J5LCBWYXJGYWN0b3J5KSB7XG4gICRzY29wZS5zZXR0aW5ncyA9IHt9O1xuXG4gICRzY29wZS5nZXRDb3VudEhpc3RvcnkgPSBmdW5jdGlvbigpIHtcbiAgICBjb25zb2xlLmxvZygnR2V0dGluZyBIaXN0b3J5IScpO1xuICAgIENvdW50RmFjdG9yeS5nZXRIaXN0b3J5KFZhckZhY3RvcnkuZ2V0VmFyKCd0YXNrJykpLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICBpZiAocmVzLnN0YXR1cyA9PSAyMDApIHtcbiAgICAgICAgY29uc29sZS5sb2cocmVzLmRhdGEpO1xuICAgICAgICAkc2NvcGUuaGlzdG9yeSA9IHJlcy5kYXRhO1xuICAgICAgICBmaWx0ZXJIaXN0b3J5VGltZXMoKTtcbiAgICAgIH1cbiAgICAgIGlmIChyZXMuc3RhdHVzID09IDQwNCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIkhJU1RPUlkgTk9UIEZPVU5EIVwiKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcblxuICBmdW5jdGlvbiBmaWx0ZXJIaXN0b3J5VGltZXMoKSB7XG4gICAgJHNjb3BlLnRpbWVzID0gW107XG4gICAgYW5ndWxhci5mb3JFYWNoKCRzY29wZS5oaXN0b3J5LCBmdW5jdGlvbih2YWx1ZSwga2V5KSB7XG4gICAgICBpZiAoJHNjb3BlLnRpbWVzLmluZGV4T2YodmFsdWUuVGltZSkgPT0gLTEpIHtcbiAgICAgICAgJHNjb3BlLnRpbWVzLnB1c2godmFsdWUuVGltZSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAkc2NvcGUudGltZVNlbGVjdGVkID0gZnVuY3Rpb24oKSB7XG4gICAgY29uc29sZS5sb2coXCJ1cGRhdGVkIHRpbWUgdG86IFwiICsgJHNjb3BlLnNldHRpbmdzLnNlbGVjdGVkVGltZSk7XG4gIH07XG4gICRzY29wZS5nZXRDb3VudEhpc3RvcnkoKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gc2V0dGluZ3NDdHJsOyIsInZhciB1cmwgPSByZXF1aXJlKCcuLi8uLi9jb25maWcuanMnKS5hcGlVcmw7XG5cbnZhciBjYXRlZ29yeUZhY3RvcnkgPSBmdW5jdGlvbigkaHR0cCwgVmFyRmFjdG9yeSkge1xuICB2YXIgY2F0ZWdvcmllcyA9IFtdO1xuXG4gIGZ1bmN0aW9uIHNldENhdGVnb3JpZXMoYXJyYXkpIHtcbiAgICBjYXRlZ29yaWVzID0gYXJyYXk7XG4gIH1cblxuICBmdW5jdGlvbiBnZXRDYXRlZ29yaWVzKCkge1xuICAgIHJldHVybiBjYXRlZ29yaWVzO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0QWxsQ2F0ZWdvcmllcygpIHtcbiAgICB2YXIgbG9jYXRpb25UeXBlSWQgPSBWYXJGYWN0b3J5LmdldFZhcignbG9jYXRpb25UeXBlJyk7XG4gICAgcmV0dXJuICRodHRwKHtcbiAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICB1cmw6IHVybCArICdjYXRlZ29yaWVzLycgKyBsb2NhdGlvblR5cGVJZFxuICAgIH0pO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBnZXRBbGxDYXRlZ29yaWVzOiBnZXRBbGxDYXRlZ29yaWVzLFxuICAgIHNldENhdGVnb3JpZXM6IHNldENhdGVnb3JpZXMsXG4gICAgZ2V0Q2F0ZWdvcmllczogZ2V0Q2F0ZWdvcmllc1xuICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBjYXRlZ29yeUZhY3Rvcnk7IiwidmFyIHVybCA9IHJlcXVpcmUoJy4uLy4uL2NvbmZpZy5qcycpLmFwaVVybDtcblxudmFyIGNvdW50RmFjdG9yeSA9IGZ1bmN0aW9uKCRodHRwKSB7XG4gIHJldHVybiB7XG4gICAgc2VuZERhdGE6IHNlbmREYXRhLFxuICAgIGdldEhpc3Rvcnk6IGdldEhpc3RvcnlcbiAgfTtcblxuICBmdW5jdGlvbiBzZW5kRGF0YShjb3VudCkge1xuICAgIHJldHVybiAkaHR0cCh7XG4gICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgIHVybDogdXJsICsgJ3Bvc3QvY291bnQnLFxuICAgICAgZGF0YTogSlNPTi5zdHJpbmdpZnkoY291bnQpLFxuICAgICAgaGVhZGVyczoge1xuICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIFxuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0SGlzdG9yeSh0YXNraWQpIHtcbiAgICByZXR1cm4gJGh0dHAoe1xuICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgIHVybDogdXJsICsgJ2dldC9jb3VudC8nICsgdGFza2lkXG4gICAgfSk7XG4gIH1cblxuXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNvdW50RmFjdG9yeTsiLCJ2YXIgdXJsID0gcmVxdWlyZSgnLi4vLi4vY29uZmlnLmpzJykuYXBpVXJsO1xuXG52YXIgbG9naW5GYWN0b3J5ID0gZnVuY3Rpb24oJGh0dHApIHtcbiAgcmV0dXJuIHtcbiAgICBzaWduSW46IGZ1bmN0aW9uKGlkLCByYXdEYXRlKSB7XG4gICAgICByZXR1cm4gJGh0dHAoe1xuICAgICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgICB1cmw6IHVybCArICdsb2dpbi8nICsgcmF3RGF0ZSArICcvJyArIGlkXG4gICAgICB9KTtcbiAgICB9XG4gIH07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGxvZ2luRmFjdG9yeTsiLCJ2YXIgdmFyRmFjdG9yeSA9IGZ1bmN0aW9uKCl7XG4gIHJldHVybiB7XG4gICAgZ2V0VmFyOmdldFZhcixcbiAgICBzZXRWYXI6c2V0VmFyXG4gIH07XG5cbiAgZnVuY3Rpb24gZ2V0VmFyIChrZXkpIHtcbiAgICByZXR1cm4gd2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKGtleSk7XG4gIH1cblxuICBmdW5jdGlvbiBzZXRWYXIgKGtleSwgdmFsdWUpIHtcbiAgICBpZiAodHlwZW9mIHZhbHVlID09PSBcInVuZGVmaW5lZFwiKXtcbiAgICAgIHdpbmRvdy5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShrZXkpO1xuICAgIH0gXG4gICAgZWxzZSB7XG4gICAgICB3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0oa2V5LCB2YWx1ZSk7XG4gICAgfVxuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHZhckZhY3Rvcnk7IiwiLy9SZWdpc3RlciB0aGUgYW5ndWxhciBhcHAgbW9kdWxlXG52YXIga2F1bnRhID0gYW5ndWxhci5tb2R1bGUoJ2thdW50YScsIFtcbiAgICAnaW9uaWMnLFxuICAgICduZ0NvcmRvdmEnLFxuICAgICdpb25pYy10aW1lcGlja2VyJyxcbl0pO1xuXG4vL1JlZ2lzdGVyIGFuZ3VsYXIgY29tcG9uZW50c1xucmVxdWlyZSgnLi9uZ0Jvb3QnKShrYXVudGEpO1xuXG4vL1JlZ2lzdGVyIHRoZSBuYXZpZ2F0aW9uIHN0YXRlc1xucmVxdWlyZSgnLi9uYXZpZ2F0aW9uJykoa2F1bnRhKTtcblxua2F1bnRhLmNvbmZpZyhmdW5jdGlvbigkaHR0cFByb3ZpZGVyKSB7XG4gICRodHRwUHJvdmlkZXIuZGVmYXVsdHMuaGVhZGVycy5wb3N0WydDb250ZW50LVR5cGUnXSA9ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnO1xufSk7XG5cbmthdW50YS5ydW4oZnVuY3Rpb24oJGlvbmljUGxhdGZvcm0sICRyb290U2NvcGUpIHtcbiAgJGlvbmljUGxhdGZvcm0ucmVhZHkoZnVuY3Rpb24oKSB7XG4gICAgLy8gSGlkZSB0aGUgYWNjZXNzb3J5IGJhciBieSBkZWZhdWx0IChyZW1vdmUgdGhpcyB0byBzaG93IHRoZSBhY2Nlc3NvcnkgYmFyIGFib3ZlIHRoZSBrZXlib2FyZFxuICAgIC8vIGZvciBmb3JtIGlucHV0cylcbiAgICBpZiAod2luZG93LmNvcmRvdmEgJiYgd2luZG93LmNvcmRvdmEucGx1Z2lucyAmJiB3aW5kb3cuY29yZG92YS5wbHVnaW5zLktleWJvYXJkKSB7XG4gICAgICBjb3Jkb3ZhLnBsdWdpbnMuS2V5Ym9hcmQuaGlkZUtleWJvYXJkQWNjZXNzb3J5QmFyKHRydWUpO1xuICAgICAgY29yZG92YS5wbHVnaW5zLktleWJvYXJkLmRpc2FibGVTY3JvbGwodHJ1ZSk7XG5cbiAgICB9XG4gICAgaWYgKHdpbmRvdy5TdGF0dXNCYXIpIHtcbiAgICAgIC8vIG9yZy5hcGFjaGUuY29yZG92YS5zdGF0dXNiYXIgcmVxdWlyZWRcbiAgICAgIFN0YXR1c0Jhci5zdHlsZUxpZ2h0Q29udGVudCgpO1xuICAgIH1cbiAgfSk7XG5cbiAgJHJvb3RTY29wZS4kb24oXCIkc3RhdGVDaGFuZ2VTdGFydFwiLCBmdW5jdGlvbiAoZXZlbnQsIHRvU3RhdGUsIHRvUGFyYW1zLCBmcm9tU3RhdGUsIGZyb21QYXJhbXMpIHtcbiAgICBjb25zb2xlLmxvZyhcIiRzdGF0ZUNoYW5nZVN0YXJ0IVwiKTtcbiAgICBjb25zb2xlLmxvZyhcInRvU3RhdGU6IFwiICsgdG9TdGF0ZS5uYW1lICsgXCIsIGZyb21TdGF0ZTogXCIgKyBmcm9tU3RhdGUubmFtZSk7XG4gIH0pO1xufSk7IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihhcHApIHtcbiAgYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlciwgJHVybFJvdXRlclByb3ZpZGVyLCAkY29tcGlsZVByb3ZpZGVyKSB7XG4gICAgLy8gaWYgbm9uZSBvZiB0aGUgYWJvdmUgc3RhdGVzIGFyZSBtYXRjaGVkLCB1c2UgdGhpcyBhcyB0aGUgZmFsbGJhY2tcbiAgICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCcvdGFiL2xvZ2luJyk7XG5cbiAgICAvLyBzZXR1cCBhbiBhYnN0cmFjdCBzdGF0ZSBmb3IgdGhlIHRhYnMgZGlyZWN0aXZlXG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ3RhYicsIHtcbiAgICAgIHVybDogJy90YWInLFxuICAgICAgYWJzdHJhY3Q6IHRydWUsXG4gICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy90YWJzLmh0bWwnXG4gICAgfSk7XG5cbiAgXG4gICAgLy8gRWFjaCB0YWIgaGFzIGl0cyBvd24gbmF2IGhpc3Rvcnkgc3RhY2s6XG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ3RhYi5sb2dpbicsIHtcbiAgICAgIHVybDogJy9sb2dpbicsXG4gICAgICB2aWV3czoge1xuICAgICAgICAndGFiLWxvZ2luJzoge1xuICAgICAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL3RhYi1sb2dpbi5odG1sJyxcbiAgICAgICAgICBjb250cm9sbGVyOiAnTG9naW5DdHJsJ1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgndGFiLmNvdW50Jywge1xuICAgICAgdXJsOiAnL2NvdW50JyxcbiAgICAgIHZpZXdzOiB7XG4gICAgICAgICd0YWItY291bnQnOiB7XG4gICAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvdGFiLWNvdW50Lmh0bWwnLFxuICAgICAgICAgIGNvbnRyb2xsZXI6ICdDb3VudEN0cmwnXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcblxuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCd0YWIuY2F0ZWdvcnktZGV0YWlsJywge1xuICAgICAgdXJsOiAnL2NvdW50LzpjYXRlZ29yeUlkJyxcbiAgICAgIHZpZXdzOiB7XG4gICAgICAgICd0YWItY291bnQnOiB7XG4gICAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvY2F0ZWdvcnktZGV0YWlsLmh0bWwnLFxuICAgICAgICAgIGNvbnRyb2xsZXI6ICdDYXRlZ29yeURldGFpbEN0cmwnXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcblxuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCd0YWIuc2V0dGluZ3MnLCB7XG4gICAgICB1cmw6ICcvc2V0dGluZ3MnLFxuICAgICAgdmlld3M6IHtcbiAgICAgICAgJ3RhYi1zZXR0aW5ncyc6IHtcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy90YWItc2V0dGluZ3MuaHRtbCcsXG4gICAgICAgICAgY29udHJvbGxlcjogJ1NldHRpbmdzQ3RybCdcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9KTtcbn07IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihhcHApIHtcbiAgLy9Db250cm9sbGVyc1xuICBhcHAuY29udHJvbGxlcignTG9naW5DdHJsJywgcmVxdWlyZSgnLi9jb250cm9sbGVycy9Mb2dpbkN0cmwnKSk7XG4gIGFwcC5jb250cm9sbGVyKCdDb3VudEN0cmwnLCByZXF1aXJlKCcuL2NvbnRyb2xsZXJzL0NvdW50Q3RybCcpKTtcbiAgYXBwLmNvbnRyb2xsZXIoJ0NhdGVnb3J5RGV0YWlsQ3RybCcsIHJlcXVpcmUoJy4vY29udHJvbGxlcnMvQ2F0ZWdvcnlEZXRhaWxDdHJsJykpO1xuICBhcHAuY29udHJvbGxlcignU2V0dGluZ3NDdHJsJywgcmVxdWlyZSgnLi9jb250cm9sbGVycy9TZXR0aW5nc0N0cmwnKSk7XG5cbiAgLy9GYWN0b3JpZXNcbiAgYXBwLmZhY3RvcnkoJ0NhdGVnb3J5RmFjdG9yeScsIHJlcXVpcmUoJy4vZmFjdG9yaWVzL0NhdGVnb3J5RmFjdG9yeScpKTtcbiAgYXBwLmZhY3RvcnkoJ0xvZ2luRmFjdG9yeScsIHJlcXVpcmUoJy4vZmFjdG9yaWVzL0xvZ2luRmFjdG9yeScpKTtcbiAgYXBwLmZhY3RvcnkoJ1ZhckZhY3RvcnknLCByZXF1aXJlKCcuL2ZhY3Rvcmllcy9WYXJGYWN0b3J5JykpO1xuICBhcHAuZmFjdG9yeSgnQ291bnRGYWN0b3J5JywgcmVxdWlyZSgnLi9mYWN0b3JpZXMvQ291bnRGYWN0b3J5JykpO1xufTsiXX0=
