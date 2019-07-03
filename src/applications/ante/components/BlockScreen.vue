<template>
    <div>
        <div v-html="'<style> html, body { position: static; overflow-y:hidden;}</style>'"></div>
        <div style="position: fixed; left: 0; top: 0; bottom: 0; right: 0; background-color: rgba(227, 242, 253, 0.5); z-index: 99999"></div>
        <v-progress-circular
                indeterminate
                :size="80"
                color="primary"
                style="margin-left: -40px; margin-top: -40px; left: 50%; top: 50%; position: fixed; z-index: 100000"
        ><span style="font-size: 10px;">Installing...</span></v-progress-circular>
    </div>
</template>

<script>

export default {
  name: 'BlockScreen',
  computed:{
  },
  methods : {
  },
  data () {
    return {
    }
  }
}
</script>

<style scoped>

</style>
