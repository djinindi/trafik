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