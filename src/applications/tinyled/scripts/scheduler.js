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
let ledcFrequency = $res.prefs.get(
    PREF_FIELD_FREQUENCY,
    LEDC_DEFAULT_FREQUENCY
); // PWM frequency

// Max level
let MAX_LEVEL = 32767;
let RESOLUTION = 15;
let DIVIDER = 10000;
let DAY_WIDTH = 86400;

// Global channels array
let channels = [];

// The scheduler's timer
let timer = null;

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
            if (t < 125 && t > -40) {
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
        resolution: RESOLUTION,
        frequency: ledcFrequency
    });
    for (let f = 0; f < $res.ledc1.channels.length; f++) {
        let channel = $res.ledc1.channels[f];
        if (channel) {
            // Init the channel
            channel.reconfig({
                duty: 0,
                inverse: !!isInverse
            });
            // Channel level by percent
            channel.level = 0;
            channels[f] = channel;
        }
    }
}

// Return current (actual) interval between two points
function getCurrentInterval () {
    let time = $res.clock.getTime() % DAY_WIDTH;
    let prevDot = null;
    let nextDot = null;

    // print('Current time is ', time);

    // eslint-disable-next-line no-undef
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

    return !prevDot
        ? null
        : {
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
        leftShoulder =
          border > dot1.time ? border - dot1.time : DAY_WIDTH - dot1.time + border;
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
        let transition = calcTransition(
            interval.time,
            interval.start,
            interval.stop
        );

        let exposition;
        if (interval.stop.time < interval.time) {
            exposition = DAY_WIDTH - interval.time + interval.stop.time;
        } else {
            exposition = interval.stop.time - interval.time;
        }

        exposition *= 1000; // To ms
        exposition += 10; // For exposition will be > 0

        let newFadeValReset = [];
        let newFadeValInterval = [];
        for (let i = 0; i < channels.length; i++) {
            if (reset) {
                newFadeValReset[i] = MAX_LEVEL * (transition[i] / DIVIDER);
            }
            if (interval.start !== interval.stop) {
                newFadeValInterval[i] =
                  MAX_LEVEL * (interval.stop.spectrum[i] / DIVIDER);
            }
        }

        for (let i = 0; i < channels.length; i++) {
            if (reset) {
                channels[i].fade(newFadeValReset[i], 0);
            }
        }
        for (let i = 0; i < channels.length; i++) {
            if (interval.start !== interval.stop) {
                channels[i].fade(newFadeValInterval[i], exposition);
            }
        }

        timer = $res.timers.setTimeout(execute, exposition);
    } else {
        for (let channel in channels) {
            channels[channel].reconfig({
                duty: 0
            });
        }
        print('No interval');
    }
    // eslint-disable-next-line no-undef
    gc(true);
};

// Force restart execution
function restartExecution () {
    execute(1);
}

// Cloud synchronization
function doCloudSync () {
    if (cloudUUID && cloudUUID.length > 0) {
        $res.http.request(
            {
                url: CLOUD_URL,
                params: {
                    fid: $res.sys_info.chip_id,
                    deviceid: cloudUUID,
                    version: $res.prefs.get('version', 0)
                }
            },
            function (response) {
                if (
                    response.data &&
          typeof response.data === 'object' &&
          response.data.s &&
          response.data.s.length
                ) {
                    // eslint-disable-next-line no-undef
                    let dots = $storage.open('dots');
                    let dotIndex = 0;
                    for (
                        let found = dots.first();
                        found || dotIndex < response.data.s.length;
                        found = dots.next()
                    ) {
                        let dot = response.data.s[dotIndex];
                        let point = null;
                        if (dot) {
                            point = {
                                time: dot.o,
                                spectrum: {
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
// Do sync every 6 sec
$res.timers.setInterval(doCloudSync, 6000);

let sendFenistState = function () {
    $bus.emit(
        'fenist-state-config',
        JSON.stringify({
            inverse: isInverse,
            resolution: RESOLUTION,
            frequency: ledcFrequency
        })
    );
};

// Event listener
$bus.on(function (event, content, data) {
    if (event === '$-current-time') {
        $res.rtc.set();
        restartExecution();
    } else if (event === 'lucerna-set-config') {
        let config = JSON.parse(content);
        $res.prefs.put(PREF_FIELD_UUID, config.uuid);
        cloudUUID = $res.prefs.get(PREF_FIELD_UUID, '');

        $bus.emit(
            'lucerna-state-config',
            JSON.stringify({
                uuid: cloudUUID
            })
        );
        hwInit();
        restartExecution();
    } else if (event === 'fenist-set-hw-config') {
        let config = JSON.parse(content);
        $res.prefs.put(PREF_FIELD_INVERSE, !!config.inverse);
        $res.prefs.put(PREF_FIELD_FREQUENCY, config.frequency);
        isInverse = $res.prefs.get(PREF_FIELD_INVERSE, false);
        ledcFrequency = $res.prefs.get(
            PREF_FIELD_FREQUENCY,
            LEDC_DEFAULT_FREQUENCY
        );
        sendFenistState();
        hwInit();
        restartExecution();
    } else if (event === 'lucerna-get-config') {
        $bus.emit(
            'lucerna-state-config',
            JSON.stringify({
                uuid: cloudUUID
            })
        );
    } else if (event === 'fenist-get-config') {
        sendFenistState();
    }
}, null);

// Initialization
print('MJS', ' HW init');
hwInit();

print('MJS', ' Restart execution');
restartExecution();
