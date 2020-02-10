print('MJS', 'Starting Lucerna script...', 1);

// Global channels array
let channels = [];

// The scheduler's timer
let timer = null;

function hw_init () {
  // Make drivers array
  let ledcDrivers = [$res.ledc1];
  $res.ledc2 && ledcDrivers.push($res.ledc2);

  // Make channels array
  for (let i = 0; i < ledcDrivers.length; i++) {
    // Init the driver
    let driver = ledcDrivers[i];
    driver.reconfig();
    for (let f = 0; f < driver.channels.length; f++) {
      let channel = driver.channels[f];
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
}

let config = null;

// Configuration of application
function getConfig () {
  let config = $storage.open('config');
  let result = {
    'interval': {
      'width': 86400
    },
    'channelNumber': 0,
    'channels': {}
  };

  if ($storage.first(config)) {
    result = $storage.get(config);
  }
  $storage.close(config);

  print('Interval=', result.interval.width, ' channelNumber=', result.channelNumber);
  return result;
}

// Return current (actual) interval between two points
function getCurrentInterval () {
  let time = $res.clock.getTime() % config.interval.width;
  let prevDot = null;
  let nextDot = null;
  let recScanned = 0;

  print('Current time is ', time);

  let dots = $storage.open('dots');
  for (let found = $storage.first(dots); found; found = $storage.next(dots)) {
    let dot = $storage.get(dots);
    print('#', recScanned++, 'Dot time=', dot.time, 'brightness=', dot.brightness);
    if (dot.time < time) {
      prevDot = dot;
    } else {
      nextDot = dot;
      break;
    }
  }

  print('Records scanned ', recScanned);

  if (prevDot && !nextDot) {
    print('Next dot is first dot');
    $storage.first(dots);
    nextDot = $storage.get(dots);
  } else if (nextDot && !prevDot) {
    print('First dot is last dot');
    $storage.last(dots);
    prevDot = $storage.get(dots);
  }

  $storage.close(dots);

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
    leftShoulder = border > dot1.time ? border - dot1.time : config.interval.width - dot1.time + border;
    width = config.interval.width - dot1.time + dot2.time;
  }

  let koof = leftShoulder / width;

  let result = {
    brightness: abs(dot1.brightness - (dot1.brightness - dot2.brightness) * koof),
    spectrum: {}
  };

  print('Border=', border, ' dot1.brightness=', dot1.brightness, ' dot2.brightness=', dot2.brightness, ' avg=', result.brightness, ' k=', koof);
  for (let channel = 0; channel < channels.length; channel++) {
    result.spectrum[channel] = abs(
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
      exposition = config.interval.width - interval.time + interval.stop.time;
    } else {
      exposition = interval.stop.time - interval.time;
    }

    exposition *= 1000; // To ms
    exposition += 10; // For exposition will be > 0

    print('Interval is ', interval.start.time, '<>', interval.stop.time, ' exposition is ', exposition, 'ms');

    for (let i = 0; i < channels.length; i++) {
      let channel = channels[i];
      if (reset) {
        print('     Reset channel ', i);
        channel.reconfig({
          'duty': 0
        });
      }
      debugger;
      channel.fade(interval.stop.spectrum[i] / 10, exposition);
      print('     Executing channel ', i, ' from ', transition.spectrum[i], ' to ', interval.stop.spectrum[i]);
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
};


// Force restart execution
function restartExecution () {
  execute(1);
}

// Event listener
$bus.on(function (event, content, data) {
  print('>>> EVENT: ', event, ';', content, ';', data, '<<<');
  if (event === '$-storage-changed') {
    if (content === 'Lucerna/config') {
      config = getConfig();
      restartExecution();
    } else if (content === 'Lucerna/dots') {
      restartExecution();
    }
  } else if (event === '$-current-time') {
    restartExecution();
  }
}, null);

print('MJS', 'Init config');
config = getConfig();

// Initialization
print('MJS', 'HW init');
hw_init();

print('MJS', 'Restart execution');
restartExecution();
