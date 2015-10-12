angular.module('starter.controllers', [])

.controller('LoginCtrl', function($scope) {})

.controller('CountCtrl', function($scope, Vehicles) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.vehicles = Vehicles.all();
  $scope.remove = function(vehicle) {
    Vehicles.remove(vehicle);
  };
})

.controller('VehicleDetailCtrl', function($scope, $stateParams, Vehicles) {
  $scope.vehicle = Vehicles.get($stateParams.vehicleId);
})

.controller('SettingsCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});
