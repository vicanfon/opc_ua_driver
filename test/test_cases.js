var test_data = require('./test_data');

module.exports = {
    test0001: {
        type: "driver",
        description: "test asynchronous read",
        data: [test_data.deviceConfiguration, test_data.sensorConfiguration],
        method: "readSensorData",
        result_condition: "(x.length == 3) && (x[1] == 'Good')"
    },
    test0002: {
        type: "integration",
        description: "test pushing data read to vf-OS pubsub",
        method: "get",
        class: "publish",
        url: `/api/sensors/devices/${test_data.sensorConfiguration._did}/sensors/${test_data.sensorConfiguration._sid}/Data`,
        result_condition: 200
    },
    test0003: {
        type: "model",
        description: "test reading list of sensors",
        method: "get",
        url: `/api/devices/devices/${test_data.deviceConfiguration._did}/sensors`,
        result_condition: 204
    },
    test0005: {
        type: "model",
        description: "test list of devices",
        method: "get",
        url: `/api/devices/devices`,
        result_condition: 200
    },
    test0006: {
        type: "model",
        description: "test register device",
        method: "post",
        url: `/api/devices/devices`,
        data: test_data.deviceConfiguration,
        result_condition: 204
    },
    test0007: {
        type: "model",
        description: "test register device",
        method: "post",
        url: `/api/sensors/devices/${test_data.sensorConfiguration._did}/sensors`,
        data: test_data.sensorConfiguration,
        result_condition: 204
    },
    test0008: {
        type: "model",
        description: "test register device",
        method: "post",
        url: `/api/sensors/devices/${test_data.sensorConfiguration._did}/sensors/${test_data.sensorConfiguration._sid}`,
        data: test_data.sensorConfiguration,
        result_condition: 200
    },
    test0012: {
        type: "model",
        description: "test get manifest",
        method: "get",
        url: `/api/drivers/drivers/manifest`,
        result_condition: 200
    }
}