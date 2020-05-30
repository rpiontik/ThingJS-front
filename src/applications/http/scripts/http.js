function doRequest(url) {
    print('URL:', url);
    $res.http.request(url,
        function (response) {
            if (response.data) {
                this.length = this.length ? (this.length + response.data.length) : response.data.length;
                $bus.emit('http-req-proc', JSON.stringify({
                    code: response.code, length: this.length
                }));
            } else {
                print('status:', response.code);
                print('length: [', this.length, ']');
                $bus.emit('http-req-end', JSON.stringify({
                    code: response.code, error: 'No any error'
                }));
            }
        },
        function (error) {
            print('Error code: [', error.code, '] message: [', error.message, ']');
            $bus.emit('http-req-end', JSON.stringify({
                error: error.code
            }));
        }
    );
}

// Event listener
// $bus - system bus interface
$bus.on(function (event, url) {
    if (event === 'do-http-req') {
        doRequest(url);
    }
}, null);
