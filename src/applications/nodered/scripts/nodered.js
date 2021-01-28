let $r = {
    'timer': $res.timers,
    'str': $res.string
};

let $g = {}, $_mid = 0;

function $$nop() {
}

function $$fnd(v) {
    return typeof v !== "undefined"
}

function $$cpy(s) {
    return JSON.parse(JSON.stringify(s))
}

function $$mid() {
    return JSON.stringify(++$_mid)
}

let $$nd = {
    "rev": "42357a613c62ce0c7d52fd21c9a8e99e", "3": function ($i, $c) {
        ({
            "$c": $c, "$id": "3", "$n": $$nop, "$e": function ($i) {
                print(JSON.stringify($i));
            }
        }).$e($i);
    }, "2": function ($i, $c) {
        ({
            "$c": $c, "$id": "2", "$n": function ($i) {
                $$fnd($i[0]) && $$nd["3"]($$cpy($i[0]), this.$c);
                $$fnd($i[1]) && $$nd["4"]($$cpy($i[1]), this.$c);
            }, "$e": function ($i) {
                let res = [];
                let els = true;
                if ($i["topic"] === "topic1") {
                    res[0] = $i;
                    els = false;
                }
                if ($i["topic"] === "topic2") {
                    res[1] = $i;
                    els = false;
                }
                this.$n(res);
            }
        }).$e($i);
    }, "4": function ($i, $c) {
        ({
            "$c": $c, "$id": "4", "$n": function ($i) {
                $$fnd($i[0]) && $$nd["6"]($$cpy($i[0]), this.$c);
            }, "$e": function ($i) {
                this.$n([(function (msg) {
                    msg = {
                        "name": "Chris",
                        "value": 10000,
                        "taxed_value": 10000 - (10000 * 0.4),
                        "in_ca": true
                    };
                    return msg;
                })($i)]);
            }
        }).$e($i);
    }, "6": function ($i, $c) {
        ({
            "$c": $c, "$id": "6", "$n": function ($i) {
                $$fnd($i[0]) && $$nd["3"]($$cpy($i[0]), this.$c);
            }, "$e": function ($i) {
                $i["payload"] = $r.str.mustache("Hello {{name}}\nYou have just won {{value}} dollars!\n{{#in_ca}}\nWell, {{taxed_value}} dollars, after taxes.\n{{/in_ca}}", $i);
                this.$n([$i]);
            }
        }).$e($i);
    }
};
(function () {
    let $c = {};
    ({
        "$c": $c, "$id": "1", "$n": function ($i) {
            $$fnd($i[0]) && $$nd["2"]($$cpy($i[0]), this.$c);
        }, "$e": function ($i) {
            this.inject = function () {
                this.$n([{"payload": "test2", "topic": "topic1"}]);
            };
            let scope;
            $r.timer.setInterval(function (scope) {
                scope.inject();
            }, 1000, scope || this);
        }
    }).$e({})
})();
(function () {
    let $c = {};
    ({
        "$c": $c, "$id": "5", "$n": function ($i) {
            $$fnd($i[0]) && $$nd["2"]($$cpy($i[0]), this.$c);
        }, "$e": function ($i) {
            this.inject = function () {
                this.$n([{"payload": "pest", "topic": "topic2"}]);
            };
            let scope;
            $r.timer.setInterval(function (scope) {
                scope.inject();
            }, 1000, scope || this);
        }
    }).$e({})
})();