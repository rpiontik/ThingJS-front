<template>
</template>

<script>

import consts from './consts'

export default {
    created(){
        this.$on(consts.EVENTS.WS_MESSAGE_TO, (message) => {
            if(this.websocket)
                this.websocket.send(JSON.stringify(message));
        });

        //Recovery connection
        setInterval(() => {
            if(!this.websocket) //IS CLOSED
                this.startWebsocket();
        }, 3000);

        //Ping
        setInterval(() => {
            if(!this.websocket || !this.websocket.readyState)
                return;

            if( this.pingMarker) {
                this.$emit(consts.EVENTS.WS_TIMEOUT);
            } else
                this.pingMarker = true;

            this.websocket.send("");
        }, 1000);
    },
    methods : {
        startWebsocket(){
            if (!"WebSocket" in window){
                console.warn("WebSocket NOT supported by your Browser!");
                return false;
            } else if (!this.wsAddress) {
                console.warn("WebSocket address NOT defined!");
                return false;
            } else if (!this.$store.state.manifest) {

            }

            if(!this.websocket)
                this.websocket = new WebSocket(this.wsAddress);

            this.$emit(consts.EVENTS.WS_STARTING);

            this.websocket.onopen = () => {
                this.pingMarker = false;
                this.$emit(consts.EVENTS.WS_STARTED);
            };

            this.websocket.onmessage = (evt) => {
                if(!this.$store.state.connected)
                    this.$emit(consts.EVENTS.WS_RECOVERED);
                this.pingMarker = false;
                if(evt.data && evt.data.length)
                    this.$emit(consts.EVENTS.WS_MESSAGE_FROM, JSON.parse(evt.data));
            };

            this.websocket.onerror = () => {
                try {
                    let ws  = this.websocket;
                    this.websocket  = null;
                    ws.close();
                } catch(e){
                }
                this.$emit(consts.EVENTS.WS_ERROR);
                this.$emit(consts.EVENTS.WS_CLOSED);
            };

            this.websocket.onclose = () => {
                this.$emit(consts.EVENTS.WS_CLOSED);
                this.websocket  = null;
            };
        },
        stopWebsocket(){
            if(this.websocket) {
                this.websocket.onerror  = () =>{};
                this.websocket.onclose = () =>{};
                this.websocket.close();
            }
        },
    },

    beforeDestroy(){
        this.stopWebsocket();
    },

    computed: {
        wsAddress(){
            return this.$store.state.url ? 'ws://' + (new URL(this.$store.state.url)).hostname + ':81' : null;
        }
    },

    watch: {
        wsAddress(value) {
            this.stopWebsocket();
            this.startWebsocket();
        }
    },

    data : {
        websocket   : null,
        pingMarker : false,
    }

}
</script>
