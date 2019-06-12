var fs = require("fs");

let moduleConfiguration = JSON.parse(fs.readFileSync('moduleConfiguration.json', 'utf8'));

module.exports = function(driver) {

/**
 * Log listing
 * @param {string} start device object to subscribe the platform to the log
 * @param {string} end device object to subscribe the platform to the log
 * @callback {Function} callback Callback function
 * @param {Error|string} err Error object
 * @param {logEntry} result Result object
 */
driver.logs = function(start, end, callback) {

  // Replace the code below with your implementation.
  // Please make sure the callback is invoked.
  process.nextTick(function() {
    var err = new Error('Not implemented');
    callback(err);
  });
  
  /*
  var err0 = new Error('Invalid input');
  err0.statusCode = 405;
  return cb(err0);
  */ 
}


/**
 * Return the endpoints available in the Driver Component

 * @callback {Function} callback Callback function
 * @param {Error|string} err Error object
 * @param {getMetadata_response_200} result Result object
 */
driver.getMetadata = function(callback) {
  let driverMetadata = require("../driverImplementation/"+ moduleConfiguration.driver)().getDriverMetadata();

  callback(null, driverMetadata);
  
  /*
  var err0 = new Error('Invalid input');
  err0.statusCode = 405;
  return cb(err0);
  */ 
}

/**
 * Return the settings of the driver

 * @callback {Function} callback Callback function
 * @param {Error|string} err Error object
 * @param {settings} result Result object
 */
driver.getSettings = function(callback) {

//   // objects to create or find instances on the database
// const settings = this.app.models.settings;
  
// // I have to register the sensor and the sensorConfiguration
// settings.find()
//   .then(function (result) {
//     callback(null, result);
//   })
//   .catch(function (err) {
//     console.log(err);
//     callback(err);
//   });
  callback(null, moduleConfiguration);
}

/**
 * Update existing settings
 * @param {settings} sensordata device object that will update existing one
 * @callback {Function} callback Callback function
 * @param {Error|string} err Error object
 * @param {any} result Result object
 */
driver.updateSettings = function(settings, callback) {
  // moduleConfiguration.broker = settings.broker
  // moduleConfiguration.userName = settings.userName
  // moduleConfiguration.platformDomain = settings.platformDomain
  // moduleConfiguration.routingKeys = settings.routingKeys
  // moduleConfiguration.activation = settings.activation
  fs.writeFileSync('moduleConfiguration.json', JSON.stringify(settings), 'utf8')
  callback(null, "success");
  
}




driver.remoteMethod('logs',
  { isStatic: true,
  consumes: [ 'application/json' ],
  produces: [ 'application/json' ],
  accepts: 
   [ { arg: 'start',
       type: 'string',
       description: 'device object to subscribe the platform to the log',
       required: true,
       http: { source: 'path' } },
     { arg: 'end',
       type: 'string',
       description: 'device object to subscribe the platform to the log',
       required: true,
       http: { source: 'path' } } ],
  returns: 
   [ { description: 'id of the device created',
       type: 'logEntry',
       arg: 'data',
       root: true } ],
  http: { verb: 'get', path: '/logs' },
  description: 'Log listing' }
);

driver.remoteMethod('getMetadata',
  { isStatic: true,
  produces: [ 'application/json' ],
  accepts: [],
  returns: 
   [ { description: 'manifest',
       type: 'getMetadata_response_200',
       arg: 'data',
       root: true } ],
  http: { verb: 'get', path: '/metadata' },
  description: 'Return the endpoints available in the Driver Component' }
);
driver.remoteMethod('getSettings',
  { isStatic: true,
  produces: [ 'application/json' ],
  accepts: [],
  returns: 
   [ { description: 'settings',
       type: 'settings',
       arg: 'data',
       root: true } ],
  http: { verb: 'get', path: '/settings' },
  description: 'Return the settings of the driver' }
);

driver.remoteMethod('updateSettings',
  { isStatic: true,
  consumes: [ 'application/json' ],
  produces: [ 'application/json' ],
  accepts: 
   [ { arg: 'sensordata',
       type: 'settings',
       description: 'device object that will update existing one',
       required: true,
       http: { source: 'body' } } ],
  returns: [],
  http: { verb: 'put', path: '/settings' },
  description: 'Update existing settings' }
);


}
