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