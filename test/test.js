var assert = require('chai').assert;
// var sinon = require('sinon');
var test_data = require('./test_data');
let manifesto = test_data.manifesto;
let specificDriver = require("../common/driverImplementation/" + manifesto.driver)();

var testCases = require('./test_cases');



describe('Drivers Test Suite', function () {
  this.timeout(30000);


  let test_util= require('./test_util');

  describe('Structural Test: coverage of APIs', function () {

    it('Test readSensorData API ', function (done) {
      assert.isFunction(specificDriver.readSensorData, 'test passed');
      done();
    });

    it('Test subscribe API ', function (done) {
      assert.isFunction(specificDriver.subscribe, 'test passed');
      done();
    });

    it('Test sendCommand API ', function (done) {
      assert.isFunction(specificDriver.sendCommand, 'test passed');
      done();
    });
  });
  
  describe('Unit Test: coverage of Unit test grouped by user stories', function () {
    describe('DRUS001 Receive asynchronous data from device ', function () {
      test_util("test0001");
    });
    describe('DRUS006 Query devices / sensors ', function () {
      test_util("test0003");
    });
    describe('DRUS007 Offers API for reading low latency stream data ', function () {
      test_util("test0004");
    });
    describe('DRUS016 List existing devices already configured', function () {
      test_util("test0005");
    });
    describe('DRUS010 Register device on vf-OS', function () {
      test_util("test0006");
    });
    describe('DRUS011 Register asynchronous sensors of device ', function () {
      test_util("test0007");
    });
    describe('DRUS012 Register synchronous sensors of device', function () {
      test_util("test0007");
    });
    describe('DRUS019 Check device status ', function () {
      test_util("test0009");
    });
    describe('DRUS020 Check sensor status ', function () {
      test_util("test0010");
    });
    describe('DRUS021 List existing drivers of a specific vf-OS instance installation ', function () {
      test_util("test0011");
    });
    describe('DRUS025 Manifest reading', function () {
      test_util("test0012");
    });
  });

  describe('Integration Test:s coverage of Integration test', function () {
    describe('DRUS002 Push data on pub/sub ', function () {
      test_util("test0002");
    });
  });
});
