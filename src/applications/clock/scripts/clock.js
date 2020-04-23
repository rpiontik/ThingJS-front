
// Run background process
$res.timers.setInterval(function () {
  $bus.emit('show-time', JSON.stringify($res.clock.getTime()));
}, 1000);

// Event listener
// $bus - system bus interface
$bus.on(function (event, content, data) {
  if (event === 'set-time') {
    $res.clock.setTime(JSON.parse(data));
  }
}, null);
