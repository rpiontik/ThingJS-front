<template>
  <v-expansion-panel>
    <v-label>{{curr_time}}</v-label>
  </v-expansion-panel>
</template>

<script>
export default {
  name: 'Clock',
  mounted () {
    this.$bus.$on($consts.EVENTS.UBUS_MESSAGE, (type, time) => {
      if (type === 'show-time') {
        this.curr_time = time;
      }
    });
  },
  data () {
    return {
      curr_time: 0
    };
  }
};
</script>

<style>

</style>
