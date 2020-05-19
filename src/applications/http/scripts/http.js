// http://ds1.tinyled.ru/api.php?action=getschedule&deviceid=C0RYHW9SQ2&version=1
$res.http.request({
    url: 'http://httpdump.io/dhaog',
    method: $res.http.M_POST,
    content_type: $res.http.CT_JSON,
    // transfer_encoding: $res.http.TE_CHUNKED,
    headers: {
        'Test-Header': 'test header'
    },
    params: {
        action: 'getschedule',
        deviceid: 'C0RYHW9SQ2',
        version: 1
    },
    timeout: 999,
    auth: {
        username: 'username',
        password: 'password'
    },
    index: 0,
    data: {
        variable1: 'test1',
        variable2: 'test2',
        variable3: 'test3'
    },
    data_: function () {
        this.index++;
        if (this.index < 3) {
            let result = '';
            for (let i = 1; i < 2; i++) {
                result += 'a=1&b=2';
            }
            return result;
        } else {
            return null;
        }
    }
}, function () {
    print('I AM!');
});
// Free memory
gc(true);

// Event listener
// $bus - system bus interface
$bus.on(function (event, content, data) {
}, null);
