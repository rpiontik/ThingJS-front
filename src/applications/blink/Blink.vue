<template>
  <v-expansion-panel>
    <v-checkbox v-bind:label="'BLINK_SATE' | lang" v-model="blink_state"></v-checkbox>
  </v-expansion-panel>
</template>

<script>
export default {
  name: 'Blink',
  watch: {
    blink_state (state) {
      // Send event to script
      this.$bus.$emit($consts.EVENTS.UBUS_MESSAGE, 'blink', state);
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
