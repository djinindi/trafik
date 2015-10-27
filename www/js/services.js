angular.module('starter.services', [])

.factory('categories', function() {
  // Might use a resource here that returns a JSON array
  var categories = [{
    id: 0,
    name: 'Stående børn',
    count: 34,
    info: 'Dækker over børn der står op'
  }, {
    id: 1,
    name: 'Stående voksne',
    count: 12,
    info: 'Dækker over voksne der står op'
  }, {
    id: 2,
    name: 'Ventende på bus',
    count: 2,
    info: 'Dækker over personer der venter på en bus ved et stoppested'
  }, {
    id: 3,
    name: 'Siddende på café',
    count: 1,
    info: 'Dækker over personer der bliver betjent på en café'
  }, {
    id: 4,
    name: 'Siddende på bænk - børn',
    count: 2,
    info: 'Dækker over børn der sidder ned på en bænk'
  }, {
    id: 5,
    name: 'Siddende på bænk - voksne',
    count: 42,
    info: 'Dækker over voksne der sidder ned på en bænk'
  }, {
    id: 6,
    name: 'Siddende andre steder - børn',
    count: 14,
    info: 'Dækker over børn der sidder ned på alt andet end en bænk'
  }, {
    id: 7,
    name: 'Siddende andre steder - voksne',
    count: 3,
    info: 'Dækker over voksne der sidder ned på alt andet end en bænk'
  }, {
    id: 8,
    name: 'Barnevogne',
    count: 0,
    info: 'Dækker over barnevogne og klapvagne'
  }, {
    id: 9,
    name: 'Liggende',
    count: 0,
    info: 'Dækker over personer der ligner at de er døde'
  }, {
    id: 10,
    name: 'Legende børn',
    count: 1,
    info: 'Dækker over børn der leger'
  }, {
    id: 11,
    name: 'Legende / trænende voksne',
    count: 0,
    info: 'Dækker over voksne der leger med deres børn eller bruger træningsfaciliteterne'
  }, {
    id: 12,
    name: 'Kommercielle aktiviteter',
    count: 3,
    info: 'Dækker over gadesælgere og facere'
  }, {
    id: 13,
    name: 'Kultur aktiviteter',
    count: 0,
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
