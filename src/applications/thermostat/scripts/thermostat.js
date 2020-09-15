print('MQTT client is started');
let constMQTTServer = 'wss://mqtt.eclipse.org:443/mqtt';

// Consts of MQTT topics
let constTopicTemp = '/thingjs/123456/temp';
let constTopicTarget = '/thingjs/123456/target';
let constTopicMode = '/thingjs/123456/mode';
let constTopicState = '/thingjs/123456/state';

// Consts of device mode
let constModeLess = 0;
let constModeMore = 1;
let constModeOn = 2;
let constModeOff = 3;

// Operation registers
let isConnected = false;
let mode = constModeLess;
let target = 32;
let temp = null;
let state = 0;
let sensor = null;

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
        state: state
    }));

    if (isConnected) {
        $res.mqtt.publish(constTopicMode, JSON.stringify(mode));
        $res.mqtt.publish(constTopicTarget, JSON.stringify(target));
        $res.mqtt.publish(constTopicState, JSON.stringify(state));
        $res.mqtt.publish(constTopicTemp, JSON.stringify(temp));
    }
}

// MQTT connected event
$res.mqtt.onconnected = function () {
    print('MQTT client is connected');
    isConnected = true;
    $res.mqtt.subscribe(constTopicTarget);
    $res.mqtt.subscribe(constTopicMode);
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
    if (topic === constTopicTarget) {
        target = JSON.parse(data);
    } else if (topic === constTopicMode) {
        mode = JSON.parse(data);
    }
};

// Event listener
// $bus - system bus interface
$bus.on(function (event, url) {
    if (event === 'tmst-refresh-state') {
        publishState();
    }
}, null);

// Execution function
$res.timers.setInterval(function () {
    // Refresh sensor data
    if (sensor !== null) {
        $res.ds18x20.convert_all();
        temp = $res.ds18x20.get_temp_c(sensor);
        if (mode === constModeLess) {
            if (temp < target) {
                state = 1;
            } else {
                state = 0;
            }
        } else if (mode === constModeMore) {
            if (temp > target) {
                state = 1;
            } else {
                state = 0;
            }
        } else if (mode === constModeOn) {
            state = 1;
        } else if (mode === constModeOff) {
            state = 0;
        }
    }

    publishState();
}, 1000);

publishState();
$res.mqtt.connect(constMQTTServer);
