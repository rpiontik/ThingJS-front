print('MJS', ' Starting Lucerna script... ');

// Preferences fields
let PREF_FIELD_UUID = 'uuid';
let PREF_FIELD_INVERSE = 'inverse';
let PREF_FIELD_FREQUENCY = 'frequency';

// Cloud URL
let CLOUD_URL = 'http://ds1.tinyled.ru/json.php?action=getschedule';

let LEDC_DEFAULT_FREQUENCY = 400;

let cloudUUID = $res.prefs.get(PREF_FIELD_UUID, null); // Tinyled cloud uuid
let isInverse = $res.prefs.get(PREF_FIELD_INVERSE, 0); // Tinyled cloud uuid
let ledcFrequency = $res.prefs.get(PREF_FIELD_FREQUENCY, LEDC_DEFAULT_FREQUENCY); // PWM frequency

// Max level
let MAX_LEVEL = 32767;
let RESOLUTION = 15;
let DIVIDER = 10000;
let DAY_WIDTH = 86400;

// Global channels array
let channels = [];

// The scheduler's timer
let timer = null;

// Relays states
let relay1state = 0;
let relay2state = 0;
let relay3state = 0;
let relay4state = 0;

let sensors = [];
// Looking for ds18b20 sensors
$res.DS18B20.search(function (addr) {
    sensors.push(addr);
});

let refresh = function () {
    if (sensors.length > 0) {
        let temperature = {
            Max: 0,
            Min: 200,
            Avg: 0,
            Count: 0
        };
        for (let i = 0; i < sensors.length; i++) {
            let t = $res.DS18B20.get_temp_c(sensors[i]);
            if ((t < 125) && (t > -40)) {
                if (t > temperature.Max) {
                    temperature.Max = t;
                }
                if (t < temperature.Min) {
                    temperature.Min = t;
                }
                temperature.Avg += t;
                temperature.Count++;
            }
        }
        temperature.Avg /= temperature.Count;
        $bus.emit('ds18x20-temp', JSON.stringify(temperature));
        $res.DS18B20.convert_all();
    } else {
        $bus.emit('ds18x20-temp', JSON.stringify('Sensor not detected'));
    }
};

if (sensors.length > 0) {
    refresh();
    $res.timers.setInterval(refresh, 2000);
} else {
    print('OW: DS18X20 sensor not detected');
}

function hwInit () {
    // Init the driver
    $res.ledc1.reconfig({
        'resolution': RESOLUTION,
        'frequency': ledcFrequency
    });
    for (let f = 0; f < $res.ledc1.channels.length; f++) {
        let channel = $res.ledc1.channels[f];
        if (channel) {
            // Init the channel
            channel.reconfig({
                'duty': 0,
                'inverse': !!isInverse
            });
            // Channel level by percent
            channel.level = 0;
            channels[f] = channel;
        }
    }
    $res.relay1.direction($res.relay1.DIR_MODE_OUTPUT);
    $res.relay1.set(relay1state);
    $res.relay2.direction($res.relay2.DIR_MODE_OUTPUT);
    $res.relay2.set(relay2state);
    $res.relay3.direction($res.relay3.DIR_MODE_OUTPUT);
    $res.relay3.set(relay3state);
    $res.relay4.direction($res.relay4.DIR_MODE_OUTPUT);
    $res.relay4.set(relay4state);
}

// Return current (actual) interval between two points
function getCurrentInterval () {
    let time = $res.clock.getTime() % DAY_WIDTH;
    let prevDot = null;
    let nextDot = null;

    // print('Current time is ', time);

    let dots = $storage.open('dots');
    for (let found = dots.first(); found; found = dots.next()) {
        let dot = dots.get();
        if (dot.time < time) {
            prevDot = dot;
        } else {
            nextDot = dot;
            break;
        }
    }

    if (prevDot && !nextDot) {
        // print('Next dot is first dot');
        dots.first();
        nextDot = dots.get();
    } else if (nextDot && !prevDot) {
        // print('First dot is last dot');
        dots.last();
        prevDot = dots.get();
    }

    dots.close();

    return !prevDot ? null : {
        time: time,
        start: prevDot,
        stop: nextDot
    };
}

function abs (r) {
    return r < 0 ? -r : r;
}

// Calculation transition levels
function calcTransition (border, dot1, dot2) {
    let leftShoulder;
    let width;

    if (dot1.time < dot2.time) {
        leftShoulder = border - dot1.time;
        width = dot2.time - dot1.time;
    } else {
        leftShoulder = border > dot1.time ? border - dot1.time : DAY_WIDTH - dot1.time + border;
        width = DAY_WIDTH - dot1.time + dot2.time;
    }

    let koof = leftShoulder / width;

    let result = {};

    for (let channel = 0; channel < channels.length; channel++) {
        result[channel] = abs(
            dot1.spectrum[channel] -
            (dot1.spectrum[channel] - dot2.spectrum[channel]) * koof
        );
    }

    return result;
}

// Main function of execute
let execute = function (reset) {
    if (timer) {
        $res.timers.clearTimeout(timer);
        timer = null;
    }

    let interval = getCurrentInterval();

    if (interval) {
        let transition = calcTransition(interval.time, interval.start, interval.stop);

        let exposition;
        if (interval.stop.time < interval.time) {
            exposition = DAY_WIDTH - interval.time + interval.stop.time;
        } else {
            exposition = interval.stop.time - interval.time;
        }

        exposition *= 1000; // To ms
        exposition += 10; // For exposition will be > 0

        for (let i = 0; i < channels.length; i++) {
            let channel = channels[i];
            if (reset) {
                channel.fade(MAX_LEVEL * (transition[i] / DIVIDER), 0);
            }
            if (interval.start !== interval.stop) {
                channel.fade(MAX_LEVEL * (interval.stop.spectrum[i] / DIVIDER), exposition);
            }
        }

        timer = $res.timers.setTimeout(execute, exposition);
    } else {
        for (let channel in channels) {
            channels[channel].reconfig({
                'duty': 0
            });
        }
        print('No interval');
    }
    gc(true);
};

// Force restart execution
function restartExecution () {
    execute(1);
}

// Cloud synchronization
function doCloudSync () {
    if (cloudUUID && cloudUUID.length > 0) {
        $res.http.request({
            'url': CLOUD_URL,
            'params': {
                'fid': $res.sys_info.chip_id,
                'deviceid': cloudUUID,
                'version': $res.prefs.get('version', 0)
            }
        },
        function (response) {
            if (response.data && (typeof response.data === 'object') && response.data.s && response.data.s.length) {
                let dots = $storage.open('dots');
                let dotIndex = 0;
                for (
                    let found = dots.first();
                    found || (dotIndex < response.data.s.length);
                    found = dots.next()
                ) {
                    let dot = response.data.s[dotIndex];
                    let point = null;
                    if (dot) {
                        point = {
                            'time': dot.o,
                            'spectrum': {
                                '0': dot.p[0],
                                '1': dot.p[1],
                                '2': dot.p[2],
                                '3': dot.p[3],
                                '4': dot.p[4],
                                '5': dot.p[5],
                                '6': dot.p[6],
                                '7': dot.p[7]
                            }
                        };
                    }

                    if (found && dot) {
                        dots.post(point);
                    } else if (found) {
                        dots.remove();
                    } else {
                        dots.append(point);
                    }
                    ++dotIndex;
                }
                dots.close();
                $res.prefs.put('version', response.data.v);
                restartExecution();
            }
        }
        );
    }
}
// Do sync every 10sec
$res.timers.setInterval(doCloudSync, 6000);

let sendFenistState = function () {
    $bus.emit('fenist-state-config', JSON.stringify({
        'inverse': isInverse,
        'resolution': RESOLUTION,
        'frequency': ledcFrequency,
        'relay1': relay1state,
        'relay2': relay2state,
        'relay3': relay3state,
        'relay4': relay4state
    }));
};

// Event listener
$bus.on(function (event, content, data) {
    if (event === '$-current-time') {
        restartExecution();
    } else if (event === 'relay-on') {
        let rel = JSON.parse(content);
        if (rel.num === 1) { $res.relay1.set(1); relay1state = 1; }
        if (rel.num === 2) { $res.relay2.set(1); relay2state = 1; }
        if (rel.num === 3) { $res.relay3.set(1); relay3state = 1; }
        if (rel.num === 4) { $res.relay4.set(1); relay4state = 1; }
        sendFenistState();
    } else if (event === 'relay-off') {
        let rel = JSON.parse(content);
        if (rel.num === 1) { $res.relay1.set(0); relay1state = 0; }
        if (rel.num === 2) { $res.relay2.set(0); relay2state = 0; }
        if (rel.num === 3) { $res.relay3.set(0); relay3state = 0; }
        if (rel.num === 4) { $res.relay4.set(0); relay4state = 0; }
        sendFenistState();
    } else if (event === 'lucerna-set-config') {
        let config = JSON.parse(content);
        $res.prefs.put(PREF_FIELD_UUID, config.uuid);
        cloudUUID = $res.prefs.get(PREF_FIELD_UUID, '');

        $bus.emit('lucerna-state-config', JSON.stringify({
            'uuid': cloudUUID
        }));
        hwInit();
        restartExecution();
    } else if (event === 'fenist-set-hw-config') {
        let config = JSON.parse(content);
        $res.prefs.put(PREF_FIELD_INVERSE, !!config.inverse);
        $res.prefs.put(PREF_FIELD_FREQUENCY, config.frequency);
        isInverse = $res.prefs.get(PREF_FIELD_INVERSE, false);
        ledcFrequency = $res.prefs.get(PREF_FIELD_FREQUENCY, LEDC_DEFAULT_FREQUENCY);
        sendFenistState();
        hwInit();
        restartExecution();
    } else if (event === 'lucerna-get-config') {
        $bus.emit('lucerna-state-config', JSON.stringify({
            'uuid': cloudUUID
        }));
    } else if (event === 'fenist-get-config') {
        sendFenistState();
    }
}, null);

// Initialization
print('MJS', ' HW init');
hwInit();

print('MJS', ' Restart execution');
restartExecution();
