<template>
    <v-form ref="form" lazy-validation>
        <v-card style="width: 100%">
            <v-card-title primary-title>
                <v-layout row wrap>
                    <h1>{{'DISPLAY_TITLE' | lang}}</h1>
                    <v-flex xs12>
                        <v-select
                                :label="'THEME' | lang"
                                v-model="theme"
                                :items="themes"
                                required
                        ></v-select>
                    </v-flex>
                    <v-flex xs12>
                        <v-select
                                :label="'LANGUAGE' | lang"
                                v-model="lang"
                                :items="languages"
                                required
                        ></v-select>
                    </v-flex>
                </v-layout>
            </v-card-title>
            <v-card-actions text-xs-right v-if="!hideActions" >
                <v-btn @click="submit">{{'SUBMIT' | lang }}</v-btn>
                <v-btn @click="reset" flat>{{'RESET' | lang }}</v-btn>
            </v-card-actions>
        </v-card>
    </v-form>
</template>

<script>

    import consts from 'consts';
    import template from './Template.vue'

    export default {
        name: 'SettingsDisplay',
        extends : template,
        computed: {
            themes(){
                return Vue.filter('lang')('THEMES');
            },

            theme: {
                get(){
                    return this.$store.state.display.theme;
                },
                set(value){
                    this.$store.commit('setTheme', value);
                }
            },
            lang: {
                get(){
                    return this.$store.state.display.lang;
                },
                set(value){
                    this.$store.commit('setLang', value);
                }
            }
        },
        methods: {
            reset(){
                this.$store.commit('setLang', (navigator.language || navigator.userLanguage).toLowerCase());
                this.$store.commit('setTheme', consts.DISPLAY_DEF.theme);
            },
            submit(){
                this.$store.dispatch('putConfiguration', {
                    display : {
                        lang : this.$store.state.display.lang,
                        theme : this.$store.state.display.theme
                    }
                });
            }
        },
        data () {
            return {
                languages : [
                    {text: 'English', value: 'en'},
                    {text: 'Русский', value: 'ru'}
                ]
            }
        }
    }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
