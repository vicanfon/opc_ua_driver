// const deviceClass = require("../drivercomponent/deviceClass")(this.app.models);
let evaluator = require("math-expression-evaluator");
let logger;
// code for connecting to pubsub
let vfosMessagingPubsub = require("../pubsub/index.js");
var fs = require("fs");
let moduleConfiguration = JSON.parse(fs.readFileSync('moduleConfiguration.json', 'utf8'));
// this parameters are read from some external json
let broker = moduleConfiguration.broker;
let userName = moduleConfiguration.userName;
let platformDomain = moduleConfiguration.platformDomain;
let routingKeys = moduleConfiguration.routingKeys;
let pubsub = moduleConfiguration.activation;
let communications;

if (pubsub){
  communications = new vfosMessagingPubsub(broker, userName, platformDomain, routingKeys);
} 


module.exports = function(sensor) {

/**
 * register a sensor of a given device
 * @param {string} deviceId ID of device
 * @param {sensorConfiguration} sensorData data of the sensor
 * @callback {Function} callback Callback function
 * @param {Error|string} err Error object
 * @param {any} result Result object
 */
sensor.addSensorToDevice = function (deviceId, sensorData, callback) {

  // objects to create or find instances on the database
  const sensorDataObject = this.app.models.sensorData;
  const sensorConfiguration = this.app.models.sensorConfiguration;
  const dataMeasure = this.app.models.dataMeasure;

  // I have to register the sensor and the sensorConfiguration
  const deviceConf = this.app.models.deviceConfiguration;

  deviceConf.find({where: {_did: deviceId}, limit: 1}).then(
    function (deviceConfig) {
  
  //sensorConfiguration.create(sensorData)
  sensorConfiguration.findOrCreate({where: {_sid: sensorData._sid}, limit: 1}, sensorData)
    .then(function (sensorConfig) {
      callback(null,"ok");
    })
    .catch(function (err) {
      callback(err);
    });
  }).catch(function (err) {
    callback(err);
  });
}


/**
 * Find sensor by ID
 * @param {string} deviceId ID of device to return
 * @param {string} sensorId ID of sensor to return
 * @callback {Function} callback Callback function
 * @param {Error|string} err Error object
 * @param {sensorConfiguration} result Result object
 */
sensor.getSensorById = function(deviceId, sensorId, callback) {
  
    
  const sensorConfiguration = this.app.models.sensorConfiguration;

  sensorConfiguration.find({where: {_did: deviceId, _sid: sensorId}, limit: 1})
  //deviceConfiguration.find()
  .then(function(result){
    callback(null, result);
  })
  .catch(function(err){
    console.log(err);
    callback(err);
  })
  
  /*
  var err1 = new Error('device not found');
  err1.statusCode = 404;
  return cb(err1);
  */ 
}


/**
 * Update an existing sensor
 * @param {string} deviceId device id of the device that you want to update
 * @param {string} sensorId ID of sensor to return
 * @param {sensorConfiguration} sensordata device object that will update existing one
 * @callback {Function} callback Callback function
 * @param {Error|string} err Error object
 * @param {any} result Result object
 */
sensor.updateSensor = function(deviceId, sensorId, sensordata, callback) {

  const deviceConf = this.app.models.deviceConfiguration;
  const sensorConfiguration = this.app.models.sensorConfiguration;

  // I have to register the sensor and the sensorConfiguration
  sensorConfiguration.upsert(sensordata)
    .then(function (result) {
      callback(null, sensorConfiguration._sid);
    })
    .catch(function (err) {
      console.log(err);
      callback(err);
    });
  /*
  var err1 = new Error('Device not found');
  err1.statusCode = 404;
  return cb(err1);
  */ 
  /*
  var err2 = new Error('Validation exception');
  err2.statusCode = 405;
  return cb(err2);
  */ 
}


/**
 * Delete a sensor by ID
 * @param {string} deviceId ID of device to return
 * @param {string} sensorId ID of sensor to return
 * @callback {Function} callback Callback function
 * @param {Error|string} err Error object
 * @param {any} result Result object
 */
sensor.deleteSensor = function(deviceId, sensorId, callback) {
  
  const sensorConfiguration = this.app.models.sensorConfiguration;

  sensorConfiguration.destroyAll({_did: deviceId, _did: deviceId})
  .then(function(result){
    callback(null, {msg: "Instances deleted:" + result.count});
  })
  .catch(function(err){
    console.log(err);
    callback(err);
  });
  
  /*
  var err0 = new Error('Invalid ID supplied');
  err0.statusCode = 400;
  return cb(err0);
  */ 
  /*
  var err1 = new Error('device not found');
  err1.statusCode = 404;
  return cb(err1);
  */ 
}


/**
 * Get data from device / sensor
 * @param {string} deviceId ID of device
 * @param {string} sensorId ID of sensor
 * @callback {Function} callback Callback function
 * @param {Error|string} err Error object
 * @param {dataMeasure} result Result object
 */
sensor.getDataSensor = function (deviceId, sensorId, callback) {

  // 1. It retrieves sensor configuration info
  const sensorConfiguration = this.app.models.sensorConfiguration;
  const deviceConf = this.app.models.deviceConfiguration;
  const dataMeasure = this.app.models.dataMeasure;
  
  deviceConf.find({where: {_did: deviceId}, limit: 1}).then(
    function (deviceConfig) {
      sensorConfiguration.find({where: {_sid: sensorId}, limit: 1})
      .then(function (sensorConfig) {
      // 2. It retrieves a specific driver to process the reading on the appropiate protocol according to the sensor
      // it send a logger function to store the logs that will be sent to the platform
      let specificDriver = require("../driverImplementation/" + sensorConfig[0].driver.protocol)(logger);

      // 3. It uses the driver to make the propietary call to the physical device and receive it in agnostic format
      specificDriver.readSensorData(deviceConfig[0], sensorConfig[0]).then(compute_and_store).catch(function(e){callback(null, {
        _did: sensorConfig[0]._did,
        _sid: sensorConfig[0]._sid,
        data: e[0],
        unit: sensorConfig[0].properties.unit,
        timestamp: e[2],
        status: e[1]? e[1] : e.message
      });});

      function compute_and_store(data) {
        // 4. It substitutes the value of the sensor within a computing expression and processes it
        if (sensorConfig[0].properties.type == "Double"){
          data[0] = evaluator.lex(sensorConfig[0].computingExpression.replace("%v", data[0])).toPostfix().postfixEval();
        }
        let data_package = {
          _did: sensorConfig[0]._did,
          _sid: sensorConfig[0]._sid,
          data: data[0],
          unit: sensorConfig[0].properties.unit,
          timestamp: data[2],
          status: data[1]
        }
        // 5. If historicalData is activated, it stores the measure in a local database
        if (sensorConfig[0].historicData) {
          data_package._did = sensorConfig[0]._did;
          data_package._sid = sensorConfig[0]._sid;
          data_package.timestamp = new Date(data_package.timestamp).toLocaleString();
          dataMeasure.create(data_package).catch(logger);
        }

        // 6. It will push the data to the vf-OS platform
        if (pubsub){
            let pubSubDestination1 = "pt.vfos.drivers."+ sensorConfig[0].driver.protocol + "." + sensorConfig[0]._did + "." + sensorConfig[0]._sid;
            let pubSubMessage1 = data_package;
            communications.sendPublication(pubSubDestination1, JSON.stringify(pubSubMessage1));
        }
        
        // 7. It finishes the request method when called using the REST API
        callback(null, data_package); //protocol agnostic
      }
    });
    }
  ).catch(function (err) {
      console.log(err);
    });
}


/**
 * subscribe Sensor
 * @param {string} deviceId ID of device
 * @param {string} sensorId ID of sensor
 * @callback {Function} callback Callback function
 * @param {Error|string} err Error object
 * @param {any} result Result object
 */
sensor.subscribeSensor = function(deviceId, sensorId, callback) {

  const dataMeasure = this.app.models.dataMeasure;

  // I have to register the sensor and the sensorConfiguration
  const deviceConf = this.app.models.deviceConfiguration;

  const sensorConfiguration = this.app.models.sensorConfiguration;


  deviceConf.find({where: {_did: deviceId}, limit: 1}).then(
    function (deviceConfig) {
    sensorConfiguration.find({where: {_did: deviceId, _sid: sensorId}, limit: 1})
    .then(function (sensorConfig) {
      // Checking if there are triggers so that a subscription can be created
      if (sensorConfig[0].events.length > 0) {
        // 2. It retrieves a specific driver to process the reading on the appropiate protocol according to the sensor
        // it send a logger function to store the logs that will be sent to the platform
        let specificDriver = require("../driverImplementation/" + sensorConfig[0].driver.protocol)(logger);

        // 3. It uses the driver to make the propietary call to the physical device and receive it in agnostic format
        specificDriver.subscribe(deviceConfig[0], sensorConfig[0], pushToPlatform).then(()=>{callback(null, "ok")}).catch(function(e){
          callback(null, {
          _did: sensorConfig[0]._did,
          _sid: sensorConfig[0]._sid,
          data: e[0],
          unit: sensorConfig[0].properties.unit,
          timestamp: e[2],
          status: e[1]
        });
      });

        function pushToPlatform(data){
          // 4. It substitutes the value of the sensor within a computing expression and processes it
          if (sensorConfig[0].properties.type == "Double"){
            data[0] = evaluator.lex(sensorConfig[0].computingExpression.replace("%v", data[0])).toPostfix().postfixEval();
          }
          let data_package = {
            _did: sensorConfig[0]._did,
            _sid: sensorConfig[0]._sid,
            data: data[0],
            unit: sensorConfig[0].properties.unit,
            timestamp: data[2],
            status: data[1]
          }
          // 5. If historicalData is activated, it stores the measure in a local database
          if (sensorConfig[0].historicData) {
            data_package.timestamp = new Date(data_package.timestamp).toLocaleString();
            dataMeasure.create(data_package).catch(logger);
          }
          // 6. It will push the data to the vf-OS platform
          if (pubsub){
            let pubSubDestination1 = "pt.vfos.drivers."+ sensorConfig[0].driver.protocol + "." + sensorConfig[0]._did + "." + sensorConfig[0]._sid;
            let pubSubMessage1 = data_package;
            communications.sendPublication(pubSubDestination1, JSON.stringify(pubSubMessage1));
          }
        }
      }
    })
    .catch(function (err) {
      callback(err);
    });
  }).catch(function (err) {
    callback(err);
  });
}


/**
 * Send Command to Device / Sensor
 * @param {string} deviceId ID of device
 * @param {string} sensorId ID of sensor
 * @param {commandOrder} command command sent to the sensor
 * @callback {Function} callback Callback function
 * @param {Error|string} err Error object
 * @param {any} result Result object
 */
sensor.sendCommand = function (deviceId, sensorId, command, callback) {
  let i;
  // 1. It retrieves sensor configuration info
  const sensorConfiguration = this.app.models.sensorConfiguration;
  const deviceConf = this.app.models.deviceConfiguration;

  deviceConf.find({where: {_did: deviceId}, limit: 1}).then(
    function (deviceConfig) {
      sensorConfiguration.find({where: {_sid: sensorId}, limit: 1})

    .then(function (sensorConfig) {
      // 2. It retrieves a specific driver to process the reading on the appropiate protocol according to the sensor
      // it send a logger function to store the logs that will be sent to the platform
      let specificDriver = require("../driverImplementation/" + sensorConfig[0].driver.protocol)(logger);

      // 3. It uses the driver to make the propietary call send data to the sensor in agnostic
      specificDriver.sendCommand(deviceConfig[0], sensorConfig[0], command).then(result => callback(null, result)).catch(e=>callback(e.message));

    })
    .catch(function (err) {
      console.log(err);
    });
  });

  /*
  var err0 = new Error('Invalid ID supplied');
  err0.statusCode = 400;
  return cb(err0);
  */
  /*
  var err1 = new Error('device not found');
  err1.statusCode = 404;
  return cb(err1);
  */
}


/**
 * Get historic data from device / sensor
 * @param {string} deviceId ID of device
 * @param {string} sensorId ID of sensor
 * @param {string} start date from which measures are returned
 * @param {string} end date until measures are returned
 * @callback {Function} callback Callback function
 * @param {Error|string} err Error object
 * @param {dataMeasure} result Result object
 */
sensor.getHistoricDataSensor = function (deviceId, sensorId, start, end, callback) {

  const sensorConfiguration = this.app.models.sensorConfiguration;
  const deviceConf = this.app.models.deviceConfiguration;
  const dataMeasure = this.app.models.dataMeasure;

  // let dateInit = new Date(start).toLocaleString();
  // let dateEnd = new Date(end).toLocaleString();
  
  dataMeasure.find({where: {_did: deviceId, _sid: sensorId, timestamp: {gte: start}, timestamp: {lte: end}}})
  .then(result =>{
    callback(null, result);
  })
  .catch(e=>{
    callback(e)
  });

  /*
  var err0 = new Error('Invalid ID supplied');
  err0.statusCode = 400;
  return cb(err0);
  */
  /*
  var err1 = new Error('device not found');
  err1.statusCode = 404;
  return cb(err1);
  */
}




sensor.remoteMethod('addSensorToDevice',
  { isStatic: true,
  consumes: [ 'appplication/json' ],
  produces: [ 'application/json' ],
  accepts: 
   [ { arg: 'deviceId',
       type: 'string',
       description: 'ID of device',
       required: true,
       http: { source: 'path' } },
     { arg: 'sensorData',
       type: 'sensorConfiguration',
       description: 'data of the sensor',
       required: true,
       http: { source: 'body' } } ],
  returns: [],
  http: { verb: 'post', path: '/devices/:deviceId/sensors' },
  description: 'register a sensor of a given device' }
);

sensor.remoteMethod('getSensorById',
  { isStatic: true,
  produces: [ 'application/json' ],
  accepts: 
   [ { arg: 'deviceId',
       type: 'string',
       description: 'ID of device to return',
       required: true,
       http: { source: 'path' } },
     { arg: 'sensorId',
       type: 'string',
       description: 'ID of sensor to return',
       required: true,
       http: { source: 'path' } } ],
  returns: 
   [ { description: 'successful operation',
       type: 'sensorConfiguration',
       arg: 'data',
       root: true } ],
  http: { verb: 'get', path: '/devices/:deviceId/sensors/:sensorId' },
  description: 'Find sensor by ID' }
);

sensor.remoteMethod('updateSensor',
  { isStatic: true,
  consumes: [ 'application/json' ],
  produces: [ 'application/json' ],
  accepts: 
   [ { arg: 'deviceId',
       type: 'string',
       description: 'device id of the device that you want to update',
       required: true,
       http: { source: 'path' } },
     { arg: 'sensorId',
       type: 'string',
       description: 'ID of sensor to return',
       required: true,
       http: { source: 'path' } },
     { arg: 'sensordata',
       type: 'sensorConfiguration',
       description: 'device object that will update existing one',
       required: true,
       http: { source: 'body' } } ],
  returns: [],
  http: { verb: 'put', path: '/devices/:deviceId/sensors/:sensorId' },
  description: 'Update an existing sensor' }
);

sensor.remoteMethod('deleteSensor',
  { isStatic: true,
  produces: [ 'application/json' ],
  accepts: 
   [ { arg: 'deviceId',
       type: 'string',
       description: 'ID of device to return',
       required: true,
       http: { source: 'path' } },
     { arg: 'sensorId',
       type: 'string',
       description: 'ID of sensor to return',
       required: true,
       http: { source: 'path' } } ],
  returns: [],
  http: { verb: 'delete', path: '/devices/:deviceId/sensors/:sensorId' },
  description: 'Delete a sensor by ID' }
);

sensor.remoteMethod('getDataSensor',
  { isStatic: true,
  produces: [ 'application/json' ],
  accepts: 
   [ { arg: 'deviceId',
       type: 'string',
       description: 'ID of device',
       required: true,
       http: { source: 'path' } },
     { arg: 'sensorId',
       type: 'string',
       description: 'ID of sensor',
       required: true,
       http: { source: 'path' } } ],
  returns: 
   [ { description: 'successful operation',
       type: 'dataMeasure',
       arg: 'data',
       root: true } ],
  http: 
   { verb: 'get',
     path: '/devices/:deviceId/sensors/:sensorId/Data' },
  description: 'Get data from device / sensor' }
);

sensor.remoteMethod('subscribeSensor',
  { isStatic: true,
  consumes: [ 'appplication/json' ],
  accepts: 
   [ { arg: 'deviceId',
       type: 'string',
       description: 'ID of device',
       required: true,
       http: { source: 'path' } },
     { arg: 'sensorId',
       type: 'string',
       description: 'ID of sensor',
       required: true,
       http: { source: 'path' } } ],
  returns: [],
  http: 
   { verb: 'post',
     path: '/devices/:deviceId/sensors/:sensorId/Subscribe' },
  description: 'subscribe Sensor' }
);

sensor.remoteMethod('sendCommand',
  { isStatic: true,
  consumes: [ 'appplication/json' ],
  accepts: 
   [ { arg: 'deviceId',
       type: 'string',
       description: 'ID of device',
       required: true,
       http: { source: 'path' } },
     { arg: 'sensorId',
       type: 'string',
       description: 'ID of sensor',
       required: true,
       http: { source: 'path' } },
     { arg: 'command',
       type: 'commandOrder',
       description: 'command sent to the sensor',
       required: true,
       http: { source: 'body' } } ],
  returns: [],
  http: 
   { verb: 'post',
     path: '/devices/:deviceId/sensors/:sensorId/Command' },
  description: 'Send Command to Device / Sensor' }
);

sensor.remoteMethod('getHistoricDataSensor',
  { isStatic: true,
  produces: [ 'application/json' ],
  accepts: 
   [ { arg: 'deviceId',
       type: 'string',
       description: 'ID of device',
       required: true,
       http: { source: 'path' } },
     { arg: 'sensorId',
       type: 'string',
       description: 'ID of sensor',
       required: true,
       http: { source: 'path' } },
     { arg: 'start',
       type: 'string',
       description: 'date from which measures are returned',
       required: true,
       http: { source: 'query' } },
     { arg: 'end',
       type: 'string',
       description: 'date until measures are returned',
       required: true,
       http: { source: 'query' } } ],
  returns: 
   [ { description: 'successful operation',
       type: [ 'dataMeasure' ],
       arg: 'data',
       root: true } ],
  http: 
   { verb: 'get',
     path: '/devices/:deviceId/sensors/:sensorId/Data/HistoricData' },
  description: 'Get historic data from device / sensor' }
);

}
