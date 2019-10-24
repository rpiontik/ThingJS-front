let active = true;
let state = true;

debugger;

// Run background process
setTimeout(function () {
  if (active) {
    // $res - is container with required resources
    $res.blink.set(state);
    state = !state;
  }
}, 5000);

// Event listener
// $core - system core interface
$bus.on(function (event, content, data) {
  if (event === 'blink') {
    active = !!data;
  }
}, null);
