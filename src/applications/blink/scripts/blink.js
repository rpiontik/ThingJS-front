let active = true;
let state = true;

// Set port direction
// Available (ESP32):
// DIR_MODE_DISABLE - disable input and output
// DIR_MODE_INPUT - input only
// DIR_MODE_OUTPUT - output only mode
// DIR_MODE_OUTPUT_OD - output only with open-drain mode
// DIR_MODE_INPUT_OUTPUT_OD - output and input with open-drain mode
// DIR_MODE_INPUT_OUTPUT - output and input mode
$res.blink.direction($res.blink.DIR_MODE_OUTPUT);

// Run background process
$res.timers.setInterval(function () {
    if (active) {
        // $res - is container with required resources
        $res.blink.set(state);
        // Do invert
        state = !state;
    }
}, 500);

// Event listener
// $bus - system bus interface
$bus.on(function (event, content, data) {
    if (event === 'blink') {
        active = !!JSON.parse(content);
    }
}, null);
