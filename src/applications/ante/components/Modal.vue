<template>
    <transition name="modal">
        <div>
            <div v-html="'<style> html, body { position: static; overflow-y:hidden;}</style>'"></div>
            <div class="mask"></div>
            <div class="modal-form">
                <v-card style="width: 100%">
                    <v-card-title primary-title>
                        <slot name="title"></slot>
                        <slot name="body"></slot>
                    </v-card-title>
                    <v-card-actions style="position: absolute; bottom: 0; right: 0;">
                        <slot name="actions"></slot>
                    </v-card-actions>
                </v-card>
            </div>
        </div>
    </transition>
</template>

<script>

export default {
  name: 'Settings',
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

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
    .mask {
        position: fixed;
        left: 0;
        right: 0;
        bottom: 0;
        top: 0;
        background-color: rgba(0, 0, 0, 0.25);
        z-index: 10000;
        transition: opacity .3s ease;
    }
    .modal-form {
        position: fixed;
        width: 600px;
        left: 50%;
        margin-left: -300px;
        z-index: 10000;
        border-radius: 4px;
        height: auto;
        min-height: 200px;
        top: 110px;
        display: flex;
        transition: all .3s ease;
        -webkit-box-shadow: 0 3px 1px -2px rgba(0,0,0,.2), 0 2px 2px 0 rgba(0,0,0,.14), 0 1px 5px 0 rgba(0,0,0,.12);
        box-shadow: 0 3px 1px -2px rgba(0,0,0,.2), 0 2px 2px 0 rgba(0,0,0,.14), 0 1px 5px 0 rgba(0,0,0,.12);
    }

    @media (max-width: 599px) {

        .modal-form {
            left: 0;
            top: 0;
            right: 0;
            bottom: 0;
            margin-left: 0;
            width: auto;
        }

    }

    .modal-enter .modal-form,
    .modal-leave-active .modal-form {
        -webkit-transform: scale(0.2);
        transform: scale(0.2);
        opacity: 0;
    }

</style>
