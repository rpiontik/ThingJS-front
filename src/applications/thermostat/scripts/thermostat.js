print('MQTT client is started');
let constMQTTServer = 'wss://mqtt.eclipse.org:443/mqtt';

// Consts of MQTT topics
let CHIP_ID = $res.sys_info.chip_id;
let TOPIC_TEMP = '/thingjs/' + CHIP_ID + '/temp';
let TOPIC_TARGET_OUT = '/thingjs/' + CHIP_ID + '/target/out';
let TOPIC_TARGET_IN = '/thingjs/' + CHIP_ID + '/target/in';
let TOPIC_MODE_OUT = '/thingjs/' + CHIP_ID + '/mode/out';
let TOPIC_MODE_IN = '/thingjs/' + CHIP_ID + '/mode/in';
let TOPIC_MODE_STATE = '/thingjs/' + CHIP_ID + '/state';

print('>>>>>>>>>>>>', $res.sys_info.chip_id, '<<<<<<<<<<<<<<');

// Consts of device mode
let MODE_LESS = 0;
let MODE_MORE = 1;
let MODE_ON = 2;
let MODE_OFF = 3;

// Operation registers
let isConnected = false;
let mode = MODE_LESS;
let target = 32;
let state = 0;
let sensor = null;
let temp = null;
let fakeVector = 0.5;

// Looking for ds18b20 sensors
$res.ds18x20.search(function (addr) {
    if (sensor === null) {
        sensor = addr;
    }
});

// Publish data to UBUS and MQTT server
function publishState () {
    $bus.emit('thermostat-state', JSON.stringify({
        connected: isConnected,
        mode: mode,
        target: target,
        temp: temp,
        state: state,
        chip_id: CHIP_ID
    }));

    if (isConnected) {
        $res.mqtt.publish(TOPIC_MODE_OUT, JSON.stringify(mode));
        $res.mqtt.publish(TOPIC_TARGET_OUT, JSON.stringify(target));
        $res.mqtt.publish(TOPIC_MODE_STATE, JSON.stringify(state));
        $res.mqtt.publish(TOPIC_TEMP, JSON.stringify(temp));
    }
}

// MQTT connected event
$res.mqtt.onconnected = function () {
    print('MQTT client is connected');
    isConnected = true;
    $res.mqtt.subscribe(TOPIC_TARGET_IN);
    $res.mqtt.subscribe(TOPIC_MODE_IN);
    publishState();
};

// MQTT disconnected event
$res.mqtt.disconnected = function () {
    print('MQTT client is disconnected');
    isConnected = false;
    publishState();
};

// MQTT receive data
$res.mqtt.ondata = function (topic, data) {
    print('MQTT client received from topic [', topic, '] with data [', data, ']');
    if (topic === TOPIC_TARGET_IN) {
        target = JSON.parse(data);
    } else if (topic === TOPIC_MODE_IN) {
        mode = JSON.parse(data);
    }
};

// Event listener
// $bus - system bus interface
$bus.on(function (event, data) {
    if (event === 'tmst-set-target') {
        target = JSON.parse(data);
    } else if (event === 'tmst-set-mode') {
        mode = JSON.parse(data);
    }
    publishState();
}, null);

// Execution function
$res.timers.setInterval(function () {
    if (sensor !== null) {
        $res.ds18x20.convert_all();
        temp = $res.ds18x20.get_temp_c(sensor);
    } else { // Fake temperature
        if (temp > 99) {
            fakeVector = -0.5;
        } else if (temp < 1) {
            fakeVector = 0.5;
        }

        temp += fakeVector;
    }
    // Refresh sensor data
    if (mode === MODE_ON) {
        state = 1;
    } else if (mode === MODE_OFF) {
        state = 0;
    } else if (mode === MODE_LESS) {
        if (temp < target) {
            state = 1;
        } else {
            state = 0;
        }
    } else if (mode === MODE_MORE) {
        if (temp > target) {
            state = 1;
        } else {
            state = 0;
        }
    }

    publishState();
    $res.relay.set(!state);
}, 1000);

temp = 34.5;
$res.relay.direction($res.relay.DIR_MODE_OUTPUT);
publishState();
$res.mqtt.connect(constMQTTServer);
