

module.exports = function(device) {

  /**
   * Register new device
   * @param {deviceConfiguration} devicedata device object that needs to be added to the store
   * @callback {Function} callback Callback function
   * @param {Error|string} err Error object
   * @param {any} result Result object
   */
  device.addDevice = function(devicedata, callback) {
  
      // objects to create or find instances on the database
    const deviceConf = this.app.models.deviceConfiguration;
  
      // I have to register the sensor and the sensorConfiguration
      deviceConf.create(devicedata)
        .then(function (result) {
          callback(null, result.id);
        })
        .catch(function (err) {
          console.log(err);
          callback(err);
        });
      }
  
  
  /**
   * list existing registered devices
  
   * @callback {Function} callback Callback function
   * @param {Error|string} err Error object
   * @param {deviceConfiguration} result Result object
   */
  device.listDevices = function(callback) {
  
        // objects to create or find instances on the database
        const deviceConf = this.app.models.deviceConfiguration;
  
        // I have to register the sensor and the sensorConfiguration
        deviceConf.find()
          .then(function (result) {
            callback(null, result);
          })
          .catch(function (err) {
            console.log(err);
            callback(err);
          });
    
  }
  
  
  /**
   * Update an existing device
   * @param {string} deviceId device id of the device that you want to update
   * @param {deviceConfiguration} devicedata device object that will update existing one
   * @callback {Function} callback Callback function
   * @param {Error|string} err Error object
   * @param {any} result Result object
   */
  device.updateDevice = function(deviceId, devicedata, callback) {
  
    const deviceConf = this.app.models.deviceConfiguration;
  
    // I have to register the sensor and the sensorConfiguration
    deviceConf.upsert(devicedata)
      .then(function (result) {
        callback(null, deviceConf._did);
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
   * Find device by ID
   * @param {string} deviceId ID of device to return
   * @callback {Function} callback Callback function
   * @param {Error|string} err Error object
   * @param {deviceConfiguration} result Result object
   */
  device.getDeviceById = function(deviceId, callback) {
  
    const deviceConfiguration = this.app.models.deviceConfiguration;
  
    deviceConfiguration.find({where: {_did: deviceId}, limit: 1})
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
   * Delete a device by ID
   * @param {string} deviceId ID of device to return
   * @callback {Function} callback Callback function
   * @param {Error|string} err Error object
   * @param {any} result Result object
   */
  device.deleteDevice = function(deviceId, callback) {
  
    const deviceConfiguration = this.app.models.deviceConfiguration;
    deviceConfiguration.destroyAll({_did: deviceId})
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
   * Get Status of a given device
   * @param {string} deviceId ID of device
   * @callback {Function} callback Callback function
   * @param {Error|string} err Error object
   * @param {deviceStatus} result Result object
   */
  device.getDeviceStatus = function(deviceId, callback) {
  
    // Replace the code below with your implementation.
    // Please make sure the callback is invoked.
    process.nextTick(function() {
      var err = new Error('Not implemented');
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
   * list sensors of a given device
   * @param {string} deviceId ID of device
   * @callback {Function} callback Callback function
   * @param {Error|string} err Error object
   * @param {sensorData} result Result object
   */
  device.getDeviceSensors = function(deviceId, callback) {
  
        // objects to create or find instances on the database
        const sensorConfiguration = this.app.models.sensorConfiguration;
  
        // I have to register the sensor and the sensorConfiguration
        sensorConfiguration.find({where: {_did: deviceId}})
          .then(function (result) {
            callback(null, result);
          })
          .catch(function (err) {
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
  


device.remoteMethod('addDevice',
  { isStatic: true,
  consumes: [ 'application/json' ],
  produces: [ 'application/json' ],
  accepts: 
   [ { arg: 'devicedata',
       type: 'deviceConfiguration',
       description: 'device object that needs to be added to the store',
       required: true,
       http: { source: 'body' } } ],
  returns: [],
  http: { verb: 'post', path: '/devices' },
  description: 'Register new device' }
);

device.remoteMethod('listDevices',
  { isStatic: true,
  produces: [ 'application/json' ],
  accepts: [],
  returns: 
   [ { description: 'id of the device created',
       type: [ 'deviceConfiguration' ],
       arg: 'data',
       root: true } ],
  http: { verb: 'get', path: '/devices' },
  description: 'list existing registered devices' }
);

device.remoteMethod('updateDevice',
  { isStatic: true,
  consumes: [ 'application/json' ],
  produces: [ 'application/json' ],
  accepts: 
   [ { arg: 'deviceId',
       type: 'string',
       description: 'device id of the device that you want to update',
       required: true,
       http: { source: 'path' } },
     { arg: 'devicedata',
       type: 'deviceConfiguration',
       description: 'device object that will update existing one',
       required: true,
       http: { source: 'body' } } ],
  returns: [],
  http: { verb: 'put', path: '/devices/:deviceId' },
  description: 'Update an existing device' }
);

device.remoteMethod('getDeviceById',
  { isStatic: true,
  produces: [ 'application/json' ],
  accepts: 
   [ { arg: 'deviceId',
       type: 'string',
       description: 'ID of device to return',
       required: true,
       http: { source: 'path' } } ],
  returns: 
   [ { description: 'successful operation',
       type: 'deviceConfiguration',
       arg: 'data',
       root: true } ],
  http: { verb: 'get', path: '/devices/:deviceId' },
  description: 'Find device by ID' }
);

device.remoteMethod('deleteDevice',
  { isStatic: true,
  produces: [ 'application/json' ],
  accepts: 
   [ { arg: 'deviceId',
       type: 'string',
       description: 'ID of device to return',
       required: true,
       http: { source: 'path' } } ],
  returns: [],
  http: { verb: 'delete', path: '/devices/:deviceId' },
  description: 'Delete a device by ID' }
);

device.remoteMethod('getDeviceStatus',
  { isStatic: true,
  produces: [ 'application/json' ],
  accepts: 
   [ { arg: 'deviceId',
       type: 'string',
       description: 'ID of device',
       required: true,
       http: { source: 'path' } } ],
  returns: 
   [ { description: 'successful operation',
       type: 'deviceStatus',
       arg: 'data',
       root: true } ],
  http: { verb: 'get', path: '/devices/:deviceId/status' },
  description: 'Get Status of a given device' }
);

device.remoteMethod('getDeviceSensors',
  { isStatic: true,
  produces: [ 'application/json' ],
  accepts: 
   [ { arg: 'deviceId',
       type: 'string',
       description: 'ID of device',
       required: true,
       http: { source: 'path' } } ],
  returns: 
   [ { description: 'successful operation',
       type: [ 'sensorConfiguration' ],
       arg: 'data',
       root: true } ],
  http: { verb: 'get', path: '/devices/:deviceId/sensors' },
  description: 'list sensors of a given device' }
);

}
