<template>
    <v-form ref="form" lazy-validation>
        <v-card style="width: 100%">
            <v-card-title primary-title>
                <v-container style="padding: 0">
                    <v-layout row>
                        <h1>{{'PREFS_TITLE' | lang}}</h1>
                    </v-layout>
                    <v-layout :wrap="isMobileScreen">
                        <v-flex :xs12="isMobileScreen" :xs6="!isMobileScreen" class="col1">
                            <v-text-field
                                    v-model="daysNumber"
                                    class="col1"
                                    :label="'DAYS_NUMBER' | lang"
                                    type="number"
                                    min="1"
                                    max="365"
                            ></v-text-field>
                        </v-flex>
                        <v-flex :xs12="isMobileScreen" :xs6="!isMobileScreen" class="col2">
                            <v-text-field
                                    v-model="channelsNumber"
                                    :label="'CHANNELS_NUMBER' | lang"
                                    type="number"
                                    min="1"
                                    max="16"
                            ></v-text-field>
                        </v-flex>
                    </v-layout>
                    <v-layout row>
                        <h3>{{'COLORS_TITLE' | lang}}</h3>
                    </v-layout>
                    <v-layout row wrap>
                        <template v-for="i in channelsNumber">
                            <label
                                    class="color-packer"
                                    :style="{
                                        'background-color' : config.channels[i - 1].color,
                                        'color' : getContrastColor(config.channels[i - 1].color)
                                    }"
                            >{{i}}
                                <input
                                        type="file"
                                        accept=".led"
                                        style="position: absolute; width: 0.1px; height: 0.1px; z-index: -1; opacity: 0; overflow: hidden;"
                                        @change="uploadLEDFile($event, i - 1)"
                                />
                            </label>
                        </template>
                    </v-layout>
                </v-container>
            </v-card-title>
            <v-card-actions text-xs-right>
                <v-btn @click="submit">{{'SUBMIT' | lang }}</v-btn>
                <v-btn @click="reset" flat>{{'RESET' | lang }}</v-btn>

                <v-btn @click="download" class="download-file" icon :title="'DOWNLOAD' | lang ">
                    <v-icon color="grey" large>archive</v-icon>
                </v-btn>
                <label class="upload-file" :title="'UPLOAD' | lang ">
                    <v-icon color="grey" large>unarchive</v-icon>
                    <input type="file" @change="upload" accept=".json"/>
                </label>
            </v-card-actions>
        </v-card>
    </v-form>
</template>

<script>

import Utils from '../utils';

let consts = window.$consts;

const default_config = {
    channelNumber: 0,
    channels: [
        {color: '#000000', mw: 0}, {color: '#000000', mw: 0}, {color: '#000000', mw: 0},
        {color: '#000000', mw: 0}, {color: '#000000', mw: 0}, {color: '#000000', mw: 0},
        {color: '#000000', mw: 0}, {color: '#000000', mw: 0}, {color: '#000000', mw: 0},
        {color: '#000000', mw: 0}, {color: '#000000', mw: 0}, {color: '#000000', mw: 0},
        {color: '#000000', mw: 0}, {color: '#000000', mw: 0}, {color: '#000000', mw: 0},
        {color: '#000000', mw: 0}
    ],
    interval: {
        width: 86400
    }
};

export default {
    name: 'SettingsLucerna',
    computed: {
        daysNumber: {
            get () {
                return 'interval' in this.config ? this.config.interval.width / 86400 : 1;
            },
            set (value) {
                this.config.interval.width = (value < 1 ? 1 : (value < 365 ? value : 365)) * 86400;
            }
        },

        channelsNumber: {
            get () {
                return this.config.channelNumber;
            },
            set (value) {
                this.config.channelNumber = (+value < 1 ? 1 : (+value > 16 ? 16 : +value));
            }
        }
    },
    methods: {
        copyConfig (source, to) {
            let result = {
                channelNumber: source.channelNumber,
                channels: [],
                interval: {
                    width: source.interval.width
                }
            };
            for (let key in source.channels) {
                if (to === 'ui') {
                    result.channels[key] = {
                        color: '#' + ('000000' + (+source.channels[key].color).toString(16)).slice(-6),
                        mw: source.channels[key].mw
                    };
                } else if (to === 'hw') {
                    result.channels[key] = {
                        color: parseInt(source.channels[key].color.slice(-6), 16),
                        mw: source.channels[key].mw
                    };
                }
            }

            return result;
        },

        copySpectrum (source, to) {
            let result = [];
            source.map((item) => {
                if (to === 'ui') {
                    result.push({
                        channel: +item.channel,
                        wave: +item.wave,
                        value: +item.value / 1000
                    });
                } else if (to === 'hw') {
                    let value = Math.round(+item.value * 1000);
                    if (value) {
                        result.push({
                            channel: +item.channel,
                            wave: +item.wave,
                            value: Math.round(+item.value * 1000)
                        });
                    }
                }
            });

            return result;
        },

        getContrastColor (hexcolor) {
            return Utils.getContrastColor(hexcolor);
        },

        reset () {
            this.new_config = null;
        },
        submit () {
            this.$store.commit('Lucerna/data/applyData', {
                name: 'config',
                data: [this.copyConfig(this.config, 'hw')]
            });
            this.$store.commit('Lucerna/data/applyData', {
                name: 'spectrum',
                data: this.copySpectrum(this.spectrum, 'hw')
            });
            this.$store.dispatch('Lucerna/data/post', 'config');
            this.$store.dispatch('Lucerna/data/post', 'spectrum');
        },

        uploadLEDFile (evt, channel) {
            let files = evt.target.files;
            let file = files[0];
            let reader = new FileReader();
            reader.onload = (event) => {
                try {
                    let led = JSON.parse(event.target.result);
                    let error_format = typeof led !== 'object';
                    error_format |= !('name' in led);
                    error_format |= !('color' in led);
                    error_format |= !('mw' in led);
                    error_format |= !('waves' in led);

                    if (error_format) {
                        throw 'Error format file';
                    }

                    ((cnl) => {
                        cnl.mw = +led.mw;
                        cnl.color = `#${led.color}`;
                    })(this.config.channels[channel]);

                    this.spectrum = this.spectrum.filter((wave) => {
                        return wave.channel !== channel;
                    });

                    for (let wave in led.waves) {
                        this.spectrum.push({
                            channel: +channel,
                            wave: +wave,
                            value: +led.waves[wave]
                        });
                    }
                } catch (e) {
                    this.$bus.$emit(consts.EVENTS.ALERT, consts.ALERT_TYPE.ERROR, Vue.filter('lang')('ERROR_LOAD_LIGHT_CONFIG'));
                    console.error(e);
                }
            };
            reader.readAsText(file);
        },
        upload (evt) {
            let files = evt.target.files;
            let file = files[0];
            let reader = new FileReader();
            reader.onload = (event) => {
                try {
                    let data = JSON.parse(event.target.result);
                    let error_format = typeof data !== 'object';
                    error_format |= !('config' in data);
                    error_format |= !('spectrum' in data);

                    if (error_format) {
                        throw 'Error format file';
                    }

                    this.config = data.config;
                    this.spectrum = data.spectrum;
                } catch (e) {
                    this.$bus.$emit(consts.EVENTS.ALERT, consts.ALERT_TYPE.ERROR, Vue.filter('lang')('ERROR_LOAD_LIGHT_CONFIG'));
                    console.error(e);
                }
            };
            reader.readAsText(file);
        },
        download () {
            let content = encodeURIComponent(JSON.stringify({
                config: this.config,
                spectrum: this.spectrum
            }));
            let element = document.createElement('a');
            element.setAttribute('href', 'data:text/json;charset=utf-8,' + content);
            element.setAttribute('download', 'ledkit.json');
            element.style.display = 'none';
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
        }
    },
    data () {
        let data = {};
        this.$bus.$on(consts.EVENTS.STORE_RELOADED, (action, content) => {
            switch (action) {
            case 'Lucerna/spectrum':
                this.spectrum = this.copySpectrum(this.$store.state.Lucerna.data.spectrum, 'ui');
                break;
            case 'Lucerna/config':
                this.config = this.copyConfig(this.$store.state.Lucerna.data.config[0], 'ui');
                break;
            }
        });

        if (!this.$store.state.Lucerna.data.config) {
            this.$store.dispatch('Lucerna/data/reload', 'config');
            data.config = default_config;
        }
        if (!this.$store.state.Lucerna.data.config || !this.$store.state.Lucerna.data.config.length) {
            data.config = default_config;
        } else {
            data.config = this.copyConfig(this.$store.state.Lucerna.data.config[0], 'ui');
        }

        if (!this.$store.state.Lucerna.data.spectrum) {
            this.$store.dispatch('Lucerna/data/reload', 'spectrum');
            data.spectrum = [];
        } else {
            data.spectrum = this.copySpectrum(this.$store.state.Lucerna.data.spectrum, 'ui');
        }

        return data;
    }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

    .col1 {
        padding-right: 4px;
    }

    .col2 {
        padding-left: 4px;
    }

    .color-packer {
        display: inline-block;
        width: 1cm;
        height: 1cm;
        line-height: 1cm;
        text-align: center;
        font-size: 0.5cm;
        margin: 2px;
        border-radius: 4px;
        border: solid 1px silver;
        cursor: pointer;
    }

    .color-packer input {
        display: none;
    }

    .download-file, .upload-file {
        width: 1cm;
        height: 1cm;
        position: relative;
    }

    .upload-file {
        cursor: pointer;
    }

    .upload-file:before {
        border-radius: 50%;
        color: inherit;
        content: "";
        position: absolute;
        left: 0;
        top: 0;
        height: 100%;
        opacity: .12;
        -webkit-transition: .3s cubic-bezier(.25, .8, .5, 1);
        transition: .3s cubic-bezier(.25, .8, .5, 1);
        width: 100%;
    }

    .upload-file > * {
        margin-left: 2px;
        margin-top: 1px;
    }

    .upload-file:hover:before {
        background-color: currentColor;
    }

    .upload-file input {
        position: fixed;
        left: 0;
        top: 0;
        opacity: 0;
        overflow: hidden;
        width: 0.1px;
        height: 0.1px;
        z-index: -1;
    }

</style>
