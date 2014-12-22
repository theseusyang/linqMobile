angular.module('linq.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

})

.controller('HomeCtrl', function($scope, omhAPIservice, measurementService) {
  $scope.nextDateRange = function(){
  };
  $scope.previousDateRange = function(){
  };
  $scope.connected = function(){
    if ( !$scope.measurements ) return false;
    var connected = false;
    angular.forEach($scope.measurements, function( measurement, index ){
      if ( measurement.connected ) connected = true;
    });
    return connected;
  };
  $scope.connect = function(){
    measurementService.updateMeasurements();
  };
  // let the service manage the measurements
  $scope.selectedDateRange = measurementService.getSelectedDateRange();
  $scope.measurements = measurementService.getMeasurements();
})
.controller('MeasurementCtrl', function($scope, $state, $stateParams, measurementService) {
  $scope.connect = function(){
    measurementService.updateMeasurements( function(){
      $scope.measurement = measurementService.getMeasurement( $stateParams.id );
      if( $scope.measurement && $scope.measurement.connected ){
        $scope.selectedDateRange = measurementService.getAbbreviatedDateStrings( $scope.measurement );
      }
    } );
  };
  // let the service manage the measurements
  $scope.measurement = measurementService.getMeasurement( $stateParams.id );
  if( $scope.measurement && $scope.measurement.connected ){
    $scope.selectedDateRange = measurementService.getAbbreviatedDateStrings( $scope.measurement );
  }
})
.controller('AppsAndDevicesCtrl', function($scope) {

})
.controller('PlanCtrl', function($scope, measurementService) {
  $scope.measurements = measurementService.getMeasurements();
})
.controller('SettingsCtrl', function($scope) {

});