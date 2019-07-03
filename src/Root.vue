<template>
    <div>
        <launcher v-if="isProfileReady" :key="0"/>
        <template v-if="!this.is_launcher_loaded">
            <div style="position: fixed; left: 0; top: 0; bottom: 0; right: 0; opacity: 0.5; background-color: #E3F2FD; z-index: 99999"></div>
            <div
                    v-if="!this.is_launcher_loaded"
                    style="position: fixed; top: 0; left: 0; bottom: 0; right: 0; background-color: #fff; z-index: 10000;"
            >
                <v-progress-circular
                        indeterminate
                        :size="80"
                        color="primary"
                        style="margin-left: -40px; margin-top: -40px; left: 50%; top: 50%; position: fixed; z-index: 100000"
                ><span style="font-size: 10px;">Loading...</span></v-progress-circular>
            </div>
        </template>
    </div>
</template>

<script>
    import consts from 'consts';

    export default {
        name: 'ThingJSCore',
        mounted() {

            this.onResize();
            window.addEventListener('resize', this.onResize, { passive: true });

            //Loading available access points
            this.$bus.$on(consts.EVENTS.LAUNCHER_IS_LOADED, (type, messages) => {
                this.is_launcher_loaded = true;
            });

            setTimeout(() => {
                window.$bus.$emit(consts.EVENTS.CORE_IS_LOADED);
            }, 50);
        },
        beforeDestroy () {
            if (typeof window !== 'undefined') {
                window.removeEventListener('resize', this.onResize, { passive: true })
            }
        },
        methods : {
            onResize () {
                this.$store.commit('setIsMobile', window.innerWidth < 600);
            }
        },
        computed: {
            isProfileReady(){
                return !!this.$store.state.apps.manifest;
            },
        },
        data : {
            is_launcher_loaded : false
        }
    }
</script>

<style>
    @import './assets/material_icons.css';
    @import '../node_modules/vuetify/dist/vuetify.min.css';
</style>
