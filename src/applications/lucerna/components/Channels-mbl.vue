<template>
    <div class="channels-place-mbl-component">
        <div class="channels-selector">
            <div
                    class="channels-place"
                    :style="getChannelsPlaceStyle()"
            >
                <div
                        v-for="(channel, index) in channels"
                        :class="{'item' : true, 'selected' : index === selectedChannel}"
                        :style="getChannelItemStyle(channel)"
                        @click="onSelectChannel(channel)"
                >{{channel.level|percent}}</div>
            </div>
        </div>
        <v-slider
                class="slider"
                v-model="level"
                min="0"
                max="10000"
        ></v-slider>
    </div>
</template>

<script>
import Utils from '../utils';

const CHANNEL_ITEM_WIDTH = 56;
const CHANNEL_ITEM_MARGIN = 4;

export default {
    props: {
        value: {
            type: Array,
            required: true
        }
    },
    methods: {
        onSelectChannel (channel) {
            this.selectedChannel = channel.index;
        },

        getChannelsPlaceStyle () {
            return {
                'width': (CHANNEL_ITEM_WIDTH + CHANNEL_ITEM_MARGIN) * this.channels.length + 'px'
            };
        },

        getChannelItemStyle (item) {
            return {
                'background-color': item.color,
                'color': Utils.getContrastColor(item.color)
            };
        }
    },
    computed: {
        level: {
            get () {
                return this.channels[this.selectedChannel].level * 10000;
            },
            set (level) {
                if (this.vModelTimer) {
                    clearTimeout(this.vModelTimer);
                }

                this.vModelTimer = setTimeout(() => {
                    let newLevel = level / 10000;

                    if (newLevel === this.channels[this.selectedChannel].level) { return; }

                    let levels = JSON.parse((JSON.stringify(this.channels)));
                    levels[this.selectedChannel].level = newLevel;

                    let max = 0;

                    for (let channel = 1; channel < levels.length; channel++) {
                        if (max < levels[channel].level) {
                            max = levels[channel].level;
                        }
                    }

                    if (this.selectedChannel === 0) {
                        let brightness = levels[0].level;
                        for (let channel = 1; channel < levels.length; channel++) {
                            levels[channel].level = !max ? brightness : brightness * (levels[channel].level / max);
                        }
                        max = brightness;
                    } else {
                        levels[0].level = max;
                    }
                    this.$emit('input', levels);
                }, 10);
            }
        },

        channels () {
            let result = [];
            if (this.value) {
                this.value.map((source, index) => {
                    result.push({
                        index: index,
                        color: source.color,
                        level: source.level
                    });
                });
            }
            return result;
        }
    },

    filters: {
        percent (value) {
            return !value ? 0 : (value * 100).toFixed(2);
        }
    },
    watch: {},

    data () {
        return {
            selectedChannel: 0,
            vModelTimer: null
        };
    }

};
</script>

<style lang="less" rel="stylesheet/less">

    .channels-place-mbl-component {
        width: 100%;

        .channels-selector {
            width: 100%;
            height: 59px;
            overflow-x: auto;
            .channels-place {
                .item {
                    display: block;
                    float: left;
                    width: 56px;
                    height: 56px;
                    margin-right: 4px;
                    border: solid 1px #fff;
                    border-radius: 28px;
                    text-align: center;
                    font-size: 16px;
                    padding-top: 16px;
                }

                .item.selected {
                    border: 2px solid #f00;
                }
            }
        }

        .slider {
            width: 100%;
            height: 56px;
            margin-top: 8px;
            padding-left: 16px;
            padding-right: 16px;

            .v-slider__thumb {
                width: 48px;
                height: 48px;
                left: -24px;
            }

        }

    }

</style>
