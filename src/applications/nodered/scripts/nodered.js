let $r = {
    'timer': $res.timers,
    'str': $res.string
};
let $g = {}, $_mid = 0;

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

let test = function() {
    this.a = 10;
    return this.a;
};

print("in function=", test(), "direct ", test.a);

let $$nd = {
    "rev": "0d2abdbe8261ad4b1aaa28d70cd5b307", "2": function ($i, $c) {
        ({
            "$c": $c, "$n": $$nop, "$e": function ($i) {
                print(JSON.stringify($i));
            }
        }).$e($i);
    }, "1": function ($i, $c) {
        ({
            "$c": $c, "$n": function ($i) {
                $$fnd($i[0]) && $$nd["3"]($$cpy($i[0]), this.$c);
            }, "$e": function ($i) {
                $i["payload"] = ["test1", "test2", "test3", "test4", "test4"];
                this.$n([$i]);
            }
        }).$e($i);
    }, "3": function ($i, $c) {
        ({
            "$c": $c, "$n": function ($i) {
                $$fnd($i[0]) && $$nd["2"]($$cpy($i[0]), this.$c);
            }, "$e": function ($i) {
                this.mki = function ($i, pl, t, k, i, c) {
                    $i.payload = pl;
                    $i.parts = {"id": this.mid, "type": t};
                    if (t === "string") {
                        $i.parts.index = $g["_spt_4c424b17.dc4d04"]++
                    } else {
                        $i.parts.index = i;
                        $i.parts.key = k;
                        $i.parts.count = c
                    }
                    return $i
                };
                let tp = typeof $i.payload;
                this.mid = $$mid();
                if (tp === "string") {
                    let ch = "|", ims = $r.str.split($i.payload, ch), ln = ims.length;
                    for (let f = 0; f < ln; f++) {
                        $i = this.mki($i, ims[f], "string", f, f, ln);
                        $i.parts.ch = ch;
                        this.$n([$i])
                    }
                } else if ((tp === "array") || ($i.payload["length"])) {
                    tp = "array";
                    let pl = $$cpy($i.payload), seg = [], ind = 0,
                        cnt = JSON.parse($r.str.split(pl.length / 2 + 0.5, ".")[0]);
                    for (let k in pl) {
                        seg.push(pl[k]);
                        if (seg.length >= 2) {
                            $i = this.mki($i, seg, tp, undefined, ind++, cnt);
                            $i.parts.len = 2;
                            this.$n([$i]);
                            seg = [];
                        }
                    }
                    if (seg.length > 0) {
                        $i = this.mki($i, seg, tp, undefined, ind, cnt);
                        $i.parts.len = 2;
                        this.$n([$i]);
                    }
                } else if (tp === "object") {
                    let ln = 0, i = 0, pl = $$cpy($i.payload);
                    for (let k in pl) ln++;
                    for (let k in pl) {
                        $i = this.mki($i, pl[k], tp, k, i++, ln);
                        $i["key"] = k;
                        this.$n([$i])
                    }
                }
            }
        }).$e($i);
    }
};
(function () {
    let $c = {};
    ({
        "$c": $c, "$n": function ($i) {
            $$fnd($i[0]) && $$nd["1"]($$cpy($i[0]), this.$c);
        }, "$e": function ($i) {
            this.inject = function () {
                this.$n([{"test": "pest2", "topic": "123"}]);
            };
            $r.timer.setTimeout(function (scope) {
                scope.inject();
            }, 100, this);
        }
    }).$e({})
})();
$g["_spt_4c424b17.dc4d04"] = 0;