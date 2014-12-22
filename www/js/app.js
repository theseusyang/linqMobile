// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('linq', [
  'ionic', 
  'angularLoad', 
  'linq.controllers', 
  'linq.services'
])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

  .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })

  .state('app.home', {
    url: '/home',
    views: {
      'menuContent': {
        templateUrl: 'templates/home.html',
        controller: 'HomeCtrl'
      }
    }
  })

  .state('app.measurement', {
    url: '/measurement/:id',
    views: {
      'menuContent': {
        templateUrl: 'templates/measurement.html',
        controller: 'MeasurementCtrl',
      }
    }
  })

  .state('app.detail', {
    url: '/reading/:reading',
    views: {
      'menuContent': {
        templateUrl: 'templates/reading.html',
        controller: 'MeasurementDetailsCtrl'
      }
    }
  })

  .state('app.plan', {
    url: '/plan',
    views: {
      'menuContent': {
        templateUrl: 'templates/plan.html',
        controller: 'PlanCtrl'
      }
    }
  })

  .state('app.appsAndDevices', {
    url: '/appsAndDevices',
    views: {
      'menuContent': {
        templateUrl: 'templates/apps-and-devices.html',
        controller: 'AppsAndDevicesCtrl'
      }
    }
  })

  .state('app.settings', {
    url: '/settings',
    views: {
      'menuContent': {
        templateUrl: 'templates/settings.html',
        controller: 'SettingsCtrl'
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/home');

})
.directive('measurementChart', [ 'angularLoad', function( angularLoad ) {
    return {
      restrict: 'E',
      transclude: true,
      templateUrl: 'templates/measurement-chart.html',
      link: function( scope, element, attrs ){
        angularLoad.loadScript('lib/Chart.js/Chart.js').then( function(){
        
        var measurement = scope.$parent.measurement;

        var canvas = element.find('canvas')[0];
        var ctx = canvas.getContext('2d');

        var chartMax = Number.MIN_VALUE;
        var chartMin = Number.MAX_VALUE;

        angular.forEach( measurement.data, function( data, index ){

          if ( data.min < chartMin ) chartMin = data.min;
          if ( data.max > chartMax ) chartMax = data.max;

        });

        var chartScale = chartMax - chartMin;

        var chartData = {
          labels: [],
          datasets: []
        };

        angular.forEach( measurement.data, function( data, index ){

          var scale = data.max-data.min;
          var thresh = 1-(data.thresh-chartMin)/chartScale;

          // unfortunately these magic numbers had to be determined heuristically          
          var chartPixelOffset = 5;
          var chartPixelEnd = canvas.height-22;

          var gradient = ctx.createLinearGradient( 0, chartPixelOffset, 0, chartPixelEnd );
          gradient.addColorStop(0, 'rgba(232,172,78,1)');   
          gradient.addColorStop(thresh, 'rgba(232,172,78,1)');   
          gradient.addColorStop(thresh+0.001, 'rgba(222,236,244,1)');   
          gradient.addColorStop(1, 'rgba(222,236,244,0)');

          chartData.datasets.push({
            label: data.label,
            fillColor: gradient,
            strokeColor: "#CCCCCC",
            pointColor: '#EEEEEE',
            pointStrokeColor: '#CCCCCC',
            data: data.values
          });

        });


        for(var i=0;i<measurement.valueCount;i++){
          chartData.labels.push('');
        }

 
        var options = {

          // Boolean - Whether to show scale
          showScale: false,
          scaleShowLabels: false,


          ///Boolean - Whether grid lines are shown across the chart
          scaleShowGridLines : false,

          scaleLineColor : "rgba(0,0,0,0)",

          //Boolean - Whether the line is curved between points
          bezierCurve : true,

          //Number - Tension of the bezier curve between points
          bezierCurveTension : 0,

          //Boolean - Whether to show a dot for each point
          pointDot : false,

          finalDot : true,

          //Number - Radius of each point dot in pixels
          pointDotRadius : 3,

          //Number - Pixel width of point dot stroke
          pointDotStrokeWidth : 1,

          //Number - amount extra to add to the radius to cater for hit detection outside the drawn point
          pointHitDetectionRadius : 20,

          //Boolean - Whether to show a stroke for datasets
          datasetStroke : true,

          //Number - Pixel width of dataset stroke
          datasetStrokeWidth : 1,

          //Boolean - Whether to fill the dataset with a colour
          datasetFill : true,
          
          scaleOverride: true,

          scaleSteps: 1,

          scaleStepWidth: chartScale,

          scaleStartValue: chartMin,

        };

        var myLineChart = new Chart(ctx).Line(chartData, options);

      });
    }
  };
}])
.directive('loadingIndicator', function() {
    return {
      restrict: 'E',
      templateUrl: 'templates/loading-indicator.html',
      transclude: true,
      link: function( scope, element, attrs ){
      }
    };
})
.directive('measurementAlert', function() {
    return {
      restrict: 'A',
      transclude: false,
      link: function( scope, element, attrs ){
        if (scope.measurement.alertFlag){
          element.addClass('measurement-alert');
        } else {
          element.removeClass('measurement-alert');
        }
      }
    };
})
.directive('readingAlert', function() {
    return {
      restrict: 'A',
      transclude: false,
      link: function( scope, element, attrs ){
        if (scope.reading.alertFlag){
          element.addClass('measurement-alert');
        } else {
          element.removeClass('measurement-alert');
        }
      }
    };
})
.directive('linqUserBadge', function() {
    return {
      restrict: 'E',
      templateUrl: 'templates/user-badge.html',
      transclude: true,
      link: function( scope, element, attrs ){
      }
    };
})
.directive('measurementListItem', function() {
    return {
      restrict: 'E',
      templateUrl: 'templates/measurement-list-item.html',
      transclude: true,
      link: function( scope, element, attrs ){
      }
    };
})

.service('measurementService', function(omhAPIservice) {

  var measurements = [];
  var selectedDateRange = {};

  var addMeasurement = function( measurement ) {
    measurements.push( measurement );
  };

  var getMeasurement = function( id ){
    var matchingValue = null
    angular.forEach( measurements, function( measurement, index ){
      console.log(measurement.id + " vs "+ id);
      if ( measurement.id === id ){
        matchingValue = measurement;
        console.log('match');
      }
    });
    return matchingValue;
  };

  var getMeasurements = function(){
    return measurements;
  };

  var getReading = function( id, readingIndex ){
      reading = [];
      angular.forEach( getMeasurement( id ), function( data, dataIndex ){
        reading.push( data.values[ readingIndex ] );
      });
      return reading;
  };

  var getAbbreviatedDateStrings = function( measurement ){
    var startParts = measurement.dateStart.toString().match(/^\w+\s(\w+\s\d+)\s(\d+)/);
    var endParts = measurement.dateEnd.toString().match(/^\w+\s(\w+\s\d+)\s(\d+)/);
    return {
      start: startParts[1],
      end: endParts[1],
      year: startParts[2]
    };
  };

  var getSelectedDateRange = function(){
    return selectedDateRange;
  };

  var updateMeasurements = function( callback ){
    angular.forEach( measurements, function( measurement, index ){
      measurement.connecting = true;
    });
    omhAPIservice.getMeasurements( ['withings'] ).then( function( value ) { 
      // console.log( value );

      // handle the date windowing -- currently the date range is
      // resized to the actual range that comes back from the server
      var earliestMeasurement = value[0];
      var latestMeasurement = value[0];

      angular.forEach( value, function( newMeasurement, newMeasurementIndex){
        if ( newMeasurement.dateStart < earliestMeasurement.dateStart ) earliestMeasurement = newMeasurement;
        if ( newMeasurement.dateEnd > latestMeasurement.dateEnd ) latestMeasurement = newMeasurement;
      });

      var startDateStrings = getAbbreviatedDateStrings( earliestMeasurement );
      var endDateStrings = getAbbreviatedDateStrings( latestMeasurement );

      selectedDateRange.start = startDateStrings.start;
      selectedDateRange.end = endDateStrings.end;
      selectedDateRange.year = startDateStrings.year;

      // manage the updates to the measurement array so that all views that ref
      // these measurements will receive the update
      angular.forEach( measurements, function( measurement, measurementIndex ) {
        angular.forEach( value, function( newMeasurement, newMeasurementIndex ){
          if ( measurement.id === newMeasurement.id ) {
            angular.forEach( newMeasurement, function( value, key ){
              measurements[ measurementIndex ][key] = value;
            });
            measurements[ measurementIndex ].empty = false;
          }
        });
      });
      if ( callback ) callback();
    });  
  };

  //add default measurements at start
  angular.forEach([
    { name: 'Blood Pressure',
      id: 'blood-pressure',
      connected: false,
      connecting: false,
      empty: true,
      api: 'withings'
    },
    { name: 'Heart Rate',
      id: 'heart-rate',
      connected: false,
      connecting: false,
      empty: true,
      api: "withings"
    },
    { name: 'Weight',
      id: 'body-weight',
      connected: false,
      connecting: false,
      empty: true,
      api: "withings"
    },
    { name: 'Activity',
      id: 'activity',
      connected: false,
      connecting: false,
      empty: true,
      api: ""
    },
  ], function( measurement, index ){ addMeasurement( measurement ); });

  selectedDateRange = {
    start: 'Sep 12',
    end: 'Sep 19',
    year: '2014'
  };

  //updateMeasurements();

  return {
    updateMeasurements: updateMeasurements,
    addMeasurement: addMeasurement,
    getMeasurement: getMeasurement,
    getMeasurements: getMeasurements,
    getAbbreviatedDateStrings: getAbbreviatedDateStrings,
    getSelectedDateRange: getSelectedDateRange,
    getReading: getReading
  };

});
