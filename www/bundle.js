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
var countCtrl = function($scope, $rootScope, $filter, CategoryFactory, CountFactory, VarFactory, $ionicPlatform, $cordovaToast, $http) {
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
      if ($scope.minutes === 0) {
        $scope.minutes = '00';
      }

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
      //console.log('sendData -> \n' + JSON.stringify($scope.thisCount, null, 2));
      //console.log($scope.thisCount);
      CountFactory.sendData($scope.thisCount).then(function(status) {
        console.log(status);
      }, function(data, status) {
        console.log("sendData.Error -> data: " + data + ", status: " + status);
      });
      $cordovaToast.showLongCenter('Din data er gemt....');
    }
  };
};

module.exports = countCtrl;
},{}],4:[function(require,module,exports){
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
      else if (res.status == 400) {
        console.log(res.data, res.status);
        console.log("User id is blank");
        $cordovaToast.showLongBottom("Bruger ID mangler");
      }
    });
    console.log("Login, ID: " + $scope.user.id + " - Date: " + $scope.user.date);
  };
};

module.exports = loginCtrl;
},{}],5:[function(require,module,exports){
var settingsCtrl = function($scope, CountFactory, VarFactory) {
  $scope.settings = {};

  $scope.getCountHistory = function() {
    console.log('Getting History!');
    CountFactory.getHistory(VarFactory.getVar('task')).then(function(res) {
      console.log(res.data);
      $scope.history = res.data;
      filterHistoryTimes();
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

  function getAllCategories(callback) {
    var locationTypeId = VarFactory.getVar('locationType');
    $http({
      method: 'GET',
      url: url + 'categories/' + locationTypeId
    }).then(function(res){
      callback(res);
    }, function(err) {
      console.log('Mega ERROR', err);
    });
  }

  return {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJ3d3cvY29uZmlnLmpzIiwid3d3L2pzL2NvbnRyb2xsZXJzL0NhdGVnb3J5RGV0YWlsQ3RybC5qcyIsInd3dy9qcy9jb250cm9sbGVycy9Db3VudEN0cmwuanMiLCJ3d3cvanMvY29udHJvbGxlcnMvTG9naW5DdHJsLmpzIiwid3d3L2pzL2NvbnRyb2xsZXJzL1NldHRpbmdzQ3RybC5qcyIsInd3dy9qcy9mYWN0b3JpZXMvQ2F0ZWdvcnlGYWN0b3J5LmpzIiwid3d3L2pzL2ZhY3Rvcmllcy9Db3VudEZhY3RvcnkuanMiLCJ3d3cvanMvZmFjdG9yaWVzL0xvZ2luRmFjdG9yeS5qcyIsInd3dy9qcy9mYWN0b3JpZXMvVmFyRmFjdG9yeS5qcyIsInd3dy9qcy9tYWluIiwid3d3L2pzL25hdmlnYXRpb24uanMiLCJ3d3cvanMvbmdCb290LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7O0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIm1vZHVsZS5leHBvcnRzID0ge1xuICAvL1wiYXBpVXJsXCIgOiBcImh0dHA6Ly9sb2NhbGhvc3QvdHJhZmlrL1NsaW0vaW5kZXgucGhwL1wiXG4gIFwiYXBpVXJsXCIgOiBcImh0dHA6Ly9qb25hc2phLmRrL1NsaW0vaW5kZXgucGhwL1wiXG59OyIsInZhciBjYXRlZ29yeURldGFpbEN0cmwgPSBmdW5jdGlvbigkc2NvcGUsICRzdGF0ZVBhcmFtcywgY2F0ZWdvcmllcykge1xuICAkc2NvcGUuY2F0ZWdvcnkgPSBjYXRlZ29yaWVzLmdldCgkc3RhdGVQYXJhbXMuY2F0ZWdvcnlJZCk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNhdGVnb3J5RGV0YWlsQ3RybDsiLCJ2YXIgY291bnRDdHJsID0gZnVuY3Rpb24oJHNjb3BlLCAkcm9vdFNjb3BlLCAkZmlsdGVyLCBDYXRlZ29yeUZhY3RvcnksIENvdW50RmFjdG9yeSwgVmFyRmFjdG9yeSwgJGlvbmljUGxhdGZvcm0sICRjb3Jkb3ZhVG9hc3QsICRodHRwKSB7XG4gICRzY29wZS4kb24oXCIkaW9uaWNWaWV3LmVudGVyXCIsIGZ1bmN0aW9uKHNjb3Blcywgc3RhdGVzKSB7XG4gICAgaWYoc3RhdGVzLmZyb21DYWNoZSAmJiBzdGF0ZXMuc3RhdGVOYW1lID09IFwidGFiLmNvdW50XCIpIHtcbiAgICAgICRzY29wZS50aGlzQ291bnQubmFtZSA9IFZhckZhY3RvcnkuZ2V0VmFyKCd1c2VyTmFtZScpO1xuICAgICAgJHNjb3BlLnRoaXNDb3VudC5zdGFydCA9IFZhckZhY3RvcnkuZ2V0VmFyKCd0YXNrU3RhcnQnKTtcbiAgICAgICRzY29wZS50aGlzQ291bnQuZW5kID0gVmFyRmFjdG9yeS5nZXRWYXIoJ3Rhc2tFbmQnKTtcbiAgICAgIGlmICh0eXBlb2YgKCRzY29wZS5jYXRlZ29yaWVzKSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgJHNjb3BlLmdldENhdGVnb3J5RGF0YSgpO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgJHNjb3BlLmdldENhdGVnb3J5RGF0YSA9IGZ1bmN0aW9uKCkge1xuICAgIENhdGVnb3J5RmFjdG9yeS5nZXRBbGxDYXRlZ29yaWVzKGZ1bmN0aW9uKGNhdHMpIHtcbiAgICAgICRzY29wZS5jYXRlZ29yaWVzID0gY2F0cy5kYXRhO1xuICAgIH0pO1xuICB9O1xuXG4gICRzY29wZS50aGlzQ291bnQgPSB7XG4gICAgZGF0ZTogJHJvb3RTY29wZS51c2VyRGF0ZSxcbiAgICB1c2VyaWQ6ICRyb290U2NvcGUudXNlcklkXG4gIH07XG5cbiAgJHNjb3BlLnRvZ2dsZUluZm8gPSBmdW5jdGlvbihjYXRlZ29yeSkge1xuICAgIGlmICgkc2NvcGUuaXNJbmZvU2hvd24oY2F0ZWdvcnkpKSB7XG4gICAgICAkc2NvcGUuc2hvd25JbmZvID0gbnVsbDtcbiAgICB9IGVsc2Uge1xuICAgICAgJHNjb3BlLnNob3duSW5mbyA9IGNhdGVnb3J5O1xuICAgIH1cbiAgfTtcblxuICAkc2NvcGUuaXNJbmZvU2hvd24gPSBmdW5jdGlvbihjYXRlZ29yeSkge1xuICAgIHJldHVybiAkc2NvcGUuc2hvd25JbmZvID09PSBjYXRlZ29yeTtcbiAgfTtcblxuICAkc2NvcGUubWludXMgPSBmdW5jdGlvbihjYXRlZ29yeSkge1xuICAgIGlmICh0eXBlb2YgKGNhdGVnb3J5LmNvdW50KSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIGNhdGVnb3J5LmNvdW50ID0gMDtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKGNhdGVnb3J5LmNvdW50ID49IDEpIHtcbiAgICAgICAgY2F0ZWdvcnkuY291bnQtLTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgJHNjb3BlLnBsdXMgPSBmdW5jdGlvbihjYXRlZ29yeSkge1xuICAgIGlmICh0eXBlb2YgKGNhdGVnb3J5LmNvdW50KSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIGNhdGVnb3J5LmNvdW50ID0gMTtcbiAgICB9IGVsc2Uge1xuICAgICAgY2F0ZWdvcnkuY291bnQrKztcbiAgICB9XG4gIH07XG5cbiAgJHNjb3BlLnRpbWVQaWNrZXJPYmplY3QgPSB7XG4gICAgaW5wdXRFcG9jaFRpbWU6ICgobmV3IERhdGUoKSkuZ2V0SG91cnMoKSAqIDYwICogNjApLFxuICAgIHN0ZXA6IDE1LFxuICAgIGZvcm1hdDogMjQsXG4gICAgc2V0TGFiZWw6ICdWw6ZsZycsXG4gICAgY2xvc2VMYWJlbDogJ0x1aycsXG4gICAgc2V0QnV0dG9uVHlwZTogJ2J1dHRvbi1iYWxhbmNlZCcsXG4gICAgY2xvc2VCdXR0cG5UeXBlOiAnYnV0dG9uLXN0YWJsZScsXG4gICAgY2FsbGJhY2s6IGZ1bmN0aW9uICh2YWwpIHtcbiAgICAgIGNvbnNvbGUubG9nKCd2YWw6ICcgKyAobmV3IERhdGUoKS5nZXRIb3VycygpICogNjAgKiA2MCkpO1xuICAgICAgJHNjb3BlLnRpbWVQaWNrZXJDYWxsYmFjayh2YWwpO1xuICAgIH1cbiAgfTtcblxuICAkc2NvcGUudGltZVBpY2tlckNhbGxiYWNrID0gZnVuY3Rpb24gKHZhbCkge1xuICAgIGlmICh0eXBlb2YgKHZhbCkgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBjb25zb2xlLmxvZygnVGltZSBub3Qgc2VsZWN0ZWQnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgJHNjb3BlLnRpbWVQaWNrZXIgPSBuZXcgRGF0ZSgodmFsICogMTAwMCktKDM2MDAgKiAxMDAwKSk7XG4gICAgICAkc2NvcGUuc2VsZWN0ZWRUaW1lID0gJGZpbHRlcignZGF0ZScpKCRzY29wZS50aW1lUGlja2VyLCAnSEg6bW0nKTtcbiAgICAgICRzY29wZS5ob3VycyA9ICRzY29wZS50aW1lUGlja2VyLmdldEhvdXJzKCk7XG4gICAgICAkc2NvcGUubWludXRlcyA9ICRzY29wZS50aW1lUGlja2VyLmdldE1pbnV0ZXMoKTtcbiAgICAgIGlmICgkc2NvcGUubWludXRlcyA9PT0gMCkge1xuICAgICAgICAkc2NvcGUubWludXRlcyA9ICcwMCc7XG4gICAgICB9XG5cbiAgICAgIGNvbnNvbGUubG9nKCdTZWxlY3RlZCB0aW1lIGlzOiAnICsgJHNjb3BlLmhvdXJzICsgJzonICsgJHNjb3BlLm1pbnV0ZXMpO1xuICAgIH1cbiAgfTtcblxuICAkc2NvcGUuc2VuZERhdGEgPSBmdW5jdGlvbiAoZm9ybSkge1xuICAgIGlmIChmb3JtLiR2YWxpZCkge1xuICAgICAgJHNjb3BlLmNhdGVnb3JpZXMuZm9yRWFjaChmdW5jdGlvbihjYXQpIHtcbiAgICAgICAgaWYgKHR5cGVvZiAoY2F0LmNvdW50KSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICBjYXQuY291bnQgPSAwO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgICRzY29wZS50aGlzQ291bnQuaG91ciA9ICRzY29wZS5ob3VycztcbiAgICAgICRzY29wZS50aGlzQ291bnQubWludXQgPSAkc2NvcGUubWludXRlcztcbiAgICAgICRzY29wZS50aGlzQ291bnQubG9jVHlwZSA9IFZhckZhY3RvcnkuZ2V0VmFyKCdsb2NhdGlvblR5cGUnKTtcbiAgICAgICRzY29wZS50aGlzQ291bnQubG9jID0gVmFyRmFjdG9yeS5nZXRWYXIoJ2xvY2F0aW9uJyk7XG4gICAgICAkc2NvcGUudGhpc0NvdW50LnRhc2sgPSBWYXJGYWN0b3J5LmdldFZhcigndGFzaycpO1xuICAgICAgJHNjb3BlLnRoaXNDb3VudC5jYXRlZ29yaWVzID0gJHNjb3BlLmNhdGVnb3JpZXM7XG4gICAgICAvL2NvbnNvbGUubG9nKCckc2NvcGUuY2F0ZWdvcmllczogJyArIEpTT04uc3RyaW5naWZ5KCRzY29wZS50aGlzQ291bnQuY2F0ZWdvcmllcywgbnVsbCwgMikpO1xuICAgICAgLy9jb25zb2xlLmxvZygnc2VuZERhdGEgLT4gXFxuJyArIEpTT04uc3RyaW5naWZ5KCRzY29wZS50aGlzQ291bnQsIG51bGwsIDIpKTtcbiAgICAgIC8vY29uc29sZS5sb2coJHNjb3BlLnRoaXNDb3VudCk7XG4gICAgICBDb3VudEZhY3Rvcnkuc2VuZERhdGEoJHNjb3BlLnRoaXNDb3VudCkudGhlbihmdW5jdGlvbihzdGF0dXMpIHtcbiAgICAgICAgY29uc29sZS5sb2coc3RhdHVzKTtcbiAgICAgIH0sIGZ1bmN0aW9uKGRhdGEsIHN0YXR1cykge1xuICAgICAgICBjb25zb2xlLmxvZyhcInNlbmREYXRhLkVycm9yIC0+IGRhdGE6IFwiICsgZGF0YSArIFwiLCBzdGF0dXM6IFwiICsgc3RhdHVzKTtcbiAgICAgIH0pO1xuICAgICAgJGNvcmRvdmFUb2FzdC5zaG93TG9uZ0NlbnRlcignRGluIGRhdGEgZXIgZ2VtdC4uLi4nKTtcbiAgICB9XG4gIH07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNvdW50Q3RybDsiLCJ2YXIgbG9naW5DdHJsID0gZnVuY3Rpb24oJHNjb3BlLCAkcm9vdFNjb3BlLCAkc3RhdGUsICRodHRwLCAkY29yZG92YVRvYXN0LCAkZmlsdGVyLCBMb2dpbkZhY3RvcnksIFZhckZhY3RvcnkpIHtcbiAgJHNjb3BlLnVzZXIgPSB7XG4gICAgZGF0ZTogJGZpbHRlcignZGF0ZScpKG5ldyBEYXRlKCksICdkLU1NLXl5JylcbiAgfTtcblxuICAkc2NvcGUubG9naW4gPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgcmF3RGF0ZSA9ICRzY29wZS51c2VyLmRhdGUucmVwbGFjZSgvLS9nLCBcIlwiKTtcblxuICAgIExvZ2luRmFjdG9yeS5zaWduSW4oJHNjb3BlLnVzZXIuaWQsIHJhd0RhdGUpLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICBpZiAocmVzLnN0YXR1cyA9PSAyMDApIHtcbiAgICAgICAgY29uc29sZS5sb2cocmVzKTtcbiAgICAgICAgVmFyRmFjdG9yeS5zZXRWYXIoXCJsb2NhdGlvblR5cGVcIiwgcmVzLmRhdGEuTG9jYXRpb25UeXBlSUQpO1xuICAgICAgICBWYXJGYWN0b3J5LnNldFZhcihcInVzZXJOYW1lXCIsIHJlcy5kYXRhLk5hbWUpO1xuICAgICAgICBWYXJGYWN0b3J5LnNldFZhcihcInRhc2tTdGFydFwiLCByZXMuZGF0YS5UaW1lRnJvbSk7XG4gICAgICAgIFZhckZhY3Rvcnkuc2V0VmFyKFwidGFza0VuZFwiLCByZXMuZGF0YS5UaW1lVG8pO1xuICAgICAgICBWYXJGYWN0b3J5LnNldFZhcihcImxvY2F0aW9uXCIsIHJlcy5kYXRhLkxvY2F0aW9uSUQpO1xuICAgICAgICBWYXJGYWN0b3J5LnNldFZhcihcInRhc2tcIiwgcmVzLmRhdGEuVGFza0lEKTtcbiAgICAgICAgJHJvb3RTY29wZS51c2VyRGF0ZSA9ICRzY29wZS51c2VyLmRhdGU7XG4gICAgICAgICRyb290U2NvcGUudXNlcklkID0gcmVzLmRhdGEuVXNlcklEO1xuICAgICAgICAkc3RhdGUuZ28oXCJ0YWIuY291bnRcIik7XG4gICAgICB9IFxuICAgICAgZWxzZSBpZiAocmVzLnN0YXR1cyA9PSA0MDQpIHtcbiAgICAgICAgY29uc29sZS5sb2cocmVzLmRhdGEsIHJlcy5zdGF0dXMpO1xuICAgICAgICBjb25zb2xlLmxvZyhcIkJhZCBSZXF1ZXN0XCIpO1xuICAgICAgICAkY29yZG92YVRvYXN0LnNob3dMb25nQm90dG9tKFwiRm9ya2VydCBJRCBlbGxlciBEYXRvXCIpO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAocmVzLnN0YXR1cyA9PSA0MDApIHtcbiAgICAgICAgY29uc29sZS5sb2cocmVzLmRhdGEsIHJlcy5zdGF0dXMpO1xuICAgICAgICBjb25zb2xlLmxvZyhcIlVzZXIgaWQgaXMgYmxhbmtcIik7XG4gICAgICAgICRjb3Jkb3ZhVG9hc3Quc2hvd0xvbmdCb3R0b20oXCJCcnVnZXIgSUQgbWFuZ2xlclwiKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBjb25zb2xlLmxvZyhcIkxvZ2luLCBJRDogXCIgKyAkc2NvcGUudXNlci5pZCArIFwiIC0gRGF0ZTogXCIgKyAkc2NvcGUudXNlci5kYXRlKTtcbiAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gbG9naW5DdHJsOyIsInZhciBzZXR0aW5nc0N0cmwgPSBmdW5jdGlvbigkc2NvcGUsIENvdW50RmFjdG9yeSwgVmFyRmFjdG9yeSkge1xuICAkc2NvcGUuc2V0dGluZ3MgPSB7fTtcblxuICAkc2NvcGUuZ2V0Q291bnRIaXN0b3J5ID0gZnVuY3Rpb24oKSB7XG4gICAgY29uc29sZS5sb2coJ0dldHRpbmcgSGlzdG9yeSEnKTtcbiAgICBDb3VudEZhY3RvcnkuZ2V0SGlzdG9yeShWYXJGYWN0b3J5LmdldFZhcigndGFzaycpKS50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgY29uc29sZS5sb2cocmVzLmRhdGEpO1xuICAgICAgJHNjb3BlLmhpc3RvcnkgPSByZXMuZGF0YTtcbiAgICAgIGZpbHRlckhpc3RvcnlUaW1lcygpO1xuICAgIH0pO1xuICB9O1xuXG4gIGZ1bmN0aW9uIGZpbHRlckhpc3RvcnlUaW1lcygpIHtcbiAgICAkc2NvcGUudGltZXMgPSBbXTtcbiAgICBhbmd1bGFyLmZvckVhY2goJHNjb3BlLmhpc3RvcnksIGZ1bmN0aW9uKHZhbHVlLCBrZXkpIHtcbiAgICAgIGlmICgkc2NvcGUudGltZXMuaW5kZXhPZih2YWx1ZS5UaW1lKSA9PSAtMSkge1xuICAgICAgICAkc2NvcGUudGltZXMucHVzaCh2YWx1ZS5UaW1lKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gICRzY29wZS50aW1lU2VsZWN0ZWQgPSBmdW5jdGlvbigpIHtcbiAgICBjb25zb2xlLmxvZyhcInVwZGF0ZWQgdGltZSB0bzogXCIgKyAkc2NvcGUuc2V0dGluZ3Muc2VsZWN0ZWRUaW1lKTtcbiAgfTtcbiAgJHNjb3BlLmdldENvdW50SGlzdG9yeSgpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBzZXR0aW5nc0N0cmw7IiwidmFyIHVybCA9IHJlcXVpcmUoJy4uLy4uL2NvbmZpZy5qcycpLmFwaVVybDtcblxudmFyIGNhdGVnb3J5RmFjdG9yeSA9IGZ1bmN0aW9uKCRodHRwLCBWYXJGYWN0b3J5KSB7XG4gIHZhciBjYXRlZ29yaWVzID0gW107XG5cbiAgZnVuY3Rpb24gc2V0Q2F0ZWdvcmllcyhhcnJheSkge1xuICAgIGNhdGVnb3JpZXMgPSBhcnJheTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldENhdGVnb3JpZXMoKSB7XG4gICAgcmV0dXJuIGNhdGVnb3JpZXM7XG4gIH1cblxuICBmdW5jdGlvbiBnZXRBbGxDYXRlZ29yaWVzKGNhbGxiYWNrKSB7XG4gICAgdmFyIGxvY2F0aW9uVHlwZUlkID0gVmFyRmFjdG9yeS5nZXRWYXIoJ2xvY2F0aW9uVHlwZScpO1xuICAgICRodHRwKHtcbiAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICB1cmw6IHVybCArICdjYXRlZ29yaWVzLycgKyBsb2NhdGlvblR5cGVJZFxuICAgIH0pLnRoZW4oZnVuY3Rpb24ocmVzKXtcbiAgICAgIGNhbGxiYWNrKHJlcyk7XG4gICAgfSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICBjb25zb2xlLmxvZygnTWVnYSBFUlJPUicsIGVycik7XG4gICAgfSk7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIGdldEFsbENhdGVnb3JpZXM6IGdldEFsbENhdGVnb3JpZXMsXG4gICAgYWxsOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBjYXRlZ29yaWVzO1xuICAgIH0sXG4gICAgcmVtb3ZlOiBmdW5jdGlvbihjYXRlZ29yeSkge1xuICAgICAgY2F0ZWdvcmllcy5zcGxpY2UoY2F0ZWdvcmllcy5pbmRleE9mKGNhdGVnb3J5KSwgMSk7XG4gICAgfSxcbiAgICBnZXQ6IGZ1bmN0aW9uKGNhdGVnb3J5SWQpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY2F0ZWdvcmllcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoY2F0ZWdvcmllc1tpXS5pZCA9PT0gcGFyc2VJbnQoY2F0ZWdvcnlJZCkpIHtcbiAgICAgICAgICByZXR1cm4gY2F0ZWdvcmllc1tpXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBjYXRlZ29yeUZhY3Rvcnk7IiwidmFyIHVybCA9IHJlcXVpcmUoJy4uLy4uL2NvbmZpZy5qcycpLmFwaVVybDtcblxudmFyIGNvdW50RmFjdG9yeSA9IGZ1bmN0aW9uKCRodHRwKSB7XG4gIHJldHVybiB7XG4gICAgc2VuZERhdGE6IHNlbmREYXRhLFxuICAgIGdldEhpc3Rvcnk6IGdldEhpc3RvcnlcbiAgfTtcblxuICBmdW5jdGlvbiBzZW5kRGF0YShjb3VudCkge1xuICAgIHJldHVybiAkaHR0cCh7XG4gICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgIHVybDogdXJsICsgJ3Bvc3QvY291bnQnLFxuICAgICAgZGF0YTogSlNPTi5zdHJpbmdpZnkoY291bnQpLFxuICAgICAgaGVhZGVyczoge1xuICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nIFxuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0SGlzdG9yeSh0YXNraWQpIHtcbiAgICByZXR1cm4gJGh0dHAoe1xuICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgIHVybDogdXJsICsgJ2dldC9jb3VudC8nICsgdGFza2lkXG4gICAgfSk7XG4gIH1cblxuXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNvdW50RmFjdG9yeTsiLCJ2YXIgdXJsID0gcmVxdWlyZSgnLi4vLi4vY29uZmlnLmpzJykuYXBpVXJsO1xuXG52YXIgbG9naW5GYWN0b3J5ID0gZnVuY3Rpb24oJGh0dHApIHtcbiAgcmV0dXJuIHtcbiAgICBzaWduSW46IGZ1bmN0aW9uKGlkLCByYXdEYXRlKSB7XG4gICAgICByZXR1cm4gJGh0dHAoe1xuICAgICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgICB1cmw6IHVybCArICdsb2dpbi8nICsgcmF3RGF0ZSArICcvJyArIGlkXG4gICAgICB9KTtcbiAgICB9XG4gIH07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGxvZ2luRmFjdG9yeTsiLCJ2YXIgdmFyRmFjdG9yeSA9IGZ1bmN0aW9uKCl7XG4gIHJldHVybiB7XG4gICAgZ2V0VmFyOmdldFZhcixcbiAgICBzZXRWYXI6c2V0VmFyXG4gIH07XG5cbiAgZnVuY3Rpb24gZ2V0VmFyIChrZXkpIHtcbiAgICByZXR1cm4gd2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKGtleSk7XG4gIH1cblxuICBmdW5jdGlvbiBzZXRWYXIgKGtleSwgdmFsdWUpIHtcbiAgICBpZiAodHlwZW9mIHZhbHVlID09PSBcInVuZGVmaW5lZFwiKXtcbiAgICAgIHdpbmRvdy5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShrZXkpO1xuICAgIH0gXG4gICAgZWxzZSB7XG4gICAgICB3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0oa2V5LCB2YWx1ZSk7XG4gICAgfVxuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHZhckZhY3Rvcnk7IiwiLy9SZWdpc3RlciB0aGUgYW5ndWxhciBhcHAgbW9kdWxlXG52YXIga2F1bnRhID0gYW5ndWxhci5tb2R1bGUoJ2thdW50YScsIFtcbiAgICAnaW9uaWMnLFxuICAgICduZ0NvcmRvdmEnLFxuICAgICdpb25pYy10aW1lcGlja2VyJyxcbl0pO1xuXG4vL1JlZ2lzdGVyIGFuZ3VsYXIgY29tcG9uZW50c1xucmVxdWlyZSgnLi9uZ0Jvb3QnKShrYXVudGEpO1xuXG4vL1JlZ2lzdGVyIHRoZSBuYXZpZ2F0aW9uIHN0YXRlc1xucmVxdWlyZSgnLi9uYXZpZ2F0aW9uJykoa2F1bnRhKTtcblxua2F1bnRhLmNvbmZpZyhmdW5jdGlvbigkaHR0cFByb3ZpZGVyKSB7XG4gICRodHRwUHJvdmlkZXIuZGVmYXVsdHMuaGVhZGVycy5wb3N0WydDb250ZW50LVR5cGUnXSA9ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQnO1xufSk7XG5cbmthdW50YS5ydW4oZnVuY3Rpb24oJGlvbmljUGxhdGZvcm0pIHtcbiAgJGlvbmljUGxhdGZvcm0ucmVhZHkoZnVuY3Rpb24oKSB7XG4gICAgLy8gSGlkZSB0aGUgYWNjZXNzb3J5IGJhciBieSBkZWZhdWx0IChyZW1vdmUgdGhpcyB0byBzaG93IHRoZSBhY2Nlc3NvcnkgYmFyIGFib3ZlIHRoZSBrZXlib2FyZFxuICAgIC8vIGZvciBmb3JtIGlucHV0cylcbiAgICBpZiAod2luZG93LmNvcmRvdmEgJiYgd2luZG93LmNvcmRvdmEucGx1Z2lucyAmJiB3aW5kb3cuY29yZG92YS5wbHVnaW5zLktleWJvYXJkKSB7XG4gICAgICBjb3Jkb3ZhLnBsdWdpbnMuS2V5Ym9hcmQuaGlkZUtleWJvYXJkQWNjZXNzb3J5QmFyKHRydWUpO1xuICAgICAgY29yZG92YS5wbHVnaW5zLktleWJvYXJkLmRpc2FibGVTY3JvbGwodHJ1ZSk7XG5cbiAgICB9XG4gICAgaWYgKHdpbmRvdy5TdGF0dXNCYXIpIHtcbiAgICAgIC8vIG9yZy5hcGFjaGUuY29yZG92YS5zdGF0dXNiYXIgcmVxdWlyZWRcbiAgICAgIFN0YXR1c0Jhci5zdHlsZUxpZ2h0Q29udGVudCgpO1xuICAgIH1cbiAgfSk7XG59KTsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGFwcCkge1xuICBhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyLCAkdXJsUm91dGVyUHJvdmlkZXIsICRjb21waWxlUHJvdmlkZXIpIHtcbiAgICAvLyBpZiBub25lIG9mIHRoZSBhYm92ZSBzdGF0ZXMgYXJlIG1hdGNoZWQsIHVzZSB0aGlzIGFzIHRoZSBmYWxsYmFja1xuICAgICR1cmxSb3V0ZXJQcm92aWRlci5vdGhlcndpc2UoJy90YWIvbG9naW4nKTtcblxuICAgIC8vIHNldHVwIGFuIGFic3RyYWN0IHN0YXRlIGZvciB0aGUgdGFicyBkaXJlY3RpdmVcbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgndGFiJywge1xuICAgICAgdXJsOiAnL3RhYicsXG4gICAgICBhYnN0cmFjdDogdHJ1ZSxcbiAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL3RhYnMuaHRtbCdcbiAgICB9KTtcblxuICBcbiAgICAvLyBFYWNoIHRhYiBoYXMgaXRzIG93biBuYXYgaGlzdG9yeSBzdGFjazpcbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgndGFiLmxvZ2luJywge1xuICAgICAgdXJsOiAnL2xvZ2luJyxcbiAgICAgIHZpZXdzOiB7XG4gICAgICAgICd0YWItbG9naW4nOiB7XG4gICAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvdGFiLWxvZ2luLmh0bWwnLFxuICAgICAgICAgIGNvbnRyb2xsZXI6ICdMb2dpbkN0cmwnXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcblxuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCd0YWIuY291bnQnLCB7XG4gICAgICB1cmw6ICcvY291bnQnLFxuICAgICAgdmlld3M6IHtcbiAgICAgICAgJ3RhYi1jb3VudCc6IHtcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy90YWItY291bnQuaHRtbCcsXG4gICAgICAgICAgY29udHJvbGxlcjogJ0NvdW50Q3RybCdcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ3RhYi5jYXRlZ29yeS1kZXRhaWwnLCB7XG4gICAgICB1cmw6ICcvY291bnQvOmNhdGVnb3J5SWQnLFxuICAgICAgdmlld3M6IHtcbiAgICAgICAgJ3RhYi1jb3VudCc6IHtcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9jYXRlZ29yeS1kZXRhaWwuaHRtbCcsXG4gICAgICAgICAgY29udHJvbGxlcjogJ0NhdGVnb3J5RGV0YWlsQ3RybCdcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuXG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ3RhYi5zZXR0aW5ncycsIHtcbiAgICAgIHVybDogJy9zZXR0aW5ncycsXG4gICAgICB2aWV3czoge1xuICAgICAgICAndGFiLXNldHRpbmdzJzoge1xuICAgICAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL3RhYi1zZXR0aW5ncy5odG1sJyxcbiAgICAgICAgICBjb250cm9sbGVyOiAnU2V0dGluZ3NDdHJsJ1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH0pO1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGFwcCkge1xuICAvL0NvbnRyb2xsZXJzXG4gIGFwcC5jb250cm9sbGVyKCdMb2dpbkN0cmwnLCByZXF1aXJlKCcuL2NvbnRyb2xsZXJzL0xvZ2luQ3RybCcpKTtcbiAgYXBwLmNvbnRyb2xsZXIoJ0NvdW50Q3RybCcsIHJlcXVpcmUoJy4vY29udHJvbGxlcnMvQ291bnRDdHJsJykpO1xuICBhcHAuY29udHJvbGxlcignQ2F0ZWdvcnlEZXRhaWxDdHJsJywgcmVxdWlyZSgnLi9jb250cm9sbGVycy9DYXRlZ29yeURldGFpbEN0cmwnKSk7XG4gIGFwcC5jb250cm9sbGVyKCdTZXR0aW5nc0N0cmwnLCByZXF1aXJlKCcuL2NvbnRyb2xsZXJzL1NldHRpbmdzQ3RybCcpKTtcblxuICAvL0ZhY3Rvcmllc1xuICBhcHAuZmFjdG9yeSgnQ2F0ZWdvcnlGYWN0b3J5JywgcmVxdWlyZSgnLi9mYWN0b3JpZXMvQ2F0ZWdvcnlGYWN0b3J5JykpO1xuICBhcHAuZmFjdG9yeSgnTG9naW5GYWN0b3J5JywgcmVxdWlyZSgnLi9mYWN0b3JpZXMvTG9naW5GYWN0b3J5JykpO1xuICBhcHAuZmFjdG9yeSgnVmFyRmFjdG9yeScsIHJlcXVpcmUoJy4vZmFjdG9yaWVzL1ZhckZhY3RvcnknKSk7XG4gIGFwcC5mYWN0b3J5KCdDb3VudEZhY3RvcnknLCByZXF1aXJlKCcuL2ZhY3Rvcmllcy9Db3VudEZhY3RvcnknKSk7XG59OyJdfQ==
