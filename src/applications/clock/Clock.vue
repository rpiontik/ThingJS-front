<template>
    <v-flex fill-height>
        <h1>{{'TITLE'|lang}}</h1>
        <v-container>
            <v-layout>
                <v-flex xs12 md1>
                    {{'CURRENT_TIME'|lang}}:
                </v-flex>
                <v-flex xs12 md4>
                    {{curr_time}}
                </v-flex>
            </v-layout>
        </v-container>
    </v-flex>
</template>

<script>

    export default {
        name: 'Clock',
        mounted() {
            this.$bus.$on($consts.EVENTS.UBUS_MESSAGE, (type, time) => {
                if (type === 'show-time') {
                    // Correct on local time
                    this.curr_time = new Date(1000 * time + new Date().getTimezoneOffset() * 60000);
                }
            });
        },
        data() {
            return {
                curr_time: '---'
            };
        }
    };
</script>

<style>

</style>
