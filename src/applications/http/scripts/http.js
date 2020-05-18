// http://ds1.tinyled.ru/api.php?action=getschedule&deviceid=C0RYHW9SQ2&version=1
print('Try to http request');

$res.http.request({
    url: 'http://ds1.tinyled.ru/api.php?test=123&pest=321#fragment',
    method: 'POST',
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
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
    data: function () {
        this.index++;
        if (this.index < 2) {
            let result = '';
            for (let i = 1; i < 2; i++) {
                result += 'test|1lksdjf l;ksdf;lkj s;djf ;lsdjf;lsjdf lskjdfl jds;l jf;sdl kjfsd;ljkslhdaslkjhdalsjkhdlaskjhdlakjshdkljash dlkas jkashdlkjah slkjdh laskjh dlk2345';
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
