$bus.on(function (event, content, data) {
    if (event === '$-storage-changed') {
        if (content === 'Storage/data/example') {
            let example = $storage.open('example');
            for (let found = example.first(); found; found = example.next()) {
                print('#', JSON.stringify(example.get()));
            }
            example.close();
        }
    }
}, null);
