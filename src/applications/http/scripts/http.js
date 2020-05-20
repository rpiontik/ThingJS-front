// http://ds1.tinyled.ru/api.php?action=getschedule&deviceid=C0RYHW9SQ2&version=1
$res.http.request({
    url: 'http://webhook.site/61b6d247-0c61-45d0-bf5e-5c47aa2f2847',
    method: $res.http.M_POST,
    content_type: $res.http.CT_MULTIPART_FORM_DATA,
    transfer_encoding: $res.http.TE_CHUNKED,
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
    data___: function () {
        return 'TEST';
    },
    data: {
        variable1: 'test1',
        variable2: 'test2',
        variable3: 'test3',
        variable4: 'test4'
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
