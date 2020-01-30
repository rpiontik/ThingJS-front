let active = true;
let state = true;

// Set port direction
// Available (ESP32):
//  DIR_MODE_DISABLE
//  DIR_MODE_DEF_INPUT
//  DIR_MODE_DEF_OUTPUT
//  DIR_MODE_INPUT_OUTPUT_OD
//  DIR_MODE_INPUT_OUTPUT
$res.blink.direction($res.blink.DIR_MODE_DEF_OUTPUT);

// Run background process
$res.timers.setInterval(function () {
  if (active) {
    // $res - is container with required resources
    $res.blink.set(state);
    // Do invert
    state = !state;
  }
}, 1000);

// Event listener
// $bus - system bus interface
$bus.on(function (event, content, data) {
  if (event === 'blink') {
    debugger;
    active = !!JSON.parse(content);
  }
}, null);
