let userPrompts = require("../userPrompts");
var fs = require("fs");
let manifesto = JSON.parse(fs.readFileSync('moduleConfiguration.json', 'utf8'));

module.exports = {
  manifesto: manifesto,
  deviceConfiguration: {
    _did: 'd1',
    name: userPrompts.deviceName,
    needProcessing: false,
    processingExpression:"v",
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
        name: "subscription_publishingEnabled",
        value: true
      },
      {
        name: "subscription_priority",
        value: 10
      }
    ]
  },
  sensorConfiguration: {
    _sid: 's1',
    _did: 'd1',
    name: userPrompts.sensorName,
    properties: {
      name: "Code",
      type: "real",
      value: "",
      unit: userPrompts.unit
    },
    driver: {
      name: 'opc_ua_1',
      protocol: 'opc_ua',
      version: '1',
      description: 'driver for opc_ua'
    },
    triggers: [{
      type: 'subscription',
      triggerConfig: {
        samplingInterval: 100,
        discardOldest: true,
        queueSize: 10
      }
    }],
    historicData: false,
    computingExpression: "%v",
    actuator: false,
    propietaryParameters: [{
      name: "sensorPropietaryId",
      value: "ns=" + userPrompts.ns + ";s=" + userPrompts.nodeId
    }]
  }
}
