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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJ3d3cvY29uZmlnLmpzIiwid3d3L2pzL2NvbnRyb2xsZXJzL0NhdGVnb3J5RGV0YWlsQ3RybC5qcyIsInd3dy9qcy9jb250cm9sbGVycy9Db3VudEN0cmwuanMiLCJ3d3cvanMvY29udHJvbGxlcnMvTG9naW5DdHJsLmpzIiwid3d3L2pzL2NvbnRyb2xsZXJzL1NldHRpbmdzQ3RybC5qcyIsInd3dy9qcy9mYWN0b3JpZXMvQ2F0ZWdvcnlGYWN0b3J5LmpzIiwid3d3L2pzL2ZhY3Rvcmllcy9Db3VudEZhY3RvcnkuanMiLCJ3d3cvanMvZmFjdG9yaWVzL0xvZ2luRmFjdG9yeS5qcyIsInd3dy9qcy9mYWN0b3JpZXMvVmFyRmFjdG9yeS5qcyIsInd3dy9qcy9tYWluIiwid3d3L2pzL25hdmlnYXRpb24uanMiLCJ3d3cvanMvbmdCb290LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwibW9kdWxlLmV4cG9ydHMgPSB7XG4gIC8vXCJhcGlVcmxcIiA6IFwiaHR0cDovL2xvY2FsaG9zdC90cmFmaWsvU2xpbS9pbmRleC5waHAvXCJcbiAgXCJhcGlVcmxcIiA6IFwiaHR0cDovL2pvbmFzamEuZGsvU2xpbS9pbmRleC5waHAvXCJcbn07IiwidmFyIGNhdGVnb3J5RGV0YWlsQ3RybCA9IGZ1bmN0aW9uKCRzY29wZSwgJHN0YXRlUGFyYW1zLCBjYXRlZ29yaWVzKSB7XG4gICRzY29wZS5jYXRlZ29yeSA9IGNhdGVnb3JpZXMuZ2V0KCRzdGF0ZVBhcmFtcy5jYXRlZ29yeUlkKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gY2F0ZWdvcnlEZXRhaWxDdHJsOyIsInZhciBjb3VudEN0cmwgPSBmdW5jdGlvbigkc2NvcGUsICRyb290U2NvcGUsICRmaWx0ZXIsIENhdGVnb3J5RmFjdG9yeSwgQ291bnRGYWN0b3J5LCBWYXJGYWN0b3J5LCAkaW9uaWNQbGF0Zm9ybSwgJGlvbmljUG9wdXAsICRjb3Jkb3ZhVG9hc3QsICRodHRwKSB7XG4gICRzY29wZS4kb24oXCIkaW9uaWNWaWV3LmVudGVyXCIsIGZ1bmN0aW9uKHNjb3Blcywgc3RhdGVzKSB7XG4gICAgaWYoc3RhdGVzLnN0YXRlTmFtZSA9PSBcInRhYi5jb3VudFwiKSB7XG4gICAgICAkc2NvcGUudGhpc0NvdW50Lm5hbWUgPSBWYXJGYWN0b3J5LmdldFZhcigndXNlck5hbWUnKTtcbiAgICAgICRzY29wZS50aGlzQ291bnQuc3RhcnQgPSBWYXJGYWN0b3J5LmdldFZhcigndGFza1N0YXJ0Jyk7XG4gICAgICAkc2NvcGUudGhpc0NvdW50LmVuZCA9IFZhckZhY3RvcnkuZ2V0VmFyKCd0YXNrRW5kJyk7XG4gICAgICBpZiAodHlwZW9mICgkc2NvcGUuY2F0ZWdvcmllcykgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICRzY29wZS5nZXRDYXRlZ29yeURhdGEoKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gICRzY29wZS5nZXRDYXRlZ29yeURhdGEgPSBmdW5jdGlvbigpIHtcbiAgICBDYXRlZ29yeUZhY3RvcnkuZ2V0QWxsQ2F0ZWdvcmllcygpLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICBpZiAocmVzLnN0YXR1cyA9PSAyMDApIHtcbiAgICAgICAgJHNjb3BlLmNhdGVnb3JpZXMgPSByZXMuZGF0YTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICAkY29yZG92YVRvYXN0LnNob3dMb25nQm90dG9tKFwiRGVyIHNrZXRlIGVuIGZlamwuLi5cIik7XG4gICAgICB9XG4gICAgfSk7XG4gIH07XG5cbiAgJHNjb3BlLnRoaXNDb3VudCA9IHtcbiAgICBkYXRlOiAkcm9vdFNjb3BlLnVzZXJEYXRlLFxuICAgIHVzZXJpZDogJHJvb3RTY29wZS51c2VySWRcbiAgfTtcblxuICAkc2NvcGUudG9nZ2xlSW5mbyA9IGZ1bmN0aW9uKGNhdGVnb3J5KSB7XG4gICAgaWYgKCRzY29wZS5pc0luZm9TaG93bihjYXRlZ29yeSkpIHtcbiAgICAgICRzY29wZS5zaG93bkluZm8gPSBudWxsO1xuICAgIH0gZWxzZSB7XG4gICAgICAkc2NvcGUuc2hvd25JbmZvID0gY2F0ZWdvcnk7XG4gICAgfVxuICB9O1xuXG4gICRzY29wZS5pc0luZm9TaG93biA9IGZ1bmN0aW9uKGNhdGVnb3J5KSB7XG4gICAgcmV0dXJuICRzY29wZS5zaG93bkluZm8gPT09IGNhdGVnb3J5O1xuICB9O1xuXG4gICRzY29wZS5ub3RlID0gZnVuY3Rpb24oY2F0ZWdvcnkpIHtcbiAgICB2YXIgbXlQb3B1cCA9ICRpb25pY1BvcHVwLnByb21wdCh7XG4gICAgICB0aXRsZTogJ05vdGUgdGlsIGthdGVnb3JpJyxcbiAgICAgIGlucHV0VHlwZTogJ3RleHQnLFxuICAgICAgY2FuY2VsVGV4dDogJ0FubnVsbGVyJyxcbiAgICAgIGNhbmNlbFR5cGU6ICdidXR0b24tYXNzZXJ0aXZlJyxcbiAgICAgIG9rVGV4dDogJ0dlbScsXG4gICAgICBva1R5cGU6ICdidXR0b24tYmFsYW5jZWQnXG4gICAgfSk7XG4gICAgaWYgKHR5cGVvZiAoY2F0ZWdvcnkubm90ZSkgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBteVBvcHVwLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgIGNhdGVnb3J5Lm5vdGUgPSByZXM7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgbXlQb3B1cC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICBpZiAodHlwZW9mIChyZXMpID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjYXRlZ29yeS5ub3RlID0gcmVzO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG5cbiAgJHNjb3BlLm1pbnVzID0gZnVuY3Rpb24oY2F0ZWdvcnkpIHtcbiAgICBpZiAodHlwZW9mIChjYXRlZ29yeS5jb3VudCkgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBjYXRlZ29yeS5jb3VudCA9IDA7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChjYXRlZ29yeS5jb3VudCA+PSAxKSB7XG4gICAgICAgIGNhdGVnb3J5LmNvdW50LS07XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gICRzY29wZS5wbHVzID0gZnVuY3Rpb24oY2F0ZWdvcnkpIHtcbiAgICBpZiAodHlwZW9mIChjYXRlZ29yeS5jb3VudCkgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBjYXRlZ29yeS5jb3VudCA9IDE7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNhdGVnb3J5LmNvdW50Kys7XG4gICAgfVxuICB9O1xuXG4gICRzY29wZS50aW1lUGlja2VyT2JqZWN0ID0ge1xuICAgIGlucHV0RXBvY2hUaW1lOiAoKG5ldyBEYXRlKCkpLmdldEhvdXJzKCkgKiA2MCAqIDYwKSxcbiAgICBzdGVwOiAxNSxcbiAgICBmb3JtYXQ6IDI0LFxuICAgIHNldExhYmVsOiAnVsOmbGcnLFxuICAgIGNsb3NlTGFiZWw6ICdMdWsnLFxuICAgIHNldEJ1dHRvblR5cGU6ICdidXR0b24tYmFsYW5jZWQnLFxuICAgIGNsb3NlQnV0dHBuVHlwZTogJ2J1dHRvbi1zdGFibGUnLFxuICAgIGNhbGxiYWNrOiBmdW5jdGlvbiAodmFsKSB7XG4gICAgICBjb25zb2xlLmxvZygndmFsOiAnICsgKG5ldyBEYXRlKCkuZ2V0SG91cnMoKSAqIDYwICogNjApKTtcbiAgICAgICRzY29wZS50aW1lUGlja2VyQ2FsbGJhY2sodmFsKTtcbiAgICB9XG4gIH07XG5cbiAgJHNjb3BlLnRpbWVQaWNrZXJDYWxsYmFjayA9IGZ1bmN0aW9uICh2YWwpIHtcbiAgICBpZiAodHlwZW9mICh2YWwpID09PSAndW5kZWZpbmVkJykge1xuICAgICAgY29uc29sZS5sb2coJ1RpbWUgbm90IHNlbGVjdGVkJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgICRzY29wZS50aW1lUGlja2VyID0gbmV3IERhdGUoKHZhbCAqIDEwMDApLSgzNjAwICogMTAwMCkpO1xuICAgICAgJHNjb3BlLnNlbGVjdGVkVGltZSA9ICRmaWx0ZXIoJ2RhdGUnKSgkc2NvcGUudGltZVBpY2tlciwgJ0hIOm1tJyk7XG4gICAgICAkc2NvcGUuaG91cnMgPSAkc2NvcGUudGltZVBpY2tlci5nZXRIb3VycygpO1xuICAgICAgJHNjb3BlLm1pbnV0ZXMgPSAkc2NvcGUudGltZVBpY2tlci5nZXRNaW51dGVzKCk7XG4gICAgICBpZiAoJHNjb3BlLmhvdXJzLnRvU3RyaW5nKCkubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICRzY29wZS5ob3VycyA9ICgnMCcgKyAkc2NvcGUuaG91cnMpO1xuICAgICAgfVxuICAgICAgaWYgKCRzY29wZS5taW51dGVzID09PSAwKSB7XG4gICAgICAgICRzY29wZS5taW51dGVzID0gJzAwJztcbiAgICAgIH0gXG4gICAgICBjb25zb2xlLmxvZygnU2VsZWN0ZWQgdGltZSBpczogJyArICRzY29wZS5ob3VycyArICc6JyArICRzY29wZS5taW51dGVzKTtcbiAgICB9XG4gIH07XG5cbiAgZnVuY3Rpb24gcmVzZXRDb3VudCgpIHtcbiAgICBjb25zb2xlLmxvZyhcInJlc2V0dGluZyFcIik7XG4gICAgJHNjb3BlLmNhdGVnb3JpZXMuZm9yRWFjaChmdW5jdGlvbihjYXQpIHtcbiAgICAgIGNhdC5jb3VudCA9IDA7XG4gICAgfSk7XG4gIH1cblxuICAkc2NvcGUuc2VuZERhdGEgPSBmdW5jdGlvbiAoZm9ybSkge1xuICAgIGlmIChmb3JtLiR2YWxpZCkge1xuICAgICAgJHNjb3BlLmNhdGVnb3JpZXMuZm9yRWFjaChmdW5jdGlvbihjYXQpIHtcbiAgICAgICAgaWYgKHR5cGVvZiAoY2F0LmNvdW50KSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICBjYXQuY291bnQgPSAwO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgICRzY29wZS50aGlzQ291bnQuaG91ciA9ICRzY29wZS5ob3VycztcbiAgICAgICRzY29wZS50aGlzQ291bnQubWludXQgPSAkc2NvcGUubWludXRlcztcbiAgICAgICRzY29wZS50aGlzQ291bnQubG9jVHlwZSA9IFZhckZhY3RvcnkuZ2V0VmFyKCdsb2NhdGlvblR5cGUnKTtcbiAgICAgICRzY29wZS50aGlzQ291bnQubG9jID0gVmFyRmFjdG9yeS5nZXRWYXIoJ2xvY2F0aW9uJyk7XG4gICAgICAkc2NvcGUudGhpc0NvdW50LnRhc2sgPSBWYXJGYWN0b3J5LmdldFZhcigndGFzaycpO1xuICAgICAgJHNjb3BlLnRoaXNDb3VudC5jYXRlZ29yaWVzID0gJHNjb3BlLmNhdGVnb3JpZXM7XG4gICAgICAvL2NvbnNvbGUubG9nKCckc2NvcGUuY2F0ZWdvcmllczogJyArIEpTT04uc3RyaW5naWZ5KCRzY29wZS50aGlzQ291bnQuY2F0ZWdvcmllcywgbnVsbCwgMikpO1xuICAgICAgLy9jb25zb2xlLmxvZygnc2VuZERhdGEgLT4gXFxuJyArIEpTT04uc3RyaW5naWZ5KCRzY29wZS50aGlzQ291bnQsIG51bGwsIDIpKTtcbiAgICAgIC8vY29uc29sZS5sb2coJHNjb3BlLnRoaXNDb3VudCk7XG4gICAgICBDb3VudEZhY3Rvcnkuc2VuZERhdGEoJHNjb3BlLnRoaXNDb3VudCkudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgaWYgKHJlcy5zdGF0dXMgPT0gMjAwKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coc3RhdHVzKTtcbiAgICAgICAgICAkY29yZG92YVRvYXN0LnNob3dMb25nQ2VudGVyKCdEaW4gZGF0YSBlciBnZW10Li4uLicpO1xuICAgICAgICAgIHJlc2V0Q291bnQoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocmVzLnN0YXR1cyA9PSA0MDQpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhzdGF0dXMpO1xuICAgICAgICAgICRjb3Jkb3ZhVG9hc3Quc2hvd0xvbmdDZW50ZXIoJ0RpbiBkYXRhIGJsZXYgSUtLRSBnZW10IScpO1xuICAgICAgICB9XG4gICAgICB9LCBmdW5jdGlvbihkYXRhLCBzdGF0dXMpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJzZW5kRGF0YS5FcnJvciAtPiBkYXRhOiBcIiArIGRhdGEgKyBcIiwgc3RhdHVzOiBcIiArIHN0YXR1cyk7XG4gICAgICAgICRjb3Jkb3ZhVG9hc3Quc2hvd0xvbmdDZW50ZXIoJ0RlciBza2V0ZSBlbiBmZWpsLi4uLicpO1xuICAgICAgfSk7XG4gICAgfVxuICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBjb3VudEN0cmw7IiwidmFyIGxvZ2luQ3RybCA9IGZ1bmN0aW9uKCRzY29wZSwgJHJvb3RTY29wZSwgJHN0YXRlLCAkaHR0cCwgJGNvcmRvdmFUb2FzdCwgJGZpbHRlciwgTG9naW5GYWN0b3J5LCBWYXJGYWN0b3J5KSB7XG4gICRzY29wZS51c2VyID0ge1xuICAgIGRhdGU6ICRmaWx0ZXIoJ2RhdGUnKShuZXcgRGF0ZSgpLCAnZGQtTU0teXknKVxuICB9O1xuXG4gICRzY29wZS5sb2dpbiA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciByYXdEYXRlID0gJHNjb3BlLnVzZXIuZGF0ZS5yZXBsYWNlKC8tL2csIFwiXCIpO1xuXG4gICAgTG9naW5GYWN0b3J5LnNpZ25Jbigkc2NvcGUudXNlci5pZCwgcmF3RGF0ZSkudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgIGlmIChyZXMuc3RhdHVzID09IDIwMCkge1xuICAgICAgICBjb25zb2xlLmxvZyhyZXMpO1xuICAgICAgICBWYXJGYWN0b3J5LnNldFZhcihcImxvY2F0aW9uVHlwZVwiLCByZXMuZGF0YS5Mb2NhdGlvblR5cGVJRCk7XG4gICAgICAgIFZhckZhY3Rvcnkuc2V0VmFyKFwidXNlck5hbWVcIiwgcmVzLmRhdGEuTmFtZSk7XG4gICAgICAgIFZhckZhY3Rvcnkuc2V0VmFyKFwidGFza1N0YXJ0XCIsIHJlcy5kYXRhLlRpbWVGcm9tKTtcbiAgICAgICAgVmFyRmFjdG9yeS5zZXRWYXIoXCJ0YXNrRW5kXCIsIHJlcy5kYXRhLlRpbWVUbyk7XG4gICAgICAgIFZhckZhY3Rvcnkuc2V0VmFyKFwibG9jYXRpb25cIiwgcmVzLmRhdGEuTG9jYXRpb25JRCk7XG4gICAgICAgIFZhckZhY3Rvcnkuc2V0VmFyKFwidGFza1wiLCByZXMuZGF0YS5UYXNrSUQpO1xuICAgICAgICAkcm9vdFNjb3BlLnVzZXJEYXRlID0gJHNjb3BlLnVzZXIuZGF0ZTtcbiAgICAgICAgJHJvb3RTY29wZS51c2VySWQgPSByZXMuZGF0YS5Vc2VySUQ7XG4gICAgICAgICRzdGF0ZS5nbyhcInRhYi5jb3VudFwiKTtcbiAgICAgIH0gXG4gICAgICBlbHNlIGlmIChyZXMuc3RhdHVzID09IDQwNCkge1xuICAgICAgICBjb25zb2xlLmxvZyhyZXMuZGF0YSwgcmVzLnN0YXR1cyk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiQmFkIFJlcXVlc3RcIik7XG4gICAgICAgICRjb3Jkb3ZhVG9hc3Quc2hvd0xvbmdCb3R0b20oXCJGb3JrZXJ0IElEIGVsbGVyIERhdG9cIik7XG4gICAgICB9XG4gICAgICBlbHNlIGlmIChyZXMuc3RhdHVzID09IDQwMCkge1xuICAgICAgICBjb25zb2xlLmxvZyhyZXMuZGF0YSwgcmVzLnN0YXR1cyk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiVXNlciBpZCBpcyBibGFua1wiKTtcbiAgICAgICAgJGNvcmRvdmFUb2FzdC5zaG93TG9uZ0JvdHRvbShcIkJydWdlciBJRCBtYW5nbGVyXCIpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGNvbnNvbGUubG9nKFwiTG9naW4sIElEOiBcIiArICRzY29wZS51c2VyLmlkICsgXCIgLSBEYXRlOiBcIiArICRzY29wZS51c2VyLmRhdGUpO1xuICB9O1xuXG4gIGZ1bmN0aW9uIGRlc3RvcnlVc2VyQ3JlZGVudGlhbHMoKSB7XG4gICAgdmFyRmFjdG9yeS5kZWxldGVWYXIoXCJcIik7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gbG9naW5DdHJsOyIsInZhciBzZXR0aW5nc0N0cmwgPSBmdW5jdGlvbigkc2NvcGUsIENvdW50RmFjdG9yeSwgVmFyRmFjdG9yeSkge1xuICAkc2NvcGUuc2V0dGluZ3MgPSB7fTtcblxuICBmdW5jdGlvbiBpbml0KCkge1xuICAgICRzY29wZS5nZXRDb3VudEhpc3RvcnkoKTtcbiAgfVxuXG4gICRzY29wZS5nZXRDb3VudEhpc3RvcnkgPSBmdW5jdGlvbigpIHtcbiAgICBjb25zb2xlLmxvZygnR2V0dGluZyBIaXN0b3J5IScpO1xuICAgIENvdW50RmFjdG9yeS5nZXRIaXN0b3J5KFZhckZhY3RvcnkuZ2V0VmFyKCd0YXNrJykpLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICBpZiAocmVzLnN0YXR1cyA9PSAyMDApIHtcbiAgICAgICAgY29uc29sZS5sb2cocmVzLmRhdGEpO1xuICAgICAgICAkc2NvcGUuaGlzdG9yeSA9IHJlcy5kYXRhO1xuICAgICAgICBmaWx0ZXJIaXN0b3J5VGltZXMoKTtcbiAgICAgIH1cbiAgICAgIGlmIChyZXMuc3RhdHVzID09IDQwNCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcIkhJU1RPUlkgTk9UIEZPVU5EIVwiKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcblxuICBmdW5jdGlvbiBmaWx0ZXJIaXN0b3J5VGltZXMoKSB7XG4gICAgJHNjb3BlLnRpbWVzID0gW107XG4gICAgYW5ndWxhci5mb3JFYWNoKCRzY29wZS5oaXN0b3J5LCBmdW5jdGlvbih2YWx1ZSwga2V5KSB7XG4gICAgICBpZiAoJHNjb3BlLnRpbWVzLmluZGV4T2YodmFsdWUuVGltZSkgPT0gLTEpIHtcbiAgICAgICAgJHNjb3BlLnRpbWVzLnB1c2godmFsdWUuVGltZSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAkc2NvcGUudGltZVNlbGVjdGVkID0gZnVuY3Rpb24oKSB7XG4gICAgY29uc29sZS5sb2coXCJ1cGRhdGVkIHRpbWUgdG86IFwiICsgJHNjb3BlLnNldHRpbmdzLnNlbGVjdGVkVGltZSk7XG4gIH07XG4gIFxuICBpbml0KCk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHNldHRpbmdzQ3RybDsiLCJ2YXIgdXJsID0gcmVxdWlyZSgnLi4vLi4vY29uZmlnLmpzJykuYXBpVXJsO1xuXG52YXIgY2F0ZWdvcnlGYWN0b3J5ID0gZnVuY3Rpb24oJGh0dHAsIFZhckZhY3RvcnkpIHtcbiAgdmFyIGNhdGVnb3JpZXMgPSBbXTtcblxuICBmdW5jdGlvbiBzZXRDYXRlZ29yaWVzKGFycmF5KSB7XG4gICAgY2F0ZWdvcmllcyA9IGFycmF5O1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0Q2F0ZWdvcmllcygpIHtcbiAgICByZXR1cm4gY2F0ZWdvcmllcztcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldEFsbENhdGVnb3JpZXMoKSB7XG4gICAgdmFyIGxvY2F0aW9uVHlwZUlkID0gVmFyRmFjdG9yeS5nZXRWYXIoJ2xvY2F0aW9uVHlwZScpO1xuICAgIHJldHVybiAkaHR0cCh7XG4gICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgdXJsOiB1cmwgKyAnY2F0ZWdvcmllcy8nICsgbG9jYXRpb25UeXBlSWRcbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgZ2V0QWxsQ2F0ZWdvcmllczogZ2V0QWxsQ2F0ZWdvcmllcyxcbiAgICBzZXRDYXRlZ29yaWVzOiBzZXRDYXRlZ29yaWVzLFxuICAgIGdldENhdGVnb3JpZXM6IGdldENhdGVnb3JpZXNcbiAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gY2F0ZWdvcnlGYWN0b3J5OyIsInZhciB1cmwgPSByZXF1aXJlKCcuLi8uLi9jb25maWcuanMnKS5hcGlVcmw7XG5cbnZhciBjb3VudEZhY3RvcnkgPSBmdW5jdGlvbigkaHR0cCkge1xuICByZXR1cm4ge1xuICAgIHNlbmREYXRhOiBzZW5kRGF0YSxcbiAgICBnZXRIaXN0b3J5OiBnZXRIaXN0b3J5XG4gIH07XG5cbiAgZnVuY3Rpb24gc2VuZERhdGEoY291bnQpIHtcbiAgICByZXR1cm4gJGh0dHAoe1xuICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICB1cmw6IHVybCArICdwb3N0L2NvdW50JyxcbiAgICAgIGRhdGE6IEpTT04uc3RyaW5naWZ5KGNvdW50KSxcbiAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyBcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldEhpc3RvcnkodGFza2lkKSB7XG4gICAgcmV0dXJuICRodHRwKHtcbiAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICB1cmw6IHVybCArICdnZXQvY291bnQvJyArIHRhc2tpZFxuICAgIH0pO1xuICB9XG5cblxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBjb3VudEZhY3Rvcnk7IiwidmFyIHVybCA9IHJlcXVpcmUoJy4uLy4uL2NvbmZpZy5qcycpLmFwaVVybDtcblxudmFyIGxvZ2luRmFjdG9yeSA9IGZ1bmN0aW9uKCRodHRwKSB7XG4gIHJldHVybiB7XG4gICAgc2lnbkluOiBmdW5jdGlvbihpZCwgcmF3RGF0ZSkge1xuICAgICAgcmV0dXJuICRodHRwKHtcbiAgICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgICAgdXJsOiB1cmwgKyAnbG9naW4vJyArIHJhd0RhdGUgKyAnLycgKyBpZFxuICAgICAgfSk7XG4gICAgfVxuICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBsb2dpbkZhY3Rvcnk7IiwidmFyIHZhckZhY3RvcnkgPSBmdW5jdGlvbigpe1xuICByZXR1cm4ge1xuICAgIGdldFZhcjpnZXRWYXIsXG4gICAgc2V0VmFyOnNldFZhclxuICB9O1xuXG4gIGZ1bmN0aW9uIGdldFZhciAoa2V5KSB7XG4gICAgcmV0dXJuIHdpbmRvdy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbShrZXkpO1xuICB9XG5cbiAgZnVuY3Rpb24gc2V0VmFyIChrZXksIHZhbHVlKSB7XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJ1bmRlZmluZWRcIil7XG4gICAgICB3aW5kb3cubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oa2V5KTtcbiAgICB9IFxuICAgIGVsc2Uge1xuICAgICAgd2luZG93LmxvY2FsU3RvcmFnZS5zZXRJdGVtKGtleSwgdmFsdWUpO1xuICAgIH1cbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSB2YXJGYWN0b3J5OyIsIi8vUmVnaXN0ZXIgdGhlIGFuZ3VsYXIgYXBwIG1vZHVsZVxudmFyIGthdW50YSA9IGFuZ3VsYXIubW9kdWxlKCdrYXVudGEnLCBbXG4gICAgJ2lvbmljJyxcbiAgICAnbmdDb3Jkb3ZhJyxcbiAgICAnaW9uaWMtdGltZXBpY2tlcicsXG5dKTtcblxuLy9SZWdpc3RlciBhbmd1bGFyIGNvbXBvbmVudHNcbnJlcXVpcmUoJy4vbmdCb290Jykoa2F1bnRhKTtcblxuLy9SZWdpc3RlciB0aGUgbmF2aWdhdGlvbiBzdGF0ZXNcbnJlcXVpcmUoJy4vbmF2aWdhdGlvbicpKGthdW50YSk7XG5cbmthdW50YS5jb25maWcoZnVuY3Rpb24oJGh0dHBQcm92aWRlcikge1xuICAkaHR0cFByb3ZpZGVyLmRlZmF1bHRzLmhlYWRlcnMucG9zdFsnQ29udGVudC1UeXBlJ10gPSAnYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkJztcbn0pO1xuXG5rYXVudGEucnVuKGZ1bmN0aW9uKCRpb25pY1BsYXRmb3JtLCAkcm9vdFNjb3BlKSB7XG4gICRpb25pY1BsYXRmb3JtLnJlYWR5KGZ1bmN0aW9uKCkge1xuICAgIC8vIEhpZGUgdGhlIGFjY2Vzc29yeSBiYXIgYnkgZGVmYXVsdCAocmVtb3ZlIHRoaXMgdG8gc2hvdyB0aGUgYWNjZXNzb3J5IGJhciBhYm92ZSB0aGUga2V5Ym9hcmRcbiAgICAvLyBmb3IgZm9ybSBpbnB1dHMpXG4gICAgaWYgKHdpbmRvdy5jb3Jkb3ZhICYmIHdpbmRvdy5jb3Jkb3ZhLnBsdWdpbnMgJiYgd2luZG93LmNvcmRvdmEucGx1Z2lucy5LZXlib2FyZCkge1xuICAgICAgY29yZG92YS5wbHVnaW5zLktleWJvYXJkLmhpZGVLZXlib2FyZEFjY2Vzc29yeUJhcih0cnVlKTtcbiAgICAgIGNvcmRvdmEucGx1Z2lucy5LZXlib2FyZC5kaXNhYmxlU2Nyb2xsKHRydWUpO1xuXG4gICAgfVxuICAgIGlmICh3aW5kb3cuU3RhdHVzQmFyKSB7XG4gICAgICAvLyBvcmcuYXBhY2hlLmNvcmRvdmEuc3RhdHVzYmFyIHJlcXVpcmVkXG4gICAgICBTdGF0dXNCYXIuc3R5bGVMaWdodENvbnRlbnQoKTtcbiAgICB9XG4gIH0pO1xuXG4gICRyb290U2NvcGUuJG9uKFwiJHN0YXRlQ2hhbmdlU3RhcnRcIiwgZnVuY3Rpb24gKGV2ZW50LCB0b1N0YXRlLCB0b1BhcmFtcywgZnJvbVN0YXRlLCBmcm9tUGFyYW1zKSB7XG4gICAgY29uc29sZS5sb2coXCIkc3RhdGVDaGFuZ2VTdGFydCFcIik7XG4gICAgY29uc29sZS5sb2coXCJ0b1N0YXRlOiBcIiArIHRvU3RhdGUubmFtZSArIFwiLCBmcm9tU3RhdGU6IFwiICsgZnJvbVN0YXRlLm5hbWUpO1xuICB9KTtcbn0pOyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oYXBwKSB7XG4gIGFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIsICR1cmxSb3V0ZXJQcm92aWRlciwgJGNvbXBpbGVQcm92aWRlcikge1xuICAgIC8vIGlmIG5vbmUgb2YgdGhlIGFib3ZlIHN0YXRlcyBhcmUgbWF0Y2hlZCwgdXNlIHRoaXMgYXMgdGhlIGZhbGxiYWNrXG4gICAgJHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZSgnL3RhYi9sb2dpbicpO1xuXG4gICAgLy8gc2V0dXAgYW4gYWJzdHJhY3Qgc3RhdGUgZm9yIHRoZSB0YWJzIGRpcmVjdGl2ZVxuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCd0YWInLCB7XG4gICAgICB1cmw6ICcvdGFiJyxcbiAgICAgIGFic3RyYWN0OiB0cnVlLFxuICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvdGFicy5odG1sJ1xuICAgIH0pO1xuXG4gIFxuICAgIC8vIEVhY2ggdGFiIGhhcyBpdHMgb3duIG5hdiBoaXN0b3J5IHN0YWNrOlxuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCd0YWIubG9naW4nLCB7XG4gICAgICB1cmw6ICcvbG9naW4nLFxuICAgICAgdmlld3M6IHtcbiAgICAgICAgJ3RhYi1sb2dpbic6IHtcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy90YWItbG9naW4uaHRtbCcsXG4gICAgICAgICAgY29udHJvbGxlcjogJ0xvZ2luQ3RybCdcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ3RhYi5jb3VudCcsIHtcbiAgICAgIHVybDogJy9jb3VudCcsXG4gICAgICB2aWV3czoge1xuICAgICAgICAndGFiLWNvdW50Jzoge1xuICAgICAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL3RhYi1jb3VudC5odG1sJyxcbiAgICAgICAgICBjb250cm9sbGVyOiAnQ291bnRDdHJsJ1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgndGFiLmNhdGVnb3J5LWRldGFpbCcsIHtcbiAgICAgIHVybDogJy9jb3VudC86Y2F0ZWdvcnlJZCcsXG4gICAgICB2aWV3czoge1xuICAgICAgICAndGFiLWNvdW50Jzoge1xuICAgICAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL2NhdGVnb3J5LWRldGFpbC5odG1sJyxcbiAgICAgICAgICBjb250cm9sbGVyOiAnQ2F0ZWdvcnlEZXRhaWxDdHJsJ1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgndGFiLnNldHRpbmdzJywge1xuICAgICAgdXJsOiAnL3NldHRpbmdzJyxcbiAgICAgIHZpZXdzOiB7XG4gICAgICAgICd0YWItc2V0dGluZ3MnOiB7XG4gICAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvdGFiLXNldHRpbmdzLmh0bWwnLFxuICAgICAgICAgIGNvbnRyb2xsZXI6ICdTZXR0aW5nc0N0cmwnXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG59OyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oYXBwKSB7XG4gIC8vQ29udHJvbGxlcnNcbiAgYXBwLmNvbnRyb2xsZXIoJ0xvZ2luQ3RybCcsIHJlcXVpcmUoJy4vY29udHJvbGxlcnMvTG9naW5DdHJsJykpO1xuICBhcHAuY29udHJvbGxlcignQ291bnRDdHJsJywgcmVxdWlyZSgnLi9jb250cm9sbGVycy9Db3VudEN0cmwnKSk7XG4gIGFwcC5jb250cm9sbGVyKCdDYXRlZ29yeURldGFpbEN0cmwnLCByZXF1aXJlKCcuL2NvbnRyb2xsZXJzL0NhdGVnb3J5RGV0YWlsQ3RybCcpKTtcbiAgYXBwLmNvbnRyb2xsZXIoJ1NldHRpbmdzQ3RybCcsIHJlcXVpcmUoJy4vY29udHJvbGxlcnMvU2V0dGluZ3NDdHJsJykpO1xuXG4gIC8vRmFjdG9yaWVzXG4gIGFwcC5mYWN0b3J5KCdDYXRlZ29yeUZhY3RvcnknLCByZXF1aXJlKCcuL2ZhY3Rvcmllcy9DYXRlZ29yeUZhY3RvcnknKSk7XG4gIGFwcC5mYWN0b3J5KCdMb2dpbkZhY3RvcnknLCByZXF1aXJlKCcuL2ZhY3Rvcmllcy9Mb2dpbkZhY3RvcnknKSk7XG4gIGFwcC5mYWN0b3J5KCdWYXJGYWN0b3J5JywgcmVxdWlyZSgnLi9mYWN0b3JpZXMvVmFyRmFjdG9yeScpKTtcbiAgYXBwLmZhY3RvcnkoJ0NvdW50RmFjdG9yeScsIHJlcXVpcmUoJy4vZmFjdG9yaWVzL0NvdW50RmFjdG9yeScpKTtcbn07Il19
