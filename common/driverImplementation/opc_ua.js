// Specific driver
// it covers the mappings to specific protocols
// the methods will be used by devices

let opcua = require("node-opcua");

module.exports = function (loggerCB) {

    // callback method to send error messages back to the platform to be logged
    this.logger = loggerCB;
    let mappingTypes = {
        Boolean: opcua.DataType.Boolean,
        Integer: opcua.DataType.Int32,
        Double: opcua.DataType.Double,
        String: opcua.DataType.String 
    };
    

    // private variables
    let client = null;
    let session = null;
    let subscription = null;
    let last_measure = 0;
    let last_date = new Date();

    // mandatory methods of the driver. Any developer must code them
    return {
        /**
         * method called by the Devide Driver SDK when reading a sensor according to the protocol
         * @param {object} sensorConf configuration of a sensor containing the proprietary parameters to connect to a server and read data
         * @callback {Function} callback Callback function
         *      @param {string} result string with the value of the sensor data
         */
        readSensorData: async function (deviceConf, sensorConf) {
            await get_Session(deviceConf).catch(function(e){
                throw [last_measure, e.message, null]
            });
            let sensorPropietaryId = sensorConf.propietaryParameters.find(item => item.name == "sensorPropietaryId").value;

            let dataValue = await session.readVariableValue(sensorPropietaryId);
            
            if (! dataValue.statusCode.value){
                //assign status
                last_measure = dataValue.value.value;
                last_date = new Date();
                return [dataValue.value.value.toString(), "Good", last_date];
            }else{
                //there is an error
                throw [last_measure, dataValue.statusCode.description, last_date];
            }
        },
        /**
         * method called by the Devide Driver SDK when subscribing to changes of a sensor
         * @param {object} sensorConf configuration of a sensor containing the proprietary parameters to subscribe to a server monitoring sensor changes
         * @callback {Function} callback Callback function
         *      @param {string} result string with the value of the sensor data
         */
        subscribe: async function (deviceConf, sensorConf, callback) {
            await get_Session(deviceConf).catch(function(e){throw [last_measure, e.message, null]});
            await get_Subscription(deviceConf).catch(function(e){throw [last_measure, e.message, null]});
            let sensorPropietaryId = sensorConf.propietaryParameters.find(item => item.name == "sensorPropietaryId").value;

            let sensorOptions = {
                samplingInterval: sensorConf.events[0].intervalTime,
                discardOldest: true,
                queueSize: 10
            };
            // install monitored item
            var monitoredItem = subscription.monitor({
                    nodeId: opcua.resolveNodeId(sensorPropietaryId),
                    attributeId: opcua.AttributeIds.Value
                }, sensorOptions,
                opcua.read_service.TimestampsToReturn.Both
            );

            monitoredItem.on("changed", function (dataValue) {
                last_measure = dataValue.value.value;
                last_date = new Date();
                callback([last_measure, "Good", last_date]);
            });

            monitoredItem.on("err", function (err) {
                callback([last_measure, "err", last_date]);
            });
        },
        /**
         * method called by the Devide Driver SDK when sending a command action to a sensor
         * @param {object} command command for the sensor
         * @callback {Function} callback Callback function
         *      @param {string} acknowledge string with a message of success or failure
         */
        sendCommand: async function (deviceConf, sensorConf, command) {
            await get_Session(deviceConf);
            let sensorPropietaryId = sensorConf.propietaryParameters.find(item => item.name == "sensorPropietaryId").value;

            // node to write
            var nodesToWrite = [{
                nodeId: sensorPropietaryId,
                attributeId: opcua.AttributeIds.Value,
                indexRange: null,
                value: {
                    value: {
                        dataType: mappingTypes[sensorConf.properties.type],
                        value: command.command
                    }
                }
            }];

            let dataValue = await session.write(nodesToWrite);
            return dataValue[0].name;
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
            let device_proprietaryParameters = [["resourcePath","opc.tcp://127.0.0.1:49320"], ["subscription_requestedPublishingInterval","2000"], ["subscription_requestedLifetimeCount","100"], ["subscription_requestedMaxKeepAliveCount","2"], ["subscription_maxNotificationsPerPublish","10"], ["subscription_publishingEnabled","true"], ["subscription_priority","10"], ["security_certificatefile","certificates/client_selfsigned_cert_1024.pem"], ["security_privatekeyfile","certificates/client_key_1024.pem"], ["security_securityMode","MessageSecurityMode.None"], ["subscription_maxNotificationsPerPublish","2"], ["security_securityPolicy","SecurityPolicy.NONE"]];
            let sensor_proprietaryParameters = [["sensorPropietaryId","ns=2;s=Channel1.Device1.EstadoTS"]];

            return {
                driver: "opc_ua",
                device_proprietaryParameters: device_proprietaryParameters,
                sensor_proprietaryParameters: sensor_proprietaryParameters
            };
        }
    }
    // Private methods
    async function get_Session(deviceConf) {
        if (session == null) {
            // Retrieval of OPC UA resourcePath and sensorId parameters to read the sensor
            let endpointUrl = deviceConf.propietaryParameters.find(item => item.name == "resourcePath").value;
            let options = {};
            let sec_1 = deviceConf.propietaryParameters.find(item => item.name == "security_certificatefile");
            let sec_2 = deviceConf.propietaryParameters.find(item => item.name == "security_privatekeyfile");
            let sec_3 = deviceConf.propietaryParameters.find(item => item.name == "security_securityMode");
            let sec_4 = deviceConf.propietaryParameters.find(item => item.name == "security_securityPolicy");
            if (sec_1) {
                options.certificateFile = deviceConf.propietaryParameters.find(item => item.name == "security_certificatefile").value;
            }
            if (sec_2) {
                options.privateKeyFile = deviceConf.propietaryParameters.find(item => item.name == "security_privatekeyfile").value
            }
            if (sec_3) {
                options.securityMode = deviceConf.propietaryParameters.find(item => item.name == "security_securityMode").value;
            }
            if (sec_4) {
                options.securityPolicy = deviceConf.propietaryParameters.find(item => item.name == "security_securityPolicy").value;
            }

            // OPC UA client instantiation
            client = new opcua.OPCUAClient(options);

            // setting up an series of asynchronous operation
            await client.connect(endpointUrl).catch(function(e){console.log(e); throw e;});
            session = await client.createSession();
        }
    }
    async function get_Subscription(deviceConf) {
        if (subscription == null) {
            // Retrieval of OPC UA resourcePath and sensorId parameters to read the sensor
            let subscription_requestedPublishingInterval = deviceConf.propietaryParameters.find( item => item.name == "subscription_requestedPublishingInterval").value;
            let subscription_requestedLifetimeCount = deviceConf.propietaryParameters.find( item => item.name == "subscription_requestedLifetimeCount").value;
            let subscription_requestedMaxKeepAliveCount = deviceConf.propietaryParameters.find( item => item.name == "subscription_requestedMaxKeepAliveCount").value;
            let subscription_maxNotificationsPerPublish = deviceConf.propietaryParameters.find( item => item.name == "subscription_maxNotificationsPerPublish").value;
            let subscription_publishingEnabled = deviceConf.propietaryParameters.find( item => item.name == "subscription_publishingEnabled").value;
            let subscription_priority = deviceConf.propietaryParameters.find( item => item.name == "subscription_priority").value;

            let connectionOptions = {
                requestedPublishingInterval: subscription_requestedPublishingInterval,
                requestedLifetimeCount: subscription_requestedLifetimeCount,
                requestedMaxKeepAliveCount: subscription_requestedMaxKeepAliveCount,
                maxNotificationsPerPublish: subscription_maxNotificationsPerPublish,
                publishingEnabled: subscription_publishingEnabled,
                priority: subscription_priority
            };

            subscription = await new opcua.ClientSubscription(session, connectionOptions);
        }
    }
}