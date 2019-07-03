<template>
    <v-form ref="form" lazy-validation>
        <v-card style="width: 100%">
            <v-card-title primary-title>
                <v-layout row wrap>
                    <h1>{{'UPDATE_FIRMWARE_TITLE' | lang}}</h1>
                    <v-flex xs12>
                        <input
                                type="file"
                                accept=".bin"
                                style="display: flex"
                                @change="readFile"
                        />
                    </v-flex>
                </v-layout>
            </v-card-title>
            <v-card-actions text-xs-right v-if="!hideActions" >
                <v-btn @click="doFlashing">{{'DO_FIRMWARE' | lang }}</v-btn>
            </v-card-actions>
        </v-card>
        <block-screen v-if="flashing"></block-screen>
    </v-form>
</template>

<script>

    import blockScreen from './../BlockScreen.vue';
    import utils from './../../utils';
    import template from './Template.vue'

    const consts = window.$consts;

    export default {
        name: 'Firmware',
        extends : template,
        components : {
            'block-screen' : blockScreen
        },
        methods: {
            doFlashing(){
                let formData = new FormData();
                formData.append('data', new Blob([this.buffer]), 'firmware.bin');
                this.$store.commit('incNetPending');
                this.flashing = true;
                this.$axios.post( '/firmware',
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                ).then(() => {
                    this.$store.commit('decNetPending');
                    setTimeout(()=>{
                        document.location.reload(true);
                    }, 5000);
                })
                .catch((e) => {
                    console.error(e);
                    this.flashing = false;
                    this.$store.commit('decNetPending');
                    this.$bus.$emit(
                        consts.EVENTS.ALERT,
                        consts.ALERT_TYPE.ERROR,
                        Vue.filter('lang')('ERROR_FIRMWARE')
                    );
                });
            },

            readFile(evt){
                let files = evt.target.files;
                let file = files[0];
                let reader = new FileReader();
                reader.onload = (event) => {
                    this.buffer = event.target.result;
                    this.size   = this.buffer.byteLength;
                }
                reader.readAsArrayBuffer(file);
            }
        },
        data() {
            return {
                size : null,
                buffer : null,
                flashing : false,
            }
        }
    }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
