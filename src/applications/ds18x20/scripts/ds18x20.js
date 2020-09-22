print('DS18X20 example started');
$bus.emit('ds18x20-temp', JSON.stringify('Pending...'));

let address = null;

$res.ds18x20.search(function (addr) {
    if (address === null) {
        address = addr;
    }
});

let refresh = function () {
    if (address !== null) {
        $res.ds18x20.convert_all();
        $bus.emit('ds18x20-temp', JSON.stringify($res.ds18x20.get_temp_c(address)));
    } else {
        $bus.emit('ds18x20-temp', JSON.stringify('Sensor not detected'));
    }
};

if (address !== null) {
    refresh();
    $res.timers.setInterval(refresh, 1000);
} else {
    print('DS18X20 sensor not detected');
}

// Event listener
// $bus - system bus interface
$bus.on(function (event, url) {
    if (event === 'do-refresh-temp') {
        refresh();
    }
}, null);
