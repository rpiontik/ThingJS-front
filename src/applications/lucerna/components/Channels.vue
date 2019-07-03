<template>
    <g :transform="['translate(' + left +','+ top + ')']">
        <template v-for="channel, index in channels">
            <g :key="index">
                <rect
                        class="channel-item"
                        :style = "{'fill' : channel.color, 'opacity' : channel.expand ? 1 : 0.5}"
                        :x="channel.x - getExpanderWidth(channel)"
                        :y="channel.y - radius"
                        :rx="radius"
                        :ry="radius"
                        :width="getWidth(channel)"
                        :height="radius * 2"
                        @mousemove.stop.prevent="onMouseMove(channel, $event)"
                        @mouseleave.prevent="onMouseLeave(channel, $event)"
                        @mousedown.stop.preventv
                        @mouseup.stop.prevent = "sliding = false"
                />
                <line
                        class="slider-line"
                        :x1="channel.x - (channel.expand ? getExpanderWidth(channel) - radius : 0)"
                        :y1="channel.y"
                        :x2="channel.x - (channel.expand ? radius : 0)"
                        :y2="channel.y"
                        :style="{'stroke' : getContrastYIQ(channel.color.slice(-6))}"
                        @mousemove.stop.prevent="onMouseMove(channel, $event)"
                        @mousedown.stop.prevent
                />
                <circle
                        :cx="channel.x - (channel.expand ? radius + ((getExpanderWidth(channel) - radius * 2) * channel.level) : 0)"
                        :cy="channel.y"
                        :r="channel.expand ? radius / 2 : 0"
                        :style="{'fill' : getContrastYIQ(channel.color.slice(-6))}"
                        @mousemove.prevent="onMouseMove(channel, $event)"
                        @mousedown.stop.prevent = "onSliderMouseDown(channel, $event)"
                        @mouseup.stop.prevent = "sliding = false"
                />
                <text
                        :x="channel.x + radius * 0.75"
                        :y="channel.y"
                        :dy="fontHeight * 0.25"
                        text-anchor="middle"
                        class="channel-level"
                        :font-size="`${fontHeight}px`"
                        :style="{'fill' : getContrastYIQ(channel.color.slice(-6))}"
                        @mousemove.prevent="doExpandChannel(channel, true)"
                        @mousedown.stop.prevent
                >
                    {{channel.level|percent}}
                </text>
            </g>
        </template>
    </g>
</template>

<script>

    import Utils from '../utils';

    export default {

        props: {
            value : {
                type : Array,
                required: true,
            },
            left : {
                type : Number,
                default: 0
            },
            top : {
                type : Number,
                default: 0
            },
            width : {
                type : Number,
                default: 0
            },
            height : {
                type : Number,
                default: 0
            },
            koofScreenX : {
                type : Number,
                default: 1
            },
            koofScreenY : {
                type : Number,
                default: 1
            }
        },
        methods : {
            doCloseChannels(except){
                this.channels.map((channel)=>{
                    if(channel !== except)
                        this.doExpandChannel(channel, false);
                });
            },
            doExpandChannel(channel, value){
                if(!channel.expand && value)
                    this.sliding = false;
                if(value)
                    this.doCloseChannels(channel);
                channel.expand = value;
            },
            onSliderMouseDown(channel, event){
                this.sliding = true;
                this.doExpandChannel(channel, true);
            },

            calcLevelsByBrightness() {
                let max = 0;
                for(let channel = 1; channel < this.channels.length; channel++)
                    if(this.channels[channel].level >  max)
                        max = this.channels[channel].level;

                let brightness = this.channels[0].level;

                for(let channel = 1; channel < this.channels.length; channel++)
                    this.channels[channel].level = !max ? brightness : brightness * (this.channels[channel].level / max);
            },

            calcBrightnessByLevels() {
                let max = 0;
                for(let channel = 1; channel < this.channels.length; channel++)
                    if(this.channels[channel].level >  max)
                        max = this.channels[channel].level;

                this.channels[0].level = max;
            },

            updateValue(){
                this.channels.map((channel) => {
                    this.value[channel.index].level = channel.level;
                });

                this.$emit('input', this.value);
            },

            onMouseMove(channel, event) {
                this.doExpandChannel(channel, true);
                if(this.sliding){
                    let level = -(event.offsetX * this.koofScreenX - channel.x - this.left + this.radius)
                        / (this.getExpanderWidth(channel) - this.radius * 2);
                    if(level > 1)
                        level = 1;
                    else if(level < 0)
                        level = 0;
                    channel.level = level;

                    if(channel.index === 0)
                        this.calcLevelsByBrightness();
                    else
                        this.calcBrightnessByLevels();

                    this.updateValue();
                }
            },
            getContrastYIQ(hexcolor){
                return Utils.getContrastYIQ(hexcolor)
            },
            onMouseLeave(channel, event) {
                if(('toElement' in event) && (event.toElement.parentElement !== event.target.parentElement))
                    this.doExpandChannel(channel, false);
            },
            getExpanderWidth(channel){
                return channel.expand ? this.radius * 20: this.radius * 0.5;
            },
            getWidth(channel){
                return this.radius * 2 + this.getExpanderWidth(channel);
            },
            remakeParams(params){
                if(!params.channels)
                    params.channels = [];
                params.cellHeight = (this.height - 16) / this.value.length;
                params.radius = (params.cellHeight > this.width ? this.width : params.cellHeight) / 2;
                params.fontHeight = params.radius * 0.75;

                let top_offset = 0;
                this.value.map((source, index) => {
                    if(!params.channels[index])
                        params.channels[index] = {};

                    let dest = params.channels[index];

                    dest.index = index;
                    dest.expand = !!dest.expand;
                    dest.color = source.color;
                    dest.level = source.level;
                    dest.x = this.width / 2;
                    dest.y = top_offset;

                    top_offset += (!top_offset ? params.radius * 0.75 : 0) + params.radius * 2 + 2;
                });

                return params;
            }
        },
        computed :{
        },

        filters: {
            percent(value) {
                return !value ? 0 : (value * 100).toFixed(2);
            },
        },
        watch : {
            width(){
                this.remakeParams(this);
            },
            height(){
                this.remakeParams(this);
            },
            value(){
                this.remakeParams(this);
            }
        },

        data(){
            return this.remakeParams({
                sliding : false
            });
        }

    }
</script>

<style lang="less" rel="stylesheet/less">

    .channel-item {
        cursor: pointer;
        stroke : #0000f5;
        stroke-width: 0.5px;
        transition: all 0.15s ease-in;
    }

    .channel-level {
        cursor: pointer;
        transition: all 0.15s ease-in;
    }

    .slider-line {
        stroke-width: 1px;
        transition: all 0.15s ease-in;
    }

</style>