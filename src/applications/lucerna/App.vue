<template>
    <v-flex fill-height class="desk"
            :class="{'mobile' : isMobileScreen}"
    >
        <lucerna-scheduller draggable="true"
                            class="scheduler"
                            :intervalWidth="interval.width"
                            :channels="channels"
        ></lucerna-scheduller>
    </v-flex>
</template>

<script>

export default {
    name: 'Lucerna',
    computed: {
        interval () {
            let result = {
                width: 86400
            };
            let config = this.$store.state.Lucerna.data.config;
            if (config && config.length) {
                result = config[0].interval;
            }
            return result;
        },
        channels () {
            let config = this.$store.state.Lucerna.data.config;
            if (config && config.length) {
                config = config[0];
            } else {
                return [];
            }
            let result = [];
            for (let channel = 0; channel < config.channelNumber; channel++) {
                result.push(
                    {
                        color: '#' + ('000000' + (+config.channels[channel].color).toString(16)).slice(-6),
                        mw: +config.channels[channel].mw,
                        spectrum: ((spectrum) => {
                            return !spectrum ? [] : spectrum.filter((wave) => {
                                return wave.channel == channel;
                            });
                        })(this.$store.state.Lucerna.data.spectrum).sort((a, b) => {
                            if (+a.wave < +b.wave) {
                                return -1;
                            }
                            if (+a.wave > +b.wave) {
                                return 1;
                            } else {
                                return 0;
                            }
                        })
                    }
                );
            }
            return result;
        }
    },
    data () {
        return {
            message: $consts.WEBSOCKET.ADDRESS
        };
    }
};
</script>

<style>

    .desk {
        position: absolute;
        left: 0;
        top: 0;
        right: 0;
        bottom: 0;
        padding: 8px;
        overflow: hidden;
    }

    .scheduler {
        min-height: 70vh;
        width: 100%;
        height: 100%;
    }

    .desk.mobile {
        overflow-y: auto;
    }

    .mobile .scheduler {
        height: calc(100% - 112px);
    }

</style>
