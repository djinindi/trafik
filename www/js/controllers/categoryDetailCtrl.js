var categoryDetailCtrl = function($scope, $stateParams, categories) {
  $scope.category = categories.get($stateParams.categoryId);
};

module.exports = categoryDetailCtrl;