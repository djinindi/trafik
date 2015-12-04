var loginCtrl = function($scope, $rootScope, $state, $http, $cordovaToast, $filter, LoginFactory, VarFactory) {
  $scope.user = {
    date: $filter('date')(new Date(), 'dd-MM-yy')
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

  function destoryUserCredentials() {
    varFactory.deleteVar("");
  }
};

module.exports = loginCtrl;