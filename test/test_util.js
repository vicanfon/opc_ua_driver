var test_functions = require('./test_cases');
var assert = require('chai').assert;
var app;
var supertest;
var api;
var test_data = require('./test_data');
let manifesto = test_data.manifesto;
var app = require('../server/server');
var supertest = require('supertest');
var api = supertest(app);
var fs = require("fs");
let moduleConfiguration = JSON.parse(fs.readFileSync('moduleConfiguration.json', 'utf8'));


module.exports = function testbuilder(testCase) {
  let testData = test_functions[testCase];
  let specificDriver;

  if (testData === undefined) {
    it(testCase, function (done) {
      assert(false, 'test undefined');
      done();
    });

  } else {

    it(testCase + ' - ' + testData.description, function (done) {

      switch (testData.type) {
        case "driver":
          specificDriver = require("../common/driverImplementation/" + manifesto.driver)();
          specificDriver[testData.method](...testData.data)
            .then(x => {
              assert(eval(testData.result_condition), 'passed');
              //done();
            })
            .catch(x => {
              assert.isOk(false, "error");
              //done();
            });
          break;
        case "model":
          specificDriver = require("../common/driverImplementation/" + manifesto.driver)();
          if (testData.method == "get" || testData.method == "delete") {
            api[testData.method](testData.url).expect(testData.result_condition);
          } else if (testData.method == "post" || testData.method == "put") {
            api[testData.method](testData.url).send(testData.data).expect(testData.result_condition);
          }
          break;
        case "integration":
          const vfosMessagingPubsub = require("../common/pubsub/index");
          var broker = moduleConfiguration.broker;
          var userName = "archiver1";
          var domain = moduleConfiguration.platformDomain;
          var routingKeys = ["pt.vfos.drivers.#"];
          specificDriver = require("../common/driverImplementation/" + manifesto.driver)();

          if (testData.class == "publish") {
            api[testData.method](testData.url)
            .then(x =>{
              assert(x.statusCode == testData.result_condition, "passed");
            });
            //.expect(testData.result_condition);
          } else if (testData.class == "suscribe") {
            api[testData.method](testData.url).send(testData.data).expect(testData.result_condition);
          }
          var communications = new vfosMessagingPubsub(broker, userName, domain, routingKeys);
          function messageHandler(msg) {
            console.log("->>>>>>>>>>>>>>>>>\"");
            console.log("> ProcessEngine: msg.content = \"" + msg.content.toString() + "\"");
            console.log("> ProcessEngine: msg.id = \"" + msg.id + "\"");
            console.log("> ProcessEngine: msg.routingKey = \"" + msg.routingKey + "\"");
          }
          
          communications.registerPublicationReceiver(messageHandler);
          break;
      }
      done();
    });
  }
}