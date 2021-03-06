<template>
    <v-flex fill-height>
        <h1>{{'TITLE'|lang}}</h1>
        <v-container>
            <v-layout>
                <v-flex xs12 md12>
                    {{'DESCRIPTION'|lang}}
                </v-flex>
            </v-layout>
            <v-layout>
                <v-flex xs12 md12>
                    <v-checkbox v-bind:label="'BLINK_SATE' | lang" v-model="blink_state" @click="onClick"></v-checkbox>
                </v-flex>
            </v-layout>
        </v-container>
    </v-flex>
</template>

<script>
export default {
    name: 'Blink',
    mounted () {
        this.$bus.$on($consts.EVENTS.UBUS_MESSAGE, (type, state) => {
            if (type === 'blink') {
                this.blink_state = state === 'true';
            }
        });
    },
    methods: {
        onClick () {
            this.$bus.$emit($consts.EVENTS.UBUS_MESSAGE, 'blink', this.blink_state);
        }
    },
    data () {
        return {
            blink_state: true
        };
    }
};
</script>

<style>

</style>
