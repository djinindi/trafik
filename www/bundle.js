(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = {
  "apiUrl" : "http://localhost/trafik/Slim/index.php/"
  //"apiUrl" : "http://jonasja.dk/Slim/index.php/"
};
},{}],2:[function(require,module,exports){
var categoryDetailCtrl = function($scope, $stateParams, categories) {
  $scope.category = categories.get($stateParams.categoryId);
};

module.exports = categoryDetailCtrl;
},{}],3:[function(require,module,exports){
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
},{"../../config.js":1}],4:[function(require,module,exports){
var loginCtrl = function($scope, $rootScope, $state, $http, $cordovaToast, $filter, LoginFactory, VarFactory) {
  $scope.user = {
    date: $filter('date')(new Date(), 'd-MM-yy')
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
    });
    console.log("Login, ID: " + $scope.user.id + " - Date: " + $scope.user.date);
  };
};

module.exports = loginCtrl;
},{}],5:[function(require,module,exports){
var settingsCtrl = function($scope) {
  $scope.settings = {};
  function uploadData() {
    console.log('Uploading!');
  }
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

  function getAllCategories(callback) {
    var locationTypeId = VarFactory.getVar('locationType');
    $http({
      method: 'POST',
      url: url + 'categories',
      data: 'locationtypeid=' + 4
    }).then(function(res){
      callback(res);
    }, function(err) {
      console.log('Mega ERROR', err);
    });
  }

  function resultToCat(res) {
    categories = [];
    var jsonData = res.data;
    var jsonKeys = Object.keys(jsonData);
    for (var i = 0; i < jsonKeys.length; i++) {
      var jsonSingle = jsonData[jsonKeys[i]];
      categories.push(jsonSingle);
    }
  }

  function getTaskCategories(locID) {
    console.log("getTaskCats: " + locID);
    var catsRes = $http({
      method: 'POST',
      url: url + 'categories',
      data: 'locationtypeid=' + locID 
    });
    catsRes.then(function(res) {
      resultToCat(res);
    });
    return categories;
  }

  return {
    getTaskCategories: getTaskCategories,
    resultToCat: resultToCat,
    getAllCategories: getAllCategories,
    all: function() {
      return categories;
    },
    remove: function(category) {
      categories.splice(categories.indexOf(category), 1);
    },
    get: function(categoryId) {
      for (var i = 0; i < categories.length; i++) {
        if (categories[i].id === parseInt(categoryId)) {
          return categories[i];
        }
      }
      return null;
    }
  };
};

module.exports = categoryFactory;
},{"../../config.js":1}],7:[function(require,module,exports){
var url = require('../../config.js').apiUrl;

var loginFactory = function($http) {
  return {
    signIn: function(id, rawDate) {
      return $http({
        method: 'POST',
        url: url + 'login',
        data: 'userid=' + id + '&date=' + rawDate
      });
    }
  };


};

module.exports = loginFactory;
},{"../../config.js":1}],8:[function(require,module,exports){
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
},{}],9:[function(require,module,exports){
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

kaunta.run(function($ionicPlatform) {
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
});
},{"./navigation":10,"./ngBoot":11}],10:[function(require,module,exports){
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
},{}],11:[function(require,module,exports){
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
};
},{"./controllers/CategoryDetailCtrl":2,"./controllers/CountCtrl":3,"./controllers/LoginCtrl":4,"./controllers/SettingsCtrl":5,"./factories/CategoryFactory":6,"./factories/LoginFactory":7,"./factories/VarFactory":8}]},{},[9])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJ3d3cvY29uZmlnLmpzIiwid3d3L2pzL2NvbnRyb2xsZXJzL0NhdGVnb3J5RGV0YWlsQ3RybC5qcyIsInd3dy9qcy9jb250cm9sbGVycy9Db3VudEN0cmwuanMiLCJ3d3cvanMvY29udHJvbGxlcnMvTG9naW5DdHJsLmpzIiwid3d3L2pzL2NvbnRyb2xsZXJzL1NldHRpbmdzQ3RybC5qcyIsInd3dy9qcy9mYWN0b3JpZXMvQ2F0ZWdvcnlGYWN0b3J5LmpzIiwid3d3L2pzL2ZhY3Rvcmllcy9Mb2dpbkZhY3RvcnkuanMiLCJ3d3cvanMvZmFjdG9yaWVzL1ZhckZhY3RvcnkuanMiLCJ3d3cvanMvbWFpbiIsInd3dy9qcy9uYXZpZ2F0aW9uLmpzIiwid3d3L2pzL25nQm9vdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBOztBQ0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBcImFwaVVybFwiIDogXCJodHRwOi8vbG9jYWxob3N0L3RyYWZpay9TbGltL2luZGV4LnBocC9cIlxuICAvL1wiYXBpVXJsXCIgOiBcImh0dHA6Ly9qb25hc2phLmRrL1NsaW0vaW5kZXgucGhwL1wiXG59OyIsInZhciBjYXRlZ29yeURldGFpbEN0cmwgPSBmdW5jdGlvbigkc2NvcGUsICRzdGF0ZVBhcmFtcywgY2F0ZWdvcmllcykge1xuICAkc2NvcGUuY2F0ZWdvcnkgPSBjYXRlZ29yaWVzLmdldCgkc3RhdGVQYXJhbXMuY2F0ZWdvcnlJZCk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNhdGVnb3J5RGV0YWlsQ3RybDsiLCJ2YXIgdXJsID0gcmVxdWlyZSgnLi4vLi4vY29uZmlnLmpzJykuYXBpVXJsO1xudmFyIGNvdW50Q3RybCA9IGZ1bmN0aW9uKCRzY29wZSwgJHJvb3RTY29wZSwgJGZpbHRlciwgQ2F0ZWdvcnlGYWN0b3J5LCBWYXJGYWN0b3J5LCAkaW9uaWNQbGF0Zm9ybSwgJGNvcmRvdmFUb2FzdCwgJGh0dHApIHtcbiAgJHNjb3BlLiRvbihcIiRpb25pY1ZpZXcuZW50ZXJcIiwgZnVuY3Rpb24oc2NvcGVzLCBzdGF0ZXMpIHtcbiAgICBpZihzdGF0ZXMuZnJvbUNhY2hlICYmIHN0YXRlcy5zdGF0ZU5hbWUgPT0gXCJ0YWIuY291bnRcIikge1xuICAgICAgJHNjb3BlLnRoaXNDb3VudC5uYW1lID0gVmFyRmFjdG9yeS5nZXRWYXIoJ3VzZXJOYW1lJyk7XG4gICAgICAkc2NvcGUudGhpc0NvdW50LnN0YXJ0ID0gVmFyRmFjdG9yeS5nZXRWYXIoJ3Rhc2tTdGFydCcpO1xuICAgICAgJHNjb3BlLnRoaXNDb3VudC5lbmQgPSBWYXJGYWN0b3J5LmdldFZhcigndGFza0VuZCcpO1xuICAgICAgaWYgKHR5cGVvZiAoJHNjb3BlLmNhdGVnb3JpZXMpID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAkc2NvcGUuZ2V0Q2F0ZWdvcnlEYXRhKCk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICAkc2NvcGUuZ2V0Q2F0ZWdvcnlEYXRhID0gZnVuY3Rpb24oKSB7XG4gICAgQ2F0ZWdvcnlGYWN0b3J5LmdldEFsbENhdGVnb3JpZXMoZnVuY3Rpb24oY2F0cykge1xuICAgICAgJHNjb3BlLmNhdGVnb3JpZXMgPSBjYXRzLmRhdGE7XG4gICAgfSk7XG4gIH07XG5cbiAgJHNjb3BlLnRoaXNDb3VudCA9IHtcbiAgICBkYXRlOiAkcm9vdFNjb3BlLnVzZXJEYXRlLFxuICAgIHVzZXJpZDogJHJvb3RTY29wZS51c2VySWRcbiAgfTtcblxuICAkc2NvcGUudG9nZ2xlSW5mbyA9IGZ1bmN0aW9uKGNhdGVnb3J5KSB7XG4gICAgaWYgKCRzY29wZS5pc0luZm9TaG93bihjYXRlZ29yeSkpIHtcbiAgICAgICRzY29wZS5zaG93bkluZm8gPSBudWxsO1xuICAgIH0gZWxzZSB7XG4gICAgICAkc2NvcGUuc2hvd25JbmZvID0gY2F0ZWdvcnk7XG4gICAgfVxuICB9O1xuXG4gICRzY29wZS5pc0luZm9TaG93biA9IGZ1bmN0aW9uKGNhdGVnb3J5KSB7XG4gICAgcmV0dXJuICRzY29wZS5zaG93bkluZm8gPT09IGNhdGVnb3J5O1xuICB9O1xuXG4gICRzY29wZS5taW51cyA9IGZ1bmN0aW9uKGNhdGVnb3J5KSB7XG4gICAgaWYgKHR5cGVvZiAoY2F0ZWdvcnkuY291bnQpID09PSAndW5kZWZpbmVkJykge1xuICAgICAgY2F0ZWdvcnkuY291bnQgPSAwO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoY2F0ZWdvcnkuY291bnQgPj0gMSkge1xuICAgICAgICBjYXRlZ29yeS5jb3VudC0tO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICAkc2NvcGUucGx1cyA9IGZ1bmN0aW9uKGNhdGVnb3J5KSB7XG4gICAgaWYgKHR5cGVvZiAoY2F0ZWdvcnkuY291bnQpID09PSAndW5kZWZpbmVkJykge1xuICAgICAgY2F0ZWdvcnkuY291bnQgPSAxO1xuICAgIH0gZWxzZSB7XG4gICAgICBjYXRlZ29yeS5jb3VudCsrO1xuICAgIH1cbiAgfTtcblxuICAkc2NvcGUudGltZVBpY2tlck9iamVjdCA9IHtcbiAgICBpbnB1dEVwb2NoVGltZTogKChuZXcgRGF0ZSgpKS5nZXRIb3VycygpICogNjAgKiA2MCksXG4gICAgc3RlcDogMTUsXG4gICAgZm9ybWF0OiAyNCxcbiAgICBzZXRMYWJlbDogJ1bDpmxnJyxcbiAgICBjbG9zZUxhYmVsOiAnTHVrJyxcbiAgICBzZXRCdXR0b25UeXBlOiAnYnV0dG9uLWJhbGFuY2VkJyxcbiAgICBjbG9zZUJ1dHRwblR5cGU6ICdidXR0b24tc3RhYmxlJyxcbiAgICBjYWxsYmFjazogZnVuY3Rpb24gKHZhbCkge1xuICAgICAgY29uc29sZS5sb2coJ3ZhbDogJyArIChuZXcgRGF0ZSgpLmdldEhvdXJzKCkgKiA2MCAqIDYwKSk7XG4gICAgICAkc2NvcGUudGltZVBpY2tlckNhbGxiYWNrKHZhbCk7XG4gICAgfVxuICB9O1xuXG4gICRzY29wZS50aW1lUGlja2VyQ2FsbGJhY2sgPSBmdW5jdGlvbiAodmFsKSB7XG4gICAgaWYgKHR5cGVvZiAodmFsKSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdUaW1lIG5vdCBzZWxlY3RlZCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICAkc2NvcGUudGltZVBpY2tlciA9IG5ldyBEYXRlKCh2YWwgKiAxMDAwKS0oMzYwMCAqIDEwMDApKTtcbiAgICAgICRzY29wZS5zZWxlY3RlZFRpbWUgPSAkZmlsdGVyKCdkYXRlJykoJHNjb3BlLnRpbWVQaWNrZXIsICdISDptbScpO1xuICAgICAgJHNjb3BlLmhvdXJzID0gJHNjb3BlLnRpbWVQaWNrZXIuZ2V0SG91cnMoKTtcbiAgICAgICRzY29wZS5taW51dGVzID0gJHNjb3BlLnRpbWVQaWNrZXIuZ2V0TWludXRlcygpO1xuXG4gICAgICBjb25zb2xlLmxvZygnU2VsZWN0ZWQgdGltZSBpczogJyArICRzY29wZS5ob3VycyArICc6JyArICRzY29wZS5taW51dGVzKTtcbiAgICB9XG4gIH07XG5cbiAgJHNjb3BlLnNlbmREYXRhID0gZnVuY3Rpb24gKGZvcm0pIHtcbiAgICBpZiAoZm9ybS4kdmFsaWQpIHtcbiAgICAgICRzY29wZS5jYXRlZ29yaWVzLmZvckVhY2goZnVuY3Rpb24oY2F0KSB7XG4gICAgICAgIGlmICh0eXBlb2YgKGNhdC5jb3VudCkgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgY2F0LmNvdW50ID0gMDtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICAkc2NvcGUudGhpc0NvdW50LmhvdXIgPSAkc2NvcGUuaG91cnM7XG4gICAgICAkc2NvcGUudGhpc0NvdW50Lm1pbnV0ID0gJHNjb3BlLm1pbnV0ZXM7XG4gICAgICAkc2NvcGUudGhpc0NvdW50LmxvY1R5cGUgPSBWYXJGYWN0b3J5LmdldFZhcignbG9jYXRpb25UeXBlJyk7XG4gICAgICAkc2NvcGUudGhpc0NvdW50LmxvYyA9IFZhckZhY3RvcnkuZ2V0VmFyKCdsb2NhdGlvbicpO1xuICAgICAgJHNjb3BlLnRoaXNDb3VudC50YXNrID0gVmFyRmFjdG9yeS5nZXRWYXIoJ3Rhc2snKTtcbiAgICAgICRzY29wZS50aGlzQ291bnQuY2F0ZWdvcmllcyA9ICRzY29wZS5jYXRlZ29yaWVzO1xuICAgICAgLy9jb25zb2xlLmxvZygnJHNjb3BlLmNhdGVnb3JpZXM6ICcgKyBKU09OLnN0cmluZ2lmeSgkc2NvcGUudGhpc0NvdW50LmNhdGVnb3JpZXMsIG51bGwsIDIpKTtcbiAgICAgIGNvbnNvbGUubG9nKCdzZW5kRGF0YSAtPiBcXG4nICsgSlNPTi5zdHJpbmdpZnkoJHNjb3BlLnRoaXNDb3VudCwgbnVsbCwgMikpO1xuICAgICAgJGh0dHAoe1xuICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgdXJsOiB1cmwgKyAnc2VuZENvdW50JyxcbiAgICAgICAgZGF0YTogJHNjb3BlLnRoaXNDb3VudCxcbiAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgXG4gICAgICAgIH1cbiAgICAgIH0pLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgIC8vY29uc29sZS5sb2coJ3NlbmREYXRhIC0+ICcsIHJlcyk7XG4gICAgICB9KTtcbiAgICAgICRjb3Jkb3ZhVG9hc3Quc2hvd0xvbmdDZW50ZXIoJ0RpbiBkYXRhIGVyIGdlbXQuLi4nKTtcbiAgICB9XG4gIH07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNvdW50Q3RybDsiLCJ2YXIgbG9naW5DdHJsID0gZnVuY3Rpb24oJHNjb3BlLCAkcm9vdFNjb3BlLCAkc3RhdGUsICRodHRwLCAkY29yZG92YVRvYXN0LCAkZmlsdGVyLCBMb2dpbkZhY3RvcnksIFZhckZhY3RvcnkpIHtcbiAgJHNjb3BlLnVzZXIgPSB7XG4gICAgZGF0ZTogJGZpbHRlcignZGF0ZScpKG5ldyBEYXRlKCksICdkLU1NLXl5JylcbiAgfTtcblxuICAkc2NvcGUubG9naW4gPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgcmF3RGF0ZSA9ICRzY29wZS51c2VyLmRhdGUucmVwbGFjZSgvLS9nLCBcIlwiKTtcblxuICAgIExvZ2luRmFjdG9yeS5zaWduSW4oJHNjb3BlLnVzZXIuaWQsIHJhd0RhdGUpLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICBpZiAocmVzLnN0YXR1cyA9PSAyMDApIHtcbiAgICAgICAgY29uc29sZS5sb2cocmVzKTtcbiAgICAgICAgVmFyRmFjdG9yeS5zZXRWYXIoXCJsb2NhdGlvblR5cGVcIiwgcmVzLmRhdGEuTG9jYXRpb25UeXBlSUQpO1xuICAgICAgICBWYXJGYWN0b3J5LnNldFZhcihcInVzZXJOYW1lXCIsIHJlcy5kYXRhLk5hbWUpO1xuICAgICAgICBWYXJGYWN0b3J5LnNldFZhcihcInRhc2tTdGFydFwiLCByZXMuZGF0YS5UaW1lRnJvbSk7XG4gICAgICAgIFZhckZhY3Rvcnkuc2V0VmFyKFwidGFza0VuZFwiLCByZXMuZGF0YS5UaW1lVG8pO1xuICAgICAgICBWYXJGYWN0b3J5LnNldFZhcihcImxvY2F0aW9uXCIsIHJlcy5kYXRhLkxvY2F0aW9uSUQpO1xuICAgICAgICBWYXJGYWN0b3J5LnNldFZhcihcInRhc2tcIiwgcmVzLmRhdGEuVGFza0lEKTtcbiAgICAgICAgJHJvb3RTY29wZS51c2VyRGF0ZSA9ICRzY29wZS51c2VyLmRhdGU7XG4gICAgICAgICRyb290U2NvcGUudXNlcklkID0gcmVzLmRhdGEuVXNlcklEO1xuICAgICAgICAkc3RhdGUuZ28oXCJ0YWIuY291bnRcIik7XG4gICAgICB9IFxuICAgICAgZWxzZSBpZiAocmVzLnN0YXR1cyA9PSA0MDQpIHtcbiAgICAgICAgY29uc29sZS5sb2cocmVzLmRhdGEsIHJlcy5zdGF0dXMpO1xuICAgICAgICBjb25zb2xlLmxvZyhcIkJhZCBSZXF1ZXN0XCIpO1xuICAgICAgICAkY29yZG92YVRvYXN0LnNob3dMb25nQm90dG9tKFwiRm9ya2VydCBJRCBlbGxlciBEYXRvXCIpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGNvbnNvbGUubG9nKFwiTG9naW4sIElEOiBcIiArICRzY29wZS51c2VyLmlkICsgXCIgLSBEYXRlOiBcIiArICRzY29wZS51c2VyLmRhdGUpO1xuICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBsb2dpbkN0cmw7IiwidmFyIHNldHRpbmdzQ3RybCA9IGZ1bmN0aW9uKCRzY29wZSkge1xuICAkc2NvcGUuc2V0dGluZ3MgPSB7fTtcbiAgZnVuY3Rpb24gdXBsb2FkRGF0YSgpIHtcbiAgICBjb25zb2xlLmxvZygnVXBsb2FkaW5nIScpO1xuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHNldHRpbmdzQ3RybDsiLCJ2YXIgdXJsID0gcmVxdWlyZSgnLi4vLi4vY29uZmlnLmpzJykuYXBpVXJsO1xuXG52YXIgY2F0ZWdvcnlGYWN0b3J5ID0gZnVuY3Rpb24oJGh0dHAsIFZhckZhY3RvcnkpIHtcbiAgdmFyIGNhdGVnb3JpZXMgPSBbXTtcblxuICBmdW5jdGlvbiBzZXRDYXRlZ29yaWVzKGFycmF5KSB7XG4gICAgY2F0ZWdvcmllcyA9IGFycmF5O1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0Q2F0ZWdvcmllcygpIHtcbiAgICByZXR1cm4gY2F0ZWdvcmllcztcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldEFsbENhdGVnb3JpZXMoY2FsbGJhY2spIHtcbiAgICB2YXIgbG9jYXRpb25UeXBlSWQgPSBWYXJGYWN0b3J5LmdldFZhcignbG9jYXRpb25UeXBlJyk7XG4gICAgJGh0dHAoe1xuICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICB1cmw6IHVybCArICdjYXRlZ29yaWVzJyxcbiAgICAgIGRhdGE6ICdsb2NhdGlvbnR5cGVpZD0nICsgNFxuICAgIH0pLnRoZW4oZnVuY3Rpb24ocmVzKXtcbiAgICAgIGNhbGxiYWNrKHJlcyk7XG4gICAgfSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICBjb25zb2xlLmxvZygnTWVnYSBFUlJPUicsIGVycik7XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiByZXN1bHRUb0NhdChyZXMpIHtcbiAgICBjYXRlZ29yaWVzID0gW107XG4gICAgdmFyIGpzb25EYXRhID0gcmVzLmRhdGE7XG4gICAgdmFyIGpzb25LZXlzID0gT2JqZWN0LmtleXMoanNvbkRhdGEpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwganNvbktleXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBqc29uU2luZ2xlID0ganNvbkRhdGFbanNvbktleXNbaV1dO1xuICAgICAgY2F0ZWdvcmllcy5wdXNoKGpzb25TaW5nbGUpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGdldFRhc2tDYXRlZ29yaWVzKGxvY0lEKSB7XG4gICAgY29uc29sZS5sb2coXCJnZXRUYXNrQ2F0czogXCIgKyBsb2NJRCk7XG4gICAgdmFyIGNhdHNSZXMgPSAkaHR0cCh7XG4gICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgIHVybDogdXJsICsgJ2NhdGVnb3JpZXMnLFxuICAgICAgZGF0YTogJ2xvY2F0aW9udHlwZWlkPScgKyBsb2NJRCBcbiAgICB9KTtcbiAgICBjYXRzUmVzLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICByZXN1bHRUb0NhdChyZXMpO1xuICAgIH0pO1xuICAgIHJldHVybiBjYXRlZ29yaWVzO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBnZXRUYXNrQ2F0ZWdvcmllczogZ2V0VGFza0NhdGVnb3JpZXMsXG4gICAgcmVzdWx0VG9DYXQ6IHJlc3VsdFRvQ2F0LFxuICAgIGdldEFsbENhdGVnb3JpZXM6IGdldEFsbENhdGVnb3JpZXMsXG4gICAgYWxsOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBjYXRlZ29yaWVzO1xuICAgIH0sXG4gICAgcmVtb3ZlOiBmdW5jdGlvbihjYXRlZ29yeSkge1xuICAgICAgY2F0ZWdvcmllcy5zcGxpY2UoY2F0ZWdvcmllcy5pbmRleE9mKGNhdGVnb3J5KSwgMSk7XG4gICAgfSxcbiAgICBnZXQ6IGZ1bmN0aW9uKGNhdGVnb3J5SWQpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2F0ZWdvcmllcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoY2F0ZWdvcmllc1tpXS5pZCA9PT0gcGFyc2VJbnQoY2F0ZWdvcnlJZCkpIHtcbiAgICAgICAgICByZXR1cm4gY2F0ZWdvcmllc1tpXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBjYXRlZ29yeUZhY3Rvcnk7IiwidmFyIHVybCA9IHJlcXVpcmUoJy4uLy4uL2NvbmZpZy5qcycpLmFwaVVybDtcblxudmFyIGxvZ2luRmFjdG9yeSA9IGZ1bmN0aW9uKCRodHRwKSB7XG4gIHJldHVybiB7XG4gICAgc2lnbkluOiBmdW5jdGlvbihpZCwgcmF3RGF0ZSkge1xuICAgICAgcmV0dXJuICRodHRwKHtcbiAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgIHVybDogdXJsICsgJ2xvZ2luJyxcbiAgICAgICAgZGF0YTogJ3VzZXJpZD0nICsgaWQgKyAnJmRhdGU9JyArIHJhd0RhdGVcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcblxuXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGxvZ2luRmFjdG9yeTsiLCJ2YXIgdmFyRmFjdG9yeSA9IGZ1bmN0aW9uKCl7XG4gIHJldHVybiB7XG4gICAgZ2V0VmFyOmdldFZhcixcbiAgICBzZXRWYXI6c2V0VmFyXG4gIH07XG5cbiAgZnVuY3Rpb24gZ2V0VmFyIChrZXkpIHtcbiAgICByZXR1cm4gd2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKGtleSk7XG4gIH1cblxuICBmdW5jdGlvbiBzZXRWYXIgKGtleSwgdmFsdWUpIHtcbiAgICBpZiAodHlwZW9mIHZhbHVlID09PSBcInVuZGVmaW5lZFwiKXtcbiAgICAgIHdpbmRvdy5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShrZXkpO1xuICAgIH0gXG4gICAgZWxzZSB7XG4gICAgICB3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0oa2V5LCB2YWx1ZSk7XG4gICAgfVxuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHZhckZhY3Rvcnk7IiwiLy9SZWdpc3RlciB0aGUgYW5ndWxhciBhcHAgbW9kdWxlXG52YXIga2F1bnRhID0gYW5ndWxhci5tb2R1bGUoJ2thdW50YScsIFtcbiAgICAnaW9uaWMnLFxuICAgICduZ0NvcmRvdmEnLFxuICAgICdpb25pYy10aW1lcGlja2VyJyxcbl0pO1xuXG4vL1JlZ2lzdGVyIGFuZ3VsYXIgY29tcG9uZW50c1xucmVxdWlyZSgnLi9uZ0Jvb3QnKShrYXVudGEpO1xuXG4vL1JlZ2lzdGVyIHRoZSBuYXZpZ2F0aW9uIHN0YXRlc1xucmVxdWlyZSgnLi9uYXZpZ2F0aW9uJykoa2F1bnRhKTtcblxua2F1bnRhLmNvbmZpZyhmdW5jdGlvbigkaHR0cFByb3ZpZGVyKSB7XG4gICRodHRwUHJvdmlkZXIuZGVmYXVsdHMuaGVhZGVycy5wb3N0WydDb250ZW50LVR5cGUnXSA9ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnO1xufSk7XG5cbmthdW50YS5ydW4oZnVuY3Rpb24oJGlvbmljUGxhdGZvcm0pIHtcbiAgJGlvbmljUGxhdGZvcm0ucmVhZHkoZnVuY3Rpb24oKSB7XG4gICAgLy8gSGlkZSB0aGUgYWNjZXNzb3J5IGJhciBieSBkZWZhdWx0IChyZW1vdmUgdGhpcyB0byBzaG93IHRoZSBhY2Nlc3NvcnkgYmFyIGFib3ZlIHRoZSBrZXlib2FyZFxuICAgIC8vIGZvciBmb3JtIGlucHV0cylcbiAgICBpZiAod2luZG93LmNvcmRvdmEgJiYgd2luZG93LmNvcmRvdmEucGx1Z2lucyAmJiB3aW5kb3cuY29yZG92YS5wbHVnaW5zLktleWJvYXJkKSB7XG4gICAgICBjb3Jkb3ZhLnBsdWdpbnMuS2V5Ym9hcmQuaGlkZUtleWJvYXJkQWNjZXNzb3J5QmFyKHRydWUpO1xuICAgICAgY29yZG92YS5wbHVnaW5zLktleWJvYXJkLmRpc2FibGVTY3JvbGwodHJ1ZSk7XG5cbiAgICB9XG4gICAgaWYgKHdpbmRvdy5TdGF0dXNCYXIpIHtcbiAgICAgIC8vIG9yZy5hcGFjaGUuY29yZG92YS5zdGF0dXNiYXIgcmVxdWlyZWRcbiAgICAgIFN0YXR1c0Jhci5zdHlsZUxpZ2h0Q29udGVudCgpO1xuICAgIH1cbiAgfSk7XG59KTsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGFwcCkge1xuICBhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyLCAkdXJsUm91dGVyUHJvdmlkZXIsICRjb21waWxlUHJvdmlkZXIpIHtcbiAgICAvLyBpZiBub25lIG9mIHRoZSBhYm92ZSBzdGF0ZXMgYXJlIG1hdGNoZWQsIHVzZSB0aGlzIGFzIHRoZSBmYWxsYmFja1xuICAgICR1cmxSb3V0ZXJQcm92aWRlci5vdGhlcndpc2UoJy90YWIvbG9naW4nKTtcblxuICAgIC8vIHNldHVwIGFuIGFic3RyYWN0IHN0YXRlIGZvciB0aGUgdGFicyBkaXJlY3RpdmVcbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgndGFiJywge1xuICAgICAgdXJsOiAnL3RhYicsXG4gICAgICBhYnN0cmFjdDogdHJ1ZSxcbiAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL3RhYnMuaHRtbCdcbiAgICB9KTtcblxuICBcbiAgICAvLyBFYWNoIHRhYiBoYXMgaXRzIG93biBuYXYgaGlzdG9yeSBzdGFjazpcbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgndGFiLmxvZ2luJywge1xuICAgICAgdXJsOiAnL2xvZ2luJyxcbiAgICAgIHZpZXdzOiB7XG4gICAgICAgICd0YWItbG9naW4nOiB7XG4gICAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvdGFiLWxvZ2luLmh0bWwnLFxuICAgICAgICAgIGNvbnRyb2xsZXI6ICdMb2dpbkN0cmwnXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcblxuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCd0YWIuY291bnQnLCB7XG4gICAgICB1cmw6ICcvY291bnQnLFxuICAgICAgdmlld3M6IHtcbiAgICAgICAgJ3RhYi1jb3VudCc6IHtcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy90YWItY291bnQuaHRtbCcsXG4gICAgICAgICAgY29udHJvbGxlcjogJ0NvdW50Q3RybCdcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ3RhYi5jYXRlZ29yeS1kZXRhaWwnLCB7XG4gICAgICB1cmw6ICcvY291bnQvOmNhdGVnb3J5SWQnLFxuICAgICAgdmlld3M6IHtcbiAgICAgICAgJ3RhYi1jb3VudCc6IHtcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9jYXRlZ29yeS1kZXRhaWwuaHRtbCcsXG4gICAgICAgICAgY29udHJvbGxlcjogJ0NhdGVnb3J5RGV0YWlsQ3RybCdcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ3RhYi5zZXR0aW5ncycsIHtcbiAgICAgIHVybDogJy9zZXR0aW5ncycsXG4gICAgICB2aWV3czoge1xuICAgICAgICAndGFiLXNldHRpbmdzJzoge1xuICAgICAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL3RhYi1zZXR0aW5ncy5odG1sJyxcbiAgICAgICAgICBjb250cm9sbGVyOiAnU2V0dGluZ3NDdHJsJ1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH0pO1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGFwcCkge1xuICAvL0NvbnRyb2xsZXJzXG4gIGFwcC5jb250cm9sbGVyKCdMb2dpbkN0cmwnLCByZXF1aXJlKCcuL2NvbnRyb2xsZXJzL0xvZ2luQ3RybCcpKTtcbiAgYXBwLmNvbnRyb2xsZXIoJ0NvdW50Q3RybCcsIHJlcXVpcmUoJy4vY29udHJvbGxlcnMvQ291bnRDdHJsJykpO1xuICBhcHAuY29udHJvbGxlcignQ2F0ZWdvcnlEZXRhaWxDdHJsJywgcmVxdWlyZSgnLi9jb250cm9sbGVycy9DYXRlZ29yeURldGFpbEN0cmwnKSk7XG4gIGFwcC5jb250cm9sbGVyKCdTZXR0aW5nc0N0cmwnLCByZXF1aXJlKCcuL2NvbnRyb2xsZXJzL1NldHRpbmdzQ3RybCcpKTtcblxuICAvL0ZhY3Rvcmllc1xuICBhcHAuZmFjdG9yeSgnQ2F0ZWdvcnlGYWN0b3J5JywgcmVxdWlyZSgnLi9mYWN0b3JpZXMvQ2F0ZWdvcnlGYWN0b3J5JykpO1xuICBhcHAuZmFjdG9yeSgnTG9naW5GYWN0b3J5JywgcmVxdWlyZSgnLi9mYWN0b3JpZXMvTG9naW5GYWN0b3J5JykpO1xuICBhcHAuZmFjdG9yeSgnVmFyRmFjdG9yeScsIHJlcXVpcmUoJy4vZmFjdG9yaWVzL1ZhckZhY3RvcnknKSk7XG59OyJdfQ==
