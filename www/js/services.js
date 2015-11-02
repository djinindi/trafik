angular.module('starter.services', [])

.service('LoginService', function($q) {
  return {
    loginUser: function(id) {
      var deferred = $q.defer();
      var promise = deferred.promise;

      if (id === 1337) {
        deferred.resolve('Welcome ' + id + '!');
      } else {
        deferred.reject('Wrong!');
      }
      promise.success = function(fn) {
        promise.then(fn);
        return promise;
      };
      promise.error = function(fn) {
        promise.then(null, fn);
        return promise;
      };
      return promise;
    }
  };
})

.factory('categories', function() {
  // Might use a resource here that returns a JSON array
  var categories = [{
    id: 0,
    name: 'Stående børn',
    info: 'Dækker over børn der står op'
  }, {
    id: 1,
    name: 'Stående voksne',
    info: 'Dækker over voksne der står op'
  }, {
    id: 2,
    name: 'Ventende på bus',
    info: 'Dækker over personer der venter på en bus ved et stoppested'
  }, {
    id: 3,
    name: 'Siddende på café',
    info: 'Dækker over personer der bliver betjent på en café'
  }, {
    id: 4,
    name: 'Siddende på bænk - børn',
    info: 'Dækker over børn der sidder ned på en bænk'
  }, {
    id: 5,
    name: 'Siddende på bænk - voksne',
    info: 'Dækker over voksne der sidder ned på en bænk'
  }, {
    id: 6,
    name: 'Siddende andre steder - børn',
    info: 'Dækker over børn der sidder ned på alt andet end en bænk'
  }, {
    id: 7,
    name: 'Siddende andre steder - voksne',
    info: 'Dækker over voksne der sidder ned på alt andet end en bænk'
  }, {
    id: 8,
    name: 'Barnevogne',
    info: 'Dækker over barnevogne og klapvagne'
  }, {
    id: 9,
    name: 'Liggende',
    info: 'Dækker over personer der ligner at de er døde'
  }, {
    id: 10,
    name: 'Legende børn',
    info: 'Dækker over børn der leger'
  }, {
    id: 11,
    name: 'Legende / trænende voksne',
    info: 'Dækker over voksne der leger med deres børn eller bruger træningsfaciliteterne'
  }, {
    id: 12,
    name: 'Kommercielle aktiviteter',
    info: 'Dækker over gadesælgere og facere'
  }, {
    id: 13,
    name: 'Kultur aktiviteter',
    info: 'Dækker over kultur aktiviteter'
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
