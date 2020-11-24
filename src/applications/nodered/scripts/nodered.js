let $$r = {
    'timer': $res.timers
};

let String = $res.string;
function doit() {
    for (let i = 0; i < 10; i++) {
        print(String.template('_test:{{i * 100}}:pest_'));
    }
}

$bus.on(function() {
    doit();
    gc(true);
});
print(">>>>>>>>");
let test = {"a":1, "b":2};
for(let key in test) {
    print(test[key],":");
}
print("<<<<<<<<");
this.a = 10;
String.template('_----:{{a}}:----_');