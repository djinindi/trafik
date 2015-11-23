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