angular.module('linq.services', [])
.factory('omhAPIservice', function($q, $http) {

  var omhAPI = {};
  omhAPI.currentOutfit = {};

  omhAPI.getData = function( shimName ) {
    return $http({
      method: 'GET', 
      url: '/data/body.json' //http://ec2-54-148-57-68.us-west-2.compute.amazonaws.com:8083/data/withings/body?username=annadph@gmail.com&dateStart=2014-01-01&dateEnd=2014-12-01&normalize=true'
    });
  };

  // in the future this function may actually pull the user's
  // ranges and thresholds from a server, but for now it's just 
  // some placeholder information
  omhAPI.getReadingBounds = function( readingLabel ) {
    return {
      systolic_blood_pressure: { min: 90, max: 300, thresh: 118 },
      diastolic_blood_pressure: { min: 20, max: 100, thresh: 80 },
      body_weight: { min: 5, max: 600, thresh: 200 },
      heart_rate: { min: 20, max: 240, thresh: 90 }
    }[ readingLabel ];
  };


  // This function gets the omh data and parses it into a structure
  // that can be easily used in the views.
  // It can be improved by retaining time information, because as it
  // stands, the graphs just show a sequence of values with no regard
  // to the amount of time between them. This can be misleading, as
  // two measurements in one day can appear to span as much time as two
  // measurements taken days apart.
  omhAPI.getMeasurements = function( shimNames ) {
    
    var api = this;
    var requests = [];
    var deferredData = $q.defer();

    // The shims passed in are all queried and then
    // all processed at the same time once they have all come in.
    // This is intended to prevent the app from showing incomplete
    // data when a single measurement type is provided by
    // more than one shim. eg activity by both runkeeper and jawbone

    angular.forEach( shimNames, function( shimName, index ) {
      requests.push(api.getData(shimName));
    });

    $q.all(requests).then(function (results) {
        var measurements = [];
        angular.forEach( results, function( response, index ) {
          var data = response.data;
          if ( data.shim == 'withings' ){
            angular.forEach( data.body, function( readings, key ) {
              if ( readings.length > 0 ){
                var measurement = {
                  name: toTitleCase( key.replace('_',' ') ),
                  id: key.replace('_','-'),
                  connected: true,
                  connecting: false,
                  api: data.shim,
                  avg: '',
                  alertFlag: false,
                  valueCount: '',
                  data: [],
                  dataTypes: [],
                  dateStart: '',
                  dateEnd: ''
                };

                // sort the readings by the time when their effective time frame
                readings.sort( function( a, b ) {
                  var dateA = new Date(a.effective_time_frame.date_time);
                  var dateB = new Date(b.effective_time_frame.date_time);
                  return dateA.getTime() - dateB.getTime();
                });
                measurement.dateStart = new Date( readings[0].effective_time_frame.date_time );
                measurement.dateEnd = new Date( readings[ readings.length-1 ].effective_time_frame.date_time );
                
                // populate the datasets in the measurement with the reading values
                angular.forEach( readings, function( reading, readingIndex ) {
                  angular.forEach( reading, function( datum, label ) {
                    if ( label !== 'effective_time_frame' ) {
                      var datasetIndex = measurement.dataTypes.indexOf( label );
                      if ( datasetIndex >= 0 ) {
                        // push the value onto an existing dataset of the same type 
                        measurement.data[ datasetIndex ].values.push( datum.value );
                      } else {
                        // make a new dataset if this measurement does not have one
                        // yet for this data type
                        var bounds = omhAPI.getReadingBounds( label );
                        measurement.data.push({
                          label: label,
                          max: bounds.max,
                          thresh: bounds.thresh,
                          min: bounds.min,
                          values: [ datum.value ],
                          unit: datum.unit
                        });
                        measurement.dataTypes.push( label );
                      }
                    }
                  });
                });

                // compute averages, alerts and value counts
                var averages = [];
                var valueCount = 0;
                angular.forEach( measurement.data, function( dataset, datasetIndex ){
                  averages.push(0);
                  angular.forEach( dataset.values, function( value, valueIndex ){
                    averages[ datasetIndex ] += value;
                  });
                  averages[ datasetIndex ] /= dataset.values.length;
                  // set value count to the dataset length that is the greatest
                  if ( dataset.values.length > valueCount ) valueCount = dataset.values.length;
                  // fire an alert if the average is higher than the safe threshold
                  if ( averages[ datasetIndex ] > dataset.thresh ) measurement.alertFlag = true;
                });

                if ( measurement.id === 'blood-pressure' ){
                  // blood pressure has a special notation with two values
                  // this should be improved to actually make sure they are int he right order
                  measurement.avg = Math.round(averages[0])+'/'+Math.round(averages[1]);
                } else if ( measurement.id === 'body-weight' ) {
                  measurement.avg = Math.round(averages[0]) + measurement.data[0].unit;
                } else {
                  measurement.avg = Math.round(averages[0]);
                }

                measurement.valueCount = valueCount;

                // update the scope's list of measurements for the view
                measurements.push( measurement );
              }
            });
          }
        });
        deferredData.resolve( measurements );
    });

    return deferredData.promise;

  };

  return omhAPI;

});


/*

                  {
                    label: "Systolic",
                    max: 300,
                    thresh: 180,
                    min: 50,
                    values: [180, 300, 300, 180, 300, 160, 120]
                  },
                  {
                    label: "Diastolic",
                    max: 200,
                    thresh: 80,
                    min: 10,
                    values: [28, 48, 100, 19, 80, 27, 50]
                  }

*/

function toTitleCase(str)
{
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

