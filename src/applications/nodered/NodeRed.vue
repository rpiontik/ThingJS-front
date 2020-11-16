<template>
    <v-flex fill-height>
        <h1>{{'TITLE'|lang}}</h1>
        {{'DESCRIPTION'|lang}}
        <div class="text-center">
            <v-btn round large color="primary" @click="doExec">RUN</v-btn>
        </div>
    </v-flex>
</template>

<script>
export default {
    name: 'NodeRed',
    mounted () {
        this.$bus.$on($consts.EVENTS.UBUS_MESSAGE, (type, data) => {
            switch (type) {
            case 'http-req-proc':
                break;
            }
        });
    },
    methods: {
        doExec () {
            this.$bus.$emit($consts.EVENTS.UBUS_MESSAGE, 'nodered-exec', this.url);
        }
    },
    data () {
        return {
        };
    }
};
</script>

<style>

</style>
