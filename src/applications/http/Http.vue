<template>
    <v-flex fill-height>
        <h1>{{'TITLE'|lang}}</h1>
        {{'DESCRIPTION'|lang}}
        <v-container>
            <v-layout>
                <v-flex xs12 md6>
                    <v-text-field v-model="url"></v-text-field>
                </v-flex>
            </v-layout>
        </v-container>
        <div class="text-center">
            <v-btn :disabled="!!process" round large color="primary" @click="doRequest">RUN</v-btn>
        </div>
        <v-container>
            <v-layout>
                <v-flex xs12 md1>
                    HTTP code:
                </v-flex>
                <v-flex xs12 md4>
                    {{code}}
                </v-flex>
            </v-layout>
            <v-layout>
                <v-flex xs12 md1>
                    Content length:
                </v-flex>
                <v-flex xs12 md4>
                    {{length}}
                </v-flex>
            </v-layout>
            <v-layout>
                <v-flex xs12 md1>
                    Error:
                </v-flex>
                <v-flex xs12 md4>
                    {{error}}
                </v-flex>
            </v-layout>
        </v-container>
    </v-flex>
</template>

<script>
export default {
    name: 'HTTP',
    mounted () {
        this.$bus.$on($consts.EVENTS.UBUS_MESSAGE, (type, data) => {
            let response = {};
            switch (type) {
            case 'http-req-proc':
                response = JSON.parse(data);
                this.code = response.code;
                this.length = response.length;
                break;
            case 'http-req-end':
                response = JSON.parse(data);
                this.error = response.error;
                this.code = response.code;
                clearTimeout(this.process);
                this.process = null;
                break;
            }
        });
    },
    methods: {
        doRequest () {
            this.code = '---';
            this.length = '---';
            this.error = '---';
            this.$bus.$emit($consts.EVENTS.UBUS_MESSAGE, 'do-http-req', this.url);
            this.process = setTimeout(function () {
                this.process = null;
            }, 30000);
        }
    },
    data () {
        return {
            process: null,
            url: 'https://example.com/',
            code: '---',
            length: '---',
            error: '---'
        };
    }
};
</script>

<style>

</style>
