let userPrompts = require("../../userPrompts");

module.exports = function(app) {
  // app.dataSources.io_datasource.autoupdate('settings', function(err) {
  //   if (err) throw err;

  //   app.models.settings.findOrCreate({where: {}, limit: 1}, {
  //     broker: "amqp://admin1:vfos@rabbitmq",
  //     userName: "opc_ua",
  //     platformDomain: "pt.vfos",
  //     routingKeys: '["pt.vfos.sensors.#"]',
  //     activation: false
  //   }, function(err, models) {
  //     if (err) throw err;
  //     console.log('Models created: \n', models);
  //   });
  // });

    app.dataSources.io_datasource.autoupdate('deviceConfiguration', function(err) {
      if (err) throw err;

      app.models.deviceConfiguration.findOrCreate({where: {_did: 'd1'}, limit: 1}, {
        _did: 'd1',
        name: userPrompts.deviceName,
        needProcessing: false,
        propietaryParameters: [{
            name: "resourcePath",
            value: userPrompts.resourcePath
          },
          {
            name: "security_securityPolicy",
            value: userPrompts.securityPolicy
          },
          {
            name: "security_securityMode",
            value: parseInt(userPrompts.securityMode)
          },
          {
            name: "subscription_requestedPublishingInterval",
            value: 2000
          },
          {
            name: "subscription_requestedLifetimeCount",
            value: 100
          },
          {
            name: "subscription_requestedMaxKeepAliveCount",
            value: 2
          },
          {
            name: "subscription_maxNotificationsPerPublish",
            value: 2
          },
          {
            name: "subscription_publishingEnabled",
            value: true
          },
          {
            name: "subscription_priority",
            value: 10
          }
        ]
      }, function(err, models) {
        if (err) throw err;

        console.log('Models created: \n', models);
      });
    });

    app.dataSources.io_datasource.autoupdate('sensorConfiguration', function(err) {
      if (err) throw err;

      let triggerConfig = JSON.stringify({
        samplingInterval: 100,
        discardOldest: true,
        queueSize: 10
      });

      app.models.sensorConfiguration.findOrCreate({where: {_sid: 's1'}, limit: 1}, {
        _sid: 's1',
        _did: 'd1',
        name: userPrompts.sensorName,
        properties: {
          name: "Code",
          type: userPrompts.type,
          value: "",
          unit: "units"
        },
        driver: {
          name: 'opc_ua_1',
          protocol: 'opc_ua',
          version: '1',
          description: 'driver for opc_ua'
        },
        events: [{
          type: 'subscription',
          intervalTime: 100
        }],
        historicData: true,
        computingExpression: "%v",
        actuator: false,
        propietaryParameters: [
          {
            name: "sensorPropietaryId",
            value: "ns="+ userPrompts.ns +";s=" + userPrompts.nodeId
          }
        ]
      }, function(err, models) {
        if (err) throw err;

        console.log('Models created: \n', models);
      });
    });

    function callback(msg){
      console.log("Suscribed succesfully");
    }

    app.models.sensorConfiguration.all()
    .then(result => {
      for (let item in result) {
        if (result[item].events != null && result[item].events.length > 0) {   
          app.models.sensor.subscribeSensor(result[item]._did, result[item]._sid, callback);
        }
      };
    })
    .catch(e => {
      console.log(e);
    });
  };
