<template>
    <div class="watch-editor" @mousedown.prevent.stop = "onMainMouseDown">
        <div
                :class="{group : true, expand: watchExpand}"
                @mousedown.prevent
                @click.prevent="watchExpand = !watchExpand"
        >
            <div class="watch-title">Watch</div>
            <div class="watch-actions" v-if="appname">
                <v-icon title="Add expression" @click.prevent.stop="addExpression">add</v-icon>
                <v-icon title="Refresh">refresh</v-icon>
            </div>
        </div>
        <div v-if="watchExpand">
            <template v-if="!appname">
                <div class="empty">Not attached to process</div>
            </template>
            <template v-else-if="watchList.length || expAddInput">
                <div class="item" v-for="(item, i) in watchList" @click.stop="editItemExpression(item.id)" :key="item.id">
                    <template v-if="expEditInput == item.id">
                        <input
                                type="text"
                                class="watch-input"
                                ref="edit_exp_input"
                                @mousedown.stop
                                @keydown.enter.stop="closeExpressionInput"
                                @blur="closeExpressionInput"
                                @keydown.esc.stop="escExpressionInput"
                                v-model="currExp.expression"
                        >
                    </template>
                    <template v-else>
                        {{item.expression}}: {{item.result ? item.result : '...'}}
                    </template>
                    <v-icon
                            class="remove-expression"
                            title="Remove"
                            @click.stop = "removeExpression(item.id)"
                    >clear</v-icon>
                </div>
                <div class="item" v-if="expAddInput">
                    <input
                            type="text"
                            class="watch-input"
                            ref="add_exp_input"
                            @mousedown.stop
                            @keydown.enter.stop="closeExpressionInput"
                            @keydown.esc.stop="escExpressionInput"
                            @blur="closeExpressionInput"
                            v-model="newExpression"
                    >
                </div>
            </template>
            <template v-else>
                <div class="empty" @click.prevent.stop="addExpression">Empty</div>
            </template>
        </div>
    </div>
</template>

<script>
    import consts from '../../consts';
    import utils from '../../utils'

    export default {
        name: 'WatchEditor',
        props : ["uri"],
        created(){
        },
        mounted() {
        },
        watch : {
        },
        methods : {
            removeExpression(id) {
                this.$store.commit('removeWatchExpression', id);
                this.expAddInput = false;
                this.expEditInput = null;
            },
            escExpressionInput(){
                if(this.currExp)
                    this.currExp.expression = this.$store.state.watch_list[this.currExp.id].expression;
                this.newExpression = '';
                this.expAddInput = false;
                this.expEditInput = null;
            },
            closeExpressionInput(){
                if(this.expAddInput && this.newExpression && this.newExpression.length) {
                    this.$store.commit('appendWatchExpression', {
                        expression : this.newExpression,
                        app : this.appname
                    });
                    this.newExpression = '';
                }
                if(this.expEditInput != null) {
                    if(!this.currExp.expression.length)
                        this.$store.commit('removeWatchExpression', this.currExp.id);
                    else
                        this.$store.commit('updateWatchExpression', {
                            expression : this.currExp.expression,
                            id : this.currExp.id
                        });
                }
                this.expAddInput = false;
                this.expEditInput = null;
            },
            addExpression(){
                this.expAddInput = true;
                this.watchExpand = true;
                this.$nextTick(() => this.$refs.add_exp_input.focus());
            },
            editItemExpression(index) {
                this.closeExpressionInput();
                this.expEditInput = index;
                this.$nextTick(() => this.$refs.edit_exp_input[0].focus());
            },
            onMainMouseDown() {
                this.closeExpressionInput();
            }
        },
        computed: {
            currExp(){
                for(let index in this.watchList) {
                    if(this.watchList[index].id == this.expEditInput)
                        return this.watchList[index];
                }
                return null;
            },
            appname(){
                return this.uri ? utils.parseURI(this.uri).app : null;
            },
            watchAvailable(){
                return false;
            },
            watchList(){
                let result = [];
                this.$store.state.watch_list.map((item, id) => {
                    if(item.app == this.appname)
                        result.push(Object.assign({id}, item));
                });
                return result;
            }
        },
        data () {
            return {
                expAddInput : false,
                expEditInput : null,
                newExpression : '',
                watchExpand : true
            }
        }
    }
</script>

<style scoped>
    .watch-editor {
        background: #fff;
    }

    .watch-editor .group:first-child,
    .watch-editor .item:first-child {
        border-top: 1px solid #eee;
    }

    .watch-editor .group,
    .watch-editor .item,
    .watch-editor .empty {
        display: flex;
        width: 100%;
        height: 24px;
        line-height: 18px;
        font-size: 12px;
        background: #fafafa;
        padding: 4px;
        border-bottom: 1px solid #eee;
        cursor: pointer;
        flex-wrap: nowrap;
    }

    .group:before {
        content: '►';
        margin-right: 6px;
        color: #777;
    }

    .group.expand:before {
        content: '▼';
        margin-right: 6px;
        color: #777;
    }

    .group .watch-title {
        flex-grow: 2;
    }
    .group .watch-actions {
        flex-shrink: 1;
        font-size: 24px;
        font-weight: bold;
    }

    .group .watch-actions .v-icon {
        font-size: 18px;
        margin-bottom: 6px;
        margin-right: 4px;
        margin-left: 4px;
        font-weight: bold;
    }

    .group .watch-actions .v-icon:hover {
        color: #000;
    }

    .watch-editor .empty {
        display: block;
        background: #fff;
        text-align: center;
        color: #999;
    }

    .watch-editor .item {
        text-align: left;
        background: #fff;
    }

    .watch-editor .watch-input {
        flex-grow: 1;
        border: 0;
        padding: 0px;
    }

    .watch-editor .watch-input:focus,
    .watch-editor .watch-input:active {
        outline: none;
    }

    .watch-editor .item .remove-expression {
        display: none;
    }

    .watch-editor .item:hover .remove-expression {
        display: block;
        position: absolute;
        right: 6px;
        line-height: 16px;
    }

</style>
