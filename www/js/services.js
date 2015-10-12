angular.module('starter.services', [])

.factory('Vehicles', function() {
  // Might use a resource here that returns a JSON array
  var vehicles = [{
    id: 0,
    name: 'Personbil',
    image: '/img/Car-Side-View-128.png',
    count: 0
  }, {
    id: 1,
    name: 'Cykel',
    image: '/img/Cycle-Race-128.png',
    count: 12
  }, {
    id: 2,
    name: 'Bus',
    image: '/img/Bus-Side-View-128.png',
    count: 2
  }];

  return {
    all: function() {
      return vehicles;
    },
    remove: function(vehicle) {
      vehicles.splice(vehicles.indexOf(vehicle), 1);
    },
    get: function(vehicleId) {
      for (var i = 0; i < vehicles.length; i++) {
        if (vehicles[i].id === parseInt(vehicleId)) {
          return vehicles[i];
        }
      }
      return null;
    }
  };
});
