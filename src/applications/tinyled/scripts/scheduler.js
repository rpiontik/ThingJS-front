print('MJS', 'Starting Lucerna script...', 1);

// Preferences fields
let PREF_FIELD_UUID = 'uuid';

// Cloud URL
let CLOUD_URL = 'http://ds1.tinyled.ru/json.php?action=getschedule&fid=' + $res.sys_info.chip_id;
// http://ds1.tinyled.ru/json.php?action=getschedule&version=1&fid=C8P27NUQM9&deviceid=C8P27NUQM9

let cloudUUID = $res.prefs.get(PREF_FIELD_UUID, null); // Tinyled cloud uuid

// Max level
let MAX_LEVEL = 32767;
let RESOLUTION = 15;
let DIVIDER = 10000;
let DAY_WIDTH = 86400;

// Global channels array
let channels = [];

// The scheduler's timer
let timer = null;

function hwInit () {
    // Init the driver
    $res.ledc1.reconfig({
        'resolution': RESOLUTION
    });
    for (let f = 0; f < $res.ledc1.channels.length; f++) {
        let channel = $res.ledc1.channels[f];
        if (channel) {
            // Init the channel
            channel.reconfig({
                'duty': 0
            });
            // Channel level by percent
            channel.level = 0;
            channels.push(channel);
        }
    }
}

let config = null;

// Cloud synchronization
function doCloudSync () {
    if (cloudUUID.length > 0) {
        $res.http.request(CLOUD_URL + '&deviceid=' + cloudUUID + '&version=0',
            function (response) {
                if (response.data) {
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
                }
            }
        );
    }
}
// Do sync every 10sec
$res.timers.setInterval(doCloudSync, 10000);

// Configuration of application
function getConfig () {
    let config = $storage.open('config');
    let result = {
        'version': 0,
        'channelNumber': 0
    };

    if (config.first()) {
        result = config.get();
    }
    config.close();

    return result;
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
    let leftShoulder = 0;
    let width = 0;

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
            (dot1.spectrum[channel] - dot2.spectrum[channel]) *
            koof
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

        let exposition = 0;
        if (interval.stop.time < interval.time) {
            exposition = DAY_WIDTH - interval.time + interval.stop.time;
        } else {
            exposition = interval.stop.time - interval.time;
        }

        exposition *= 1000; // To ms
        exposition += 10; // For exposition will be > 0

        // print('Interval is ', interval.start.time, '<>', interval.stop.time, ' exposition is ', exposition, 'ms');

        for (let i = 0; i < channels.length; i++) {
            let channel = channels[i];
            if (reset) {
                // print('     Reset channel ', i);
                channel.fade(MAX_LEVEL * (transition[i] / DIVIDER), 0);
            }
            if (interval.start !== interval.stop) {
                channel.fade(MAX_LEVEL * (interval.stop.spectrum[i] / DIVIDER), exposition);
            }
        }

        timer = $res.timers.setTimeout(execute, exposition);
    } else {
        for (let channel in channels) {
            channel.reconfig({
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

// Event listener
$bus.on(function (event, content, data) {
    if (event === '$-current-time') {
        restartExecution();
    } else if (event === 'lucerna-set-uuid') {
        $res.prefs.put(PREF_FIELD_UUID, content);
        cloudUUID = $res.prefs.get(PREF_FIELD_UUID);
        $bus.emit('lucerna-state-uuid', cloudUUID);
    } else if (event === 'lucerna-get-uuid') {
        $bus.emit('lucerna-state-uuid', cloudUUID);
    }
}, null);

print('MJS', 'Init config');
config = getConfig();

// Initialization
print('MJS', 'HW init');
hwInit();

print('MJS', 'Restart execution');
restartExecution();
