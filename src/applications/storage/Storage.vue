<template>
    <v-flex fill-height>
        <h1>{{'TITLE'|lang}}</h1>
        <v-container>
            <v-layout>
              <v-flex xs12 md1>
                <v-btn @click="putToController">{{'PUT_TO_CONTROLLER'|lang}}</v-btn>
              </v-flex>
              <v-flex xs12 md4>
                {{example}}
              </v-flex>
            </v-layout>
        </v-container>
    </v-flex>
</template>

<script>

export default {
    name: 'Storage',
    created () {
        this.$store.dispatch('Storage/data/reload', 'example');
        this.$bus.$on(window.$consts.EVENTS.UBUS_MESSAGE, (type, messages) => {
            switch (type) {
            case '$-storage-changed':
                if (messages === 'Storage/data/example') {
                    this.$store.dispatch('Storage/data/reload', 'example');
                }
                break;
            }
        });
    },
    computed: {
        example: {
            get () {
                if (!this.$store.state.Storage.data.example) {
                    this.$store.dispatch('Storage/data/reload', 'example');
                }
                return this.$store.state.Storage.data.dots || [];
            }
        }
    },
    methods: {
        putToController () {
            // this.$store.commit('Storage/data/applyData', {name: 'example', data: cloneDot});
            this.$store.dispatch('Storage/data/post', 'example');
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
