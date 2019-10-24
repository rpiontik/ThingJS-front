let active = true;
let state = true;

// Run background process
setInterval(function () {
  print('Current blink status ', state);
  if (active) {
    // $res - is container with required resources
    $res.blink.set(state);
    state = !state;
  }
}, 1000);

// Event listener
// $core - system core interface
$bus.on(function (event, content, data) {
  if (event === 'blink') {
    active = !!data;
  }
}, null);
