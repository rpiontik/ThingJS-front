<template>
    <div class="desk">
        <lucerna-scheduller draggable="true"
                :class="{'scheduler' : true, 'mobile' : isMobileScreen}"
                :intervalWidth="interval.width"
                :channels="channels"
        ></lucerna-scheduller>
    </div>
</template>

<script>

    export default {
        name: 'Lucerna',
        computed : {
            interval(){
                let result = {
                    width : 86400
                };
                let config = this.$store.state.Lucerna.data.config;
                if(config && config.length)
                    result = config[0].interval;
                return result;
            },
            channels(){
                let config = this.$store.state.Lucerna.data.config;
                if(config && config.length)
                    config = config[0];
                else
                    return [];
                let result = [];
                for(let channel = 0; channel < config.channelNumber; channel++) {
                    result.push(
                        {
                            color : '#' + ('000000' + (+config.channels[channel].color).toString(16)).slice(-6),
                            mw : +config.channels[channel].mw,
                            spectrum : ((spectrum) => {
                                return !spectrum ? [] : spectrum.filter((wave) => {
                                    return wave.channel == channel;
                                });
                            })(this.$store.state.Lucerna.data.spectrum).sort((a, b)=>{
                                if(+a.wave < +b.wave)
                                    return -1;
                                if(+a.wave > +b.wave)
                                    return 1;
                                else
                                    return 0;
                            })
                        }
                    );
                }
                return result;
            }
        },
        data() {
            return {
                message : $consts.WEBSOCKET.ADDRESS
            }
        }
    }
</script>

<style>

    .desk {
        position: absolute;
        left: 0;
        top: 0;
        right: 0;
        bottom: 0;
        padding : 8px;
        /* border: 1px solid #f00; */
        /* min-height: 80vh; */
    }

    .scheduler {
        min-height: 350px;
        width: 100%;
        height: 100%;
    }

    .scheduler.mobile {
        height: calc(100% - 56px);
    }

</style>
