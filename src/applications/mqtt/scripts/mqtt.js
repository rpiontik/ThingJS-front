print('MQTT client is started');
let isConnected = false;
let topic = '/thingjs/example/' + $res.sys_info.chip_id + '/times';
$bus.emit('mqtt-connected', JSON.stringify(false));

$res.mqtt.onconnected = function () {
    print('MQTT client is connected');
    isConnected = true;
    $bus.emit('mqtt-connected', JSON.stringify(true));
    $res.mqtt.subscribe(topic);
};

$res.mqtt.disconnected = function () {
    print('MQTT client is disconnected');
    isConnected = false;
    $bus.emit('mqtt-connected', JSON.stringify(false));
};

$res.mqtt.ondata = function (topic, data) {
    $bus.emit('mqtt-on-data', JSON.stringify(data));
    print('MQTT client received from topic [', topic, '] with data [', data, ']');
};

// Event listener
// $bus - system bus interface
$bus.on(function (event, url) {
    if (event === 'do-refresh-state') {
        $bus.emit('mqtt-connected', JSON.stringify(isConnected));
    }
}, null);

$res.timers.setInterval(function () {
    if (isConnected) {
        let data = JSON.stringify($res.clock.getTime());
        $res.mqtt.publish(topic, data);
        print('MQTT client published to topic [', topic, '] with data [', data, ']');
    }
}, 1000);

$res.mqtt.connect('wss://mqtt.eclipse.org:443/mqtt');

