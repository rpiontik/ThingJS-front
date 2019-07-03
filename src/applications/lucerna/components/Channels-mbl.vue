<template>
    <div>
        <div class="channels-place">
            Hello
        </div>
    </div>
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
        },
        computed :{
        },

        filters: {
        },
        watch : {
        },

        data(){
            return this.remakeParams({
                sliding : false
            });
        }

    }
</script>

<style lang="less" rel="stylesheet/less">

    .channels-place {
        width: 100%;
        height: 32px;
    }

</style>