<template>
    <div class="ante-binder-board">
        <v-treeview v-if="requiredTree" class="ante-binder-tree" :items="requiredTree" :open-all="true">
            <template
                    slot="label"
                    slot-scope="{ item }"
            >
                <v-layout row style="margin-top: 18px;">
                    <v-flex xs1 v-if="!item.parent">
                        <v-checkbox
                                style="margin: 0; padding: 0;"
                                :disabled="item.required"
                                v-model="item.apply"
                                @change="onOnOffRequire(item)"
                        ></v-checkbox>
                    </v-flex>
                    <v-flex :xs11="!item.parent">
                        <v-select v-if="item.struct_type == 'pin'"
                                  class="item"
                                  :items="getSortPins(item.pin_available)"
                                  :item-text="fieldText"
                                  item-value="id"
                                  v-model="item.bind"
                                  :label="item.name"
                                  :style="{'margin' : 0, padding : 0, 'padding-left' : item.parent ? '16px' : '0'}"
                                  @input="onChangePin(item)"
                                  :required="item.apply"
                                  :disabled="item.parent ? !item.parent.apply : !item.apply"
                        >
                            <v-layout row slot="item" slot-scope="{ item }">
                                <v-flex xs4>{{item.name}}</v-flex>
                                <v-flex xs8>{{bindedMap[item.id] ? bindedMap[item.id].name : ''}}</v-flex>
                            </v-layout>
                        </v-select>
                        <div v-else-if = "item.struct_type == 'no-support'" class="item">
                            <v-icon color="red darken-2" title="Not supported">error</v-icon>{{item.name}}
                        </div>
                        <div v-else class="item">
                            {{item.name}}
                        </div>
                    </v-flex>
                </v-layout>
            </template>
        </v-treeview>
    </div>
</template>

<script>

    export default {
        name: 'Binder',
        props: ['manifest', 'value'],
        watch : {
            reqTree : {
                handler(req_tree) {
                    let result = req_tree ? [] : null;
                    for (let f = 0; result && (f < req_tree.length); f++) {
                        let node = req_tree[f];
                        if(!node.apply)
                            continue;
                        let pin = null;
                        switch(node.struct_type) {
                            case 'set': {
                                pin = [];
                                for (let i = 0; pin && (i < node.children.length); i++) {
                                    if(node.children[i].bind == null)
                                        pin = null;
                                    else
                                        pin.push(node.children[i].bind);
                                }
                                break;
                            }
                            case 'pin':{
                                pin = node.bind;
                                break;
                            }
                        }
                        if(pin)
                            result.push({
                                id : node.id,
                                type : node.type,
                                params : pin
                            });
                        else
                            result = null;
                    }
                    this.$emit('input', result);
                },
                deep: true,
                immediate: true
            },
            manifest(){
                this.resetData();
                if(!this.manifest)
                    return;
                this.binded = null;
                this.reqTree = null;
                this.requiredTree;
                this.rebind();
            }
        },
        computed: {
            //Map of pins where pin id is key
            mapPins(){
                let result = {};
                this.$store.state.hardware.profile.pins.map((item) => {
                    result[item.id] = item;
                });
                return result;
            },
            //Map of pins that binded
            bindedMap(){
                if(!this.binded) {
                    this.binded = {};
                    this.$store.state.hardware.profile.pins.map((item) => {
                        this.binded[item.id] = null;
                    });
                }
                return this.binded;
            },
            //Tree of application required
            requiredTree(){
                if(this.reqTree)
                    return this.reqTree;

                if(!this.manifest || !('requires' in this.manifest) || !('interfaces' in this.manifest.requires) )
                    return null;

                let available_interfaces = {};
                if(this.$store.state.hardware.profile)
                    this.$store.state.hardware.profile.interfaces.map((item) => {
                        available_interfaces[item.type]  = item;
                    });

                let result  = [];
                for(let i_name in this.manifest.requires.interfaces) {
                    let i_data = this.manifest.requires.interfaces[i_name];
                    let name = 'description' in i_data ? i_data.description[this.$store.state.display.lang] : i_name;
                    let node = {
                        id : i_name,                    //Interface id
                        type : i_data.type,             //Interface type
                        name : name ? name : i_name,    //Interface name
                        data : i_data,                  //Other interface data
                        struct_type : 'no-support',     //Type of structure 'no-support'/pin/set
                        cases : null,                   //Available pin's cases for interface
                        required : !!i_data.required,   //Is required interface
                        apply : true,                   //If false the interface will not use
                        parent : null,                  //Parent structure
                        bind : null,                    //Selected pin for "pin" struct,
                        index : 0,                       //Pin index in case,
                        default: i_data.default         //Default pin configuration
                    };

                    let max_pins = 0;
                    let pin_available_map = [];
                    if(i_data.type in available_interfaces) {
                        node.cases = available_interfaces[i_data.type].cases;

                        node.cases.map((item) => {
                            if(item.length > max_pins)
                                max_pins = item.length;
                            for(let i=0; i<item.length; i++) {
                                if(!pin_available_map[i])
                                    pin_available_map[i] = [];
                                (Array.isArray(item[i]) ? item[i] : [item[i]]).map((pin) => {
                                    if(this.mapPins[pin].available)
                                        pin_available_map[i].push({
                                            id : pin,
                                            name : this.mapPins[pin].name
                                        });
                                });
                            }
                        });

                        node.struct_type = max_pins > 1 ? 'set' : 'pin';
                    }

                    if(node.struct_type == 'set') {
                        node.children   = [];
                        for(let i=0; i<max_pins; i++)
                            node.children.push({
                                id : `${i_name}-${i}`,
                                name : `${i_name}-${i}`,
                                struct_type : 'pin',
                                pin_available : pin_available_map[i],
                                parent : node,
                                index : i,
                                bind : null
                            });
                    } else
                        node.pin_available = pin_available_map[0];

                    result.push(node);
                }

                return (this.reqTree = result);
            }
        },
        methods: {
            resetData(){
                this.binded = null;
                this.reqTree = null;
                this.fieldText = 'name';
            },
            getSortPins(items){
                return items.slice().sort((a, b) => {
                            if(!!this.bindedMap[a.id] === !!this.bindedMap[b.id]) {
                                if(a.id < b.id)
                                    return -1;
                                else if(a.id > b.id)
                                    return 1;
                                return 0;
                            } else  if(!this.bindedMap[a.id] && this.bindedMap[b.id])
                                return -1;
                            else if(this.bindedMap[a.id] && !this.bindedMap[b.id])
                                return 1;
                            return 0;
                        });
            },
            forceUpdate(){
                this.fieldText = null;
                this.fieldText = 'name';
            },
            searchCandidate(require){
                let cases = null;
                let children = null;
                let anchor = -1;
                if(require.parent) {
                    cases = require.parent.cases;
                    children = require.parent.children;
                    anchor = require.index;
                } else if(require.children) {
                    cases = require.cases;
                    children = require.children;
                } else {
                    return {
                        valid : require.cases,
                        best : null
                    }
                }

                let candidate = {
                    valid_cases: [],
                    overlap: 0,
                    case_: new Array(children.length)
                };

                for (let i = 0; i < cases.length; i++) {
                    if (
                            (anchor >= 0) && (
                                    (Array.isArray(cases[i][anchor]) && (cases[i][anchor].indexOf(require.bind) < 0))
                                || (!Array.isArray(cases[i][anchor]) && (cases[i][anchor] != require.bind))
                            )
                    )
                        continue;

                    let overlap = 0;
                    for(let index = 0; index < cases[i].length; index++) {
                        let enum_pins = Array.isArray(cases[i][index]) ? cases[i][index] : [cases[i][index]];
                        if (!children[index].bind)
                            overlap += 0.005;
                        else if (enum_pins.indexOf(children[index].bind) >= 0)
                            overlap += 1;
                    }
                    if (overlap > 0)
                        candidate.valid_cases.push(cases[i]);

                    if (overlap > candidate.overlap) {
                        candidate.case_ = cases[i];
                        candidate.overlap = overlap;
                    }
                }

                return {
                    valid : candidate.valid_cases,
                    best : candidate.case_
                };
            },
            onOnOffRequire(require) {
                if(require.apply) {
                    if(!this.bindedMap[require.old_bind]) {
                        require.bind = require.old_bind;
                        this.bindedMap[require.bind] = require;
                    }
                } else {
                    require.old_bind = require.bind;
                    this.bindedMap[require.bind] = null;
                    require.bind = null;
                }
                this.forceUpdate();
            },
            onChangePin(require) {
                if(require.bind == require.old_bind)
                    return;

                if(this.bindedMap[require.bind]) {
                    this.bindedMap[require.bind].bind = null;
                    this.bindedMap[require.bind].old_bind = null;
                }
                this.bindedMap[require.bind] = require;
                if(require.old_bind)
                    this.bindedMap[require.old_bind] = null;
                require.old_bind = require.bind;

                //Cases validations
                if(require.parent) {
                    let best_case = this.searchCandidate(require).best;
                    if(best_case)
                        this.searchCandidate(require).best.map((pin, index) => {
                            let enum_pins = Array.isArray(pin) ? pin : [pin];
                            if(
                                (index != require.index)
                                && require.parent.children[index].bind
                                && (enum_pins.indexOf(require.parent.children[index].bind) < 0)
                            ) {
                                this.bindedMap[require.parent.children[index].bind] = null;
                                require.parent.children[index].bind = null;
                                require.parent.children[index].old_bind = null;
                            }
                        });
                    else
                        require.parent.children[index].map((child, index) => {
                            if(index != require.index) {
                                child.bind = null;
                                child.old_bind = null;
                            }
                        });
                }
                this.forceUpdate();
            },
            //Automatic rebinding pins
            rebind(){
                let worked_out = [];
                [
                    { action : 'default', set : true,  pin : true},
                    { action : 'selection', set : true },
                    { action : 'selection', pin : true }
                ].map((mode) => {
                    this.reqTree.map((node, index) => {
                        if(
                            !mode[node.struct_type]
                            || ((mode.action == 'default') && !('default' in node))
                            || (worked_out.indexOf(index) >= 0)
                        )
                            return;

                        switch(node.struct_type) {
                            case 'set': if(mode.set) {
                                for(let f=0; f < node.cases.length; f++) {
                                    let case_ = node.cases[f];
                                    let choice = [];
                                    for(let i=0; i < case_.length; i++) {
                                        if(Array.isArray(case_[i])) {
                                            for(let c=0; c < case_[i].length; c++) {
                                                if((mode.action == 'default') && (case_[i][c] != node.default[i]))
                                                    continue;
                                                if(!this.bindedMap[case_[i][c]] && (choice.indexOf(case_[i][c]) < 0)) {
                                                    choice[i] = case_[i][c];
                                                    break;
                                                }
                                            }
                                        } else if(!this.bindedMap[case_[i]]) {
                                            if(mode.action == 'default') {
                                                if(case_[i] == node.default[i])
                                                    choice[i] = case_[i];
                                            } else
                                                choice[i] = case_[i];
                                        }
                                    }
                                    if(case_.length == choice.length) {
                                        for (let i = 0; i < node.children.length; i++) {
                                            node.children[i].bind = choice[i];
                                            node.children[i].old_bind = choice[i];
                                            this.bindedMap[choice[i]] = node.children[i];
                                        }
                                        worked_out.push(index);
                                        break;
                                    }
                                }
                            }
                            break;
                            case 'pin': if(mode.pin) {
                                for(let i=0; i < node.pin_available.length; i++) {
                                    let pin = node.pin_available[i];
                                    if((mode.action == 'default') && node.default != pin.id)
                                        continue;
                                    if(!this.bindedMap[pin.id]) {
                                        this.bindedMap[pin.id] = node;
                                        node.bind = pin.id;
                                        node.old_bind = pin.id;
                                        worked_out.push(index);
                                        break;
                                    }
                                }
                            }
                            break;
                        }
                    });

                });
            }
        },
        data () {
            return {
                binded : null,          //Binded pins
                reqTree : null,         //Required tree
                fieldText : 'name'      //For force refresh
            };
        }
    }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>

    .ante-binder-tree {
        width: 100%;
    }

    .ante-binder-tree .item {
        width: 100%;
        height: 28px;
    }

    .ante-binder-tree .v-treeview-node {
        margin-bottom: 8px;
    }

    .ante-binder-tree .v-treeview-node.v-treeview-node--leaf {
        margin-bottom: 24px;
    }

    .ante-binder-tree .v-treeview-node__children {
        margin-bottom: 34px;
    }

</style>
