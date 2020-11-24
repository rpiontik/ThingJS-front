<template>
    <div>
        <v-toolbar dense flat>
            <v-btn icon :disabled="isDebugDisabled">
                <v-icon title="Run" @click="doStep(actions.STEP_RUN)">play_arrow</v-icon>
            </v-btn>

            <v-btn icon :disabled="isDebugDisabled">
                <v-icon title="Step over" @click="doStep(actions.STEP_OVER)">redo</v-icon>
            </v-btn>

            <v-btn icon :disabled="isDebugDisabled">
                <v-icon title="Step into" @click="doStep(actions.STEP_INTO)">trending_down</v-icon>
            </v-btn>

            <v-btn icon :disabled="isDebugDisabled">
                <v-icon title="Step out" @click="doStep(actions.STEP_OUT)">trending_up</v-icon>
            </v-btn>
            <v-btn icon :disabled="isDebugDisabled">
                <v-icon title="Stop" @click="doStep(actions.STEP_STOP)">stop</v-icon>
            </v-btn>
        </v-toolbar>
        <monaco-editor v-if="!rebuild"
                ref="editor"
                class="editor"
                v-model="code"
                language="javascript"
                :style = "{'bottom': lastError ? '48px' : '0px'}"
        >
        </monaco-editor>
      <div v-if="lastError" class="last-error">
        {{lastError}}
      </div>
    </div>
</template>

<script>
    import Axios from 'axios';
    import consts from '../../consts';
    import MonacoEditor from 'vue-monaco'
    import utils from '../../utils'

    export default {
        name: 'ScriptEditor',
        components: {
            MonacoEditor
        },
        props : ["uri"],
        created(){
        },
        mounted() {
            window.addEventListener('resize', this.onResize);
            this.reloadSource();
        },
        watch : {
            uri(){
                this.reloadSource();
            },
            host(new_value){
                this.reloadSource(new_value);
            },
            state() {
                this.refreshEditorState();
            },
        },
        beforeDestroy () {
            this.disposeEditor();
            window.removeEventListener('resize', this.onResize);
        },
        methods : {
            doStep(mode) {
                this.$bus.$emit(consts.EVENTS.WS_MESSAGE_TO, {
                    action : mode,
                    app : this.appname
                });

                //if(mode == consts.WS_ACTIONS.STEP_RUN)
                setTimeout(() => this.$bus.$emit(consts.EVENTS.WS_MESSAGE_TO, {
                    action : consts.WS_ACTIONS.GET_STATE,
                    app : this.appname
                }), 100);
            },
            doStepRun(){
                this.$bus.$emit(consts.EVENTS.WS_MESSAGE_TO, {
                    action : consts.WS_ACTIONS.STEP_RUN,
                    app : this.appname
                });

                setTimeout(() => this.$bus.$emit(consts.EVENTS.WS_MESSAGE_TO, {
                    action : consts.WS_ACTIONS.GET_STATE,
                    app : this.appname
                }), 100);
            },
            doStepInto() {
                this.$bus.$emit(consts.EVENTS.WS_MESSAGE_TO, {
                    action : consts.WS_ACTIONS.STEP_INTO,
                    app : this.appname
                });
            },
            getEditor() {
                return this.$refs.editor.getMonaco()
            },
            disposeEditor() {
                let editor = this.getEditor();
                if(editor) {
                    console.log('DISPOSE');
                    this.getEditor().getModel().dispose();
                    this.getEditor().dispose();
                }
            },
            rebuildEditor(on_rebuilded){
                this.disposeEditor();
                this.rebuild = true;
                this.decorations = [];
                Vue.nextTick(() =>{
                    this.rebuild = false;
                    Vue.nextTick(() =>{
                        this.refreshEditorState();
                    });
                });
            },
            refreshEditorState() {
                this.getEditor().updateOptions({ readOnly:  true});
                let new_decorations = [];
                if(this.state) {
                    let class_name = 'current-exec-line-text';
                    switch(this.state.event_type) {
                        case consts.DEBUGGER_EVENT.DEBUGGER_ON_ERROR:
                            class_name = 'current-error-line-text';
                            break;
                        case consts.DEBUGGER_EVENT.DEBUGGER_DETECTED:
                            class_name = 'current-debugger-line-text';
                            break;
                    }
                    new_decorations.push({
                        range: new monaco.Range(this.state.line, 1, this.state.line, 1),
                        options: {
                            isWholeLine: true,
                            className: class_name,
                            linesDecorationsClassName: 'current-exec-line-bookmark'
                        }
                    });
                    this.getEditor().revealLineInCenter(this.state.line);
                }
                this.decorations = this.getEditor().deltaDecorations(this.decorations, new_decorations);
            },
            reloadSource(host){
                if(this.oldSourceUrl == this.sourceUrl) {
                    this.refreshEditorState();
                } else  if(this.sourceUrl) {
                    let url = host || this.sourceUrl;
                    Axios.get(url, {cache: false}).then((response) => {
                        this.code = response.data;
                        this.oldSourceUrl = this.sourceUrl;
                        this.rebuildEditor();
                    }).catch((e) => {
                        this.$bus.$emit(consts.EVENTS.ALERT, consts.ALERT_TYPE.ERROR, `Error of loading source [${url}]`);
                        this.refreshEditorState();
                    });
                } else
                    this.code = '';
            },
            onResize(){
                this.getEditor().layout();
            }
        },
        computed: {
            lastError() {
              let app_state = this.$store.state.exec_state[this.appname];
              return app_state && ('last_error' in app_state) ? app_state.last_error : null;
            },
            appname() {
                return utils.parseURI(this.uri).app;
            },
            source() {
                return utils.parseURI(this.uri).id;
            },
            isDebugDisabled(){
                return !this.state || !this.state.line || !this.$store.state.connected;
            },
            actions(){
                return consts.WS_ACTIONS;
            },
            state() {
                if( (this.appname  in this.$store.state.exec_state)
                    && (this.source  in this.$store.state.exec_state[this.appname])
                )
                    return this.$store.state.exec_state[this.appname][this.source];
                else
                    return null;
            },
            sourceUrl() {
                return `${this.host}/apps/${this.appname}/${this.source}.mjs`;
            },
            host(){
                return this.$store.state.url;
            },
            manifest() {
                return this.$store.state.manifest;
            }
        },
        data () {
            return {
                rebuild : false,
                oldSourceUrl : null,
                decorations: [],
                code: ""
            }
        }
    }
</script>

<style>
    .editor {
        position: absolute;
        top: 48px;
        left: 0px;
        right: 0px;
        bottom: 0px;
    }

    .last-error {
        position: absolute;
        height: 48px;
        left: 0px;
        right: 0px;
        bottom: 0px;
        background: #C62828;
        color: #fff;
        padding: 4px;
        overflow-y: auto;
    }
    .current-exec-line-text {
        background: lightblue;
    }

    .current-error-line-text {
        background: #ff7777;
        color: #fff;
    }

    .current-debugger-line-text {
        background: orange;
        color: #000;
    }

    .current-exec-line-bookmark {
        background: lightblue;
        width: 5px !important;
        margin-left: 3px;
    }
</style>
