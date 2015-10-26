angular.module('starter.services', [])

.factory('categories', function() {
  // Might use a resource here that returns a JSON array
  var categories = [{
    id: 0,
    name: 'Stående børn',
    count: 34
  }, {
    id: 1,
    name: 'Stående voksne',
    count: 12
  }, {
    id: 2,
    name: 'Ventende på bus',
    count: 2
  }, {
    id: 3,
    name: 'Siddende på café',
    count: 1
  }, {
    id: 4,
    name: 'Siddende på bænk - børn',
    count: 2
  }, {
    id: 5,
    name: 'Siddende på bænk - voksne',
    count: 42
  }, {
    id: 6,
    name: 'Siddende andre steder - børn',
    count: 14
  }, {
    id: 7,
    name: 'Siddende andre steder - voksne',
    count: 3
  }, {
    id: 8,
    name: 'Barnevogne',
    count: 0
  }, {
    id: 9,
    name: 'Liggende',
    count: 0
  }, {
    id: 10,
    name: 'Legende børn',
    count: 1
  }, {
    id: 11,
    name: 'Legende / trænende voksne',
    count: 0
  }, {
    id: 12,
    name: 'Kommercielle aktiviteter',
    count: 3
  }, {
    id: 13,
    name: 'Kultur aktiviteter',
    count: 0
  }];

  return {
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
});
