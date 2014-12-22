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
  $scope.alertStatus = function( measurement ){
    // In here we would do somethign moresophisticated
    // to determine if the measurement is in a dange zone.
    // For now, the measurement just has a hard-coded flag
    return measurement.alertFlag;
  };

  $scope.selectedDateRange = {
    start: 'Sep 12',
    end: 'Sep 19',
    year: '2014'
  };

  $scope.measurements = measurementService.getMeasurements();

  omhAPIservice.getMeasurements( ['withings'] ).then( function( value ) { 
    console.log( value );
    var earliestMeasurement = value[0];
    var latestMeasurement = value[0];
    angular.forEach( value, function( newMeasurement, newMeasurementIndex){
      if ( newMeasurement.dateStart < earliestMeasurement.dateStart ) earliestMeasurement = newMeasurement;
      if ( newMeasurement.dateEnd > latestMeasurement.dateEnd ) latestMeasurement = newMeasurement;
    });
    var startDateStrings = measurementService.getAbbreviatedDateStrings( earliestMeasurement );
    var endDateStrings = measurementService.getAbbreviatedDateStrings( latestMeasurement );
    $scope.selectedDateRange = {
      start: startDateStrings.start,
      end: endDateStrings.end,
      year: startDateStrings.year,
    };
    angular.forEach( $scope.measurements, function( measurement, measurementIndex ) {
      angular.forEach( value, function( newMeasurement, newMeasurementIndex ){
        if ( measurement.id === newMeasurement.id ) {
          console.log('replacing with new');
          $scope.measurements[ measurementIndex ] = newMeasurement;
          newMeasurement.empty = false;
          measurementService.addMeasurement( newMeasurement );
        }
      });
    });
  });
})
.controller('MeasurementCtrl', function($scope, $state, $stateParams, measurementService) {
  $scope.measurement = measurementService.getMeasurement( $stateParams.id );
  if( $scope.measurement && $scope.measurement.connected ){
    $scope.selectedDateRange = measurementService.getAbbreviatedDateStrings( $scope.measurement );
  }
})
.controller('AppsAndDevicesCtrl', function($scope) {
  $scope.playlists = [
    { title: 'Reggae', id: 1 },
    { title: 'Chill', id: 2 },
    { title: 'Dubstep', id: 3 },
    { title: 'Indie', id: 4 },
    { title: 'Rap', id: 5 },
    { title: 'Cowbell', id: 6 }
  ];
})
.controller('SettingsCtrl', function($scope) {
  $scope.playlists = [
    { title: 'Reggae', id: 1 },
    { title: 'Chill', id: 2 },
    { title: 'Dubstep', id: 3 },
    { title: 'Indie', id: 4 },
    { title: 'Rap', id: 5 },
    { title: 'Cowbell', id: 6 }
  ];
})

// .controller('PlaylistCtrl', function($scope, $stateParams) {
// });
