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
    "rev": "f28a461656415d2ca7769477dd00da59", "5": function ($i, $c) {
        ({
            "$c": $c, "$n": function ($i) {
                $$fnd($i[0]) && $$nd["4"]($$cpy($i[0]), this.$c);
                $$fnd($i[0]) && this.$c["1"]($$cpy($i[0]));
            }, "$e": function ($i) {
                this.$n([(function (msg) {
                    msg.test += "+test";
                    return msg;
                })($i)]);
            }
        }).$e($i);
    }, "1": function ($i, $c) {
        ({
            "$c": $c, "$nc": {
                "0": function ($i) {
                    $$nd["6"]($$cpy($i), this.$c);
                }, "1": function ($i) {
                    $$nd["7"]($$cpy($i), this.$c);
                }
            }, "$n": function ($i) {
                $$nd["5"]($$cpy($i), this.$nc);
                $$nd["8"]($$cpy($i), this.$nc);
            }, "$e": function ($i) {
                this.$n($i);
            }
        }).$e($i);
    }, "7": function ($i, $c) {
        ({
            "$c": $c, "$n": $$nop, "$e": function ($i) {
                print($i);
            }
        }).$e($i);
    }, "8": function ($i, $c) {
        ({
            "$c": $c, "$n": function ($i) {
                $$fnd($i[1]) && this.$c["1"]($$cpy($i[1]));
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
    }, "4": function ($i, $c) {
        ({
            "$c": $c, "$n": function ($i) {
                $$fnd($i[0]) && $$nd["9"]($$cpy($i[0]), this.$c);
            }, "$e": function ($i) {
                this.$n([(function (msg) {
                    msg.test += "+test2";
                    return msg;
                })($i)]);
            }
        }).$e($i);
    }, "6": function ($i, $c) {
        ({
            "$c": $c, "$n": $$nop, "$e": function ($i) {
                print($i);
            }
        }).$e($i);
    }, "2": function ($i, $c) {
        ({
            "$c": $c, "$n": $$nop, "$e": function ($i) {
                print($i);
            }
        }).$e($i);
    }, "3": function ($i, $c) {
        ({
            "$c": $c, "$nc": {
                "0": function ($i) {
                    $$nd["10"]($$cpy($i), this.$c);
                }, "1": function ($i) {
                    $$nd["11"]($$cpy($i), this.$c);
                }
            }, "$n": function ($i) {
                $$nd["5"]($$cpy($i), this.$nc);
                $$nd["8"]($$cpy($i), this.$nc);
            }, "$e": function ($i) {
                this.$n($i);
            }
        }).$e($i);
    }, "10": function ($i, $c) {
        ({
            "$c": $c, "$n": $$nop, "$e": function ($i) {
                print($i.test);
            }
        }).$e($i);
    }, "11": function ($i, $c) {
        ({
            "$c": $c, "$n": $$nop, "$e": function ($i) {
                print($i.topic);
            }
        }).$e($i);
    }, "13": function ($i, $c) {
        ({
            "$c": $c, "$n": function ($i) {
                $$fnd($i[0]) && $$nd["12"]($$cpy($i[0]), this.$c);
            }, "$e": function ($i) {
                this.$n([(function (msg) {
                    msg.topic = "blabla";
                    return msg;
                })($i)]);
            }
        }).$e($i);
    }, "9": function ($i, $c) {
        ({
            "$c": $c, "$nc": {"0": $c["0"]}, "$n": function ($i) {
                $$nd["13"]($$cpy($i), this.$nc);
            }, "$e": function ($i) {
                this.$n($i);
            }
        }).$e($i);
    }, "14": function ($i, $c) {
        ({
            "$c": $c, "$n": function ($i) {
                $$fnd($i[0]) && this.$c["0"]($$cpy($i[0]));
            }, "$e": function ($i) {
                this.$n([(function (msg) {
                    msg.topic = msg.topic + "!!!!"
                    return msg;
                })($i)]);
            }
        }).$e($i);
    }, "12": function ($i, $c) {
        ({
            "$c": $c, "$nc": {"0": $c["0"]}, "$n": function ($i) {
                $$nd["14"]($$cpy($i), this.$nc);
                $$nd["15"]($$cpy($i), this.$nc);
            }, "$e": function ($i) {
                this.$n($i);
            }
        }).$e($i);
    }, "16": function ($i, $c) {
        ({
            "$c": $c, "$n": $$nop, "$e": function ($i) {
                print($i);
            }
        }).$e($i);
    }, "15": function ($i, $c) {
        ({
            "$c": $c, "$n": function ($i) {
                $$fnd($i[0]) && $$nd["16"]($$cpy($i[0]), this.$c);
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
            $$fnd($i[0]) && $$nd["1"]($$cpy($i[0]), this.$c);
            $$fnd($i[0]) && $$nd["2"]($$cpy($i[0]), this.$c);
            $$fnd($i[0]) && $$nd["3"]($$cpy($i[0]), this.$c);
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