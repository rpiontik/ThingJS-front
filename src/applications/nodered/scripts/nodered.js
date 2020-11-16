let $$r = {
    'timer': $res.timers
};

function $$nop() {
}

function $$fnd(v) {
    return typeof v !== "undefined"
}

function $$cpy(s) {
    return JSON.parse(JSON.stringify(s))
}

let $$nd = {
    "rev": "04aa6037550706309f6c918c1086f780", "895ad3d4.0f524": function ($i, $c) {
        ({
            "$c": $c, "$n": function ($i) {
                if ($$fnd($i[0])) {
                    $$nd["aa379f1e.a1de2"]($$cpy($i[0]), this.$c);
                }
                if ($$fnd($i[0])) {
                    $c["1"]($$cpy($i[0]));
                }
            }, "$e": function ($i) {
                this.$n([(function (msg) {
                    msg.test += "+test";
                    return msg;
                })($i)]);
            }
        }).$e($i);
    }, "ba2c39b9.208528": function ($i, $c) {
        ({
            "$c": $c, "$nc": {
                "0": function ($i) {
                    $$nd["416fd74e.970088"]($$cpy($i), this.$c);
                }, "1": function ($i) {
                    $$nd["f28b7782.599258"]($$cpy($i), this.$c);
                }
            }, "$n": function ($i) {
                $$nd["895ad3d4.0f524"]($$cpy($i), this.$nc);
                $$nd["3195b8ed.442c18"]($$cpy($i), this.$nc);
            }, "$e": function ($i) {
                this.$n($i);
            }
        }).$e($i);
    }, "f28b7782.599258": function ($i, $c) {
        ({
            "$c": $c, "$n": $$nop, "$e": function ($i) {
                print($i);
            }
        }).$e($i);
    }, "3195b8ed.442c18": function ($i, $c) {
        ({
            "$c": $c, "$n": function ($i) {
                if ($$fnd($i[1])) {
                    $c["1"]($$cpy($i[1]));
                }
            }, "$e": function ($i) {
                let res = [];
                let els = true;
                if ($i["topic"] === "321") {
                    res[0] = $i;
                    els = false;
                }
                if ($i["topic"] === "123") {
                    res[1] = $i;
                    els = false;
                }
                this.$n(res);
            }
        }).$e($i);
    }, "aa379f1e.a1de2": function ($i, $c) {
        ({
            "$c": $c, "$n": function ($i) {
                if ($$fnd($i[0])) {
                    $$nd["baa57f31.63c22"]($$cpy($i[0]), this.$c);
                }
            }, "$e": function ($i) {
                this.$n([(function (msg) {
                    msg.test += "+test2";
                    return msg;
                })($i)]);
            }
        }).$e($i);
    }, "416fd74e.970088": function ($i, $c) {
        ({
            "$c": $c, "$n": $$nop, "$e": function ($i) {
                print($i);
            }
        }).$e($i);
    }, "c03b1e94.e6b68": function ($i, $c) {
        ({
            "$c": $c, "$n": $$nop, "$e": function ($i) {
                print($i);
            }
        }).$e($i);
    }, "4ee9b5f5.166bfc": function ($i, $c) {
        ({
            "$c": $c, "$nc": {
                "0": function ($i) {
                    $$nd["5d3e1700.0077b8"]($$cpy($i), this.$c);
                }, "1": function ($i) {
                    $$nd["e96ea5f5.88af58"]($$cpy($i), this.$c);
                }
            }, "$n": function ($i) {
                $$nd["895ad3d4.0f524"]($$cpy($i), this.$nc);
                $$nd["3195b8ed.442c18"]($$cpy($i), this.$nc);
            }, "$e": function ($i) {
                this.$n($i);
            }
        }).$e($i);
    }, "5d3e1700.0077b8": function ($i, $c) {
        ({
            "$c": $c, "$n": $$nop, "$e": function ($i) {
                print($i.test);
            }
        }).$e($i);
    }, "e96ea5f5.88af58": function ($i, $c) {
        ({
            "$c": $c, "$n": $$nop, "$e": function ($i) {
                print($i.topic);
            }
        }).$e($i);
    }, "ddf061fd.dfa0d": function ($i, $c) {
        ({
            "$c": $c, "$n": function ($i) {
                if ($$fnd($i[0])) {
                    $$nd["fe811bc2.706148"]($$cpy($i[0]), this.$c);
                }
            }, "$e": function ($i) {
                this.$n([(function (msg) {
                    msg.topic = "blabla";
                    return msg;
                })($i)]);
            }
        }).$e($i);
    }, "baa57f31.63c22": function ($i, $c) {
        ({
            "$c": $c, "$nc": {"0": $c["0"]}, "$n": function ($i) {
                $$nd["ddf061fd.dfa0d"]($$cpy($i), this.$nc);
            }, "$e": function ($i) {
                this.$n($i);
            }
        }).$e($i);
    }, "206e25f5.bbc75a": function ($i, $c) {
        ({
            "$c": $c, "$n": function ($i) {
                if ($$fnd($i[0])) {
                    $c["0"]($$cpy($i[0]));
                }
            }, "$e": function ($i) {
                this.$n([(function (msg) {
                    msg.topic = msg.topic + "!!!!"
                    return msg;
                })($i)]);
            }
        }).$e($i);
    }, "fe811bc2.706148": function ($i, $c) {
        ({
            "$c": $c, "$nc": {"0": $c["0"]}, "$n": function ($i) {
                $$nd["206e25f5.bbc75a"]($$cpy($i), this.$nc);
                $$nd["ab4d754b.466058"]($$cpy($i), this.$nc);
            }, "$e": function ($i) {
                this.$n($i);
            }
        }).$e($i);
    }, "fabd6659.d341d8": function ($i, $c) {
        ({
            "$c": $c, "$n": $$nop, "$e": function ($i) {
                print($i);
            }
        }).$e($i);
    }, "ab4d754b.466058": function ($i, $c) {
        ({
            "$c": $c, "$n": function ($i) {
                if ($$fnd($i[0])) {
                    $$nd["fabd6659.d341d8"]($$cpy($i[0]), this.$c);
                }
            }, "$e": function ($i) {
                this.$n([(function (msg) {
                    return {"text": "Hello!"};
                })($i)]);
            }
        }).$e($i);
    }
};
(function () {
    let $c = {};
    ({
        "$c": $c, "$n": function ($i) {
            if ($$fnd($i[0])) {
                $$nd["ba2c39b9.208528"]($$cpy($i[0]), this.$c);
            }
            if ($$fnd($i[0])) {
                $$nd["c03b1e94.e6b68"]($$cpy($i[0]), this.$c);
            }
            if ($$fnd($i[0])) {
                $$nd["4ee9b5f5.166bfc"]($$cpy($i[0]), this.$c);
            }
        }, "$e": function ($i) {
            this.inject = function () {
                this.$n([{"test": "pest2", "topic": "123"}]);
            };
            $$r.timer.setTimeout(function (scope) {
                scope.inject();
                $$r.timer.setInterval(function (scope) {
                    scope.inject();
                }, 5000, scope || this);
            }, 100, this);
        }
    }).$e({})
})();