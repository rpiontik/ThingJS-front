let $$r = {
    'timer': $res.timers
};

let String = $res.string;
function doit() {
    print("!");
    for (let i = 0; i < 100; i++) {
        print(String.template('_test:{{i * 100}}:pest_'));
    }
}

$bus.on(function() {
    doit();
    gc(true);
});
/*
for(let i=0; i < items.length; i++) {
    print("Item[",i,"]=",items[i],";");
}
*/
