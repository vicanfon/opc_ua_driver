// Specific driver
// it covers the mappings to specific protocols
// the methods will be used by devices

module.exports = function (loggerCB) {

    // callback method to send error messages back to the platform to be logged
    this.logger = loggerCB;

    

    // mandatory methods of the driver. Any developer must code them
    return {
        /**
         * method called by the Devide Driver SDK when reading a sensor according to the protocol
         * @param {object} sensorConf configuration of a sensor containing the proprietary parameters to connect to a server and read data
         * @callback {Function} callback Callback function
         *      @param {string} result string with the value of the sensor data
         */
        readSensorData: async function (deviceConf, sensorConf) {

                return ["5", "Good", new Date()];
        },
        /**
         * method called by the Devide Driver SDK when subscribing to changes of a sensor
         * @param {object} sensorConf configuration of a sensor containing the proprietary parameters to subscribe to a server monitoring sensor changes
         * @callback {Function} callback Callback function
         *      @param {string} result string with the value of the sensor data
         */
        subscribe: async function (deviceConf, sensorConf, callback) {
            let last_date = new Date();
            while (i<10){
                if(i % 2){
                    callback(null, [Math.floor((Math.random() * 10) + 1).toString(), "Good", last_date]);
                }else{
                    callback(null, ["0", "err", last_date]);
                }
            }
        },
        /**
         * method called by the Devide Driver SDK when sending a command action to a sensor
         * @param {object} command command for the sensor
         * @callback {Function} callback Callback function
         *      @param {string} acknowledge string with a message of success or failure
         */
        sendCommand: async function (deviceConf, sensorConf, command) {
            
            return command.command;
        },
        releaseConnexion: async function () {
            await client.closeSession(session,true);
            session= null;
            await client.disconnect();
            client= null;
        },
        getDriverMetadata: function () {
            // propietaryParameters: list of propietary parameters that will be part of the configuration necessary 
            // to handle to work properly
            // @param [subscription_requestedPublishingInterval=2000] {Integer} how often the server checks if there are notification packages.
            // @param [subscription_requestedLifetimeCount="100"] {Integer} the number of PublishingIntervals to wait for a new PublishRequest, before realizing that the client is no longer active.
            // @param [subscription_requestedMaxKeepAliveCount="2"] {Integer} how many intervals may be skipped, before an empty notification is sent anyway.
            // @param [subscription_maxNotificationsPerPublish="10"] {Integer} ???.
            // @param [subscription_publishingEnabled=true] {Boolean} ???.
            // @param [subscription_priority="10"] {Integer} Priority ???.
            // @param [security_certificatefile="certificates/client_selfsigned_cert_1024.pem"] {String} client certificate pem file.
            // @param [security_privatekeyfile="certificates/client_key_1024.pem"] {String} client private key pem file.
            // @param [security_securityMode=MessageSecurityMode.None] {MessageSecurityMode} the default security mode.
            // @param [security_securityPolicy =SecurityPolicy.NONE] {SecurityPolicy} the security mode.
            let device_proprietaryParameters = ["attr1"];
            let sensor_proprietaryParameters = ["attr2"];

            return {
                driver: "dummy",
                device_proprietaryParameters: device_proprietaryParameters,
                sensor_proprietaryParameters: sensor_proprietaryParameters
            };
        }
    }
    
}