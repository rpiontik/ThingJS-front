<template>
</template>

<script>
    export default {

        props :{
            float: {
                type: Boolean,
                default: false
            },
            hideActions: {
                type: Boolean,
                default: false
            },
            lazyValidation: {
                type: Boolean,
                default: true
            }
        },
        watch :{
            is_valid(value){
                this.$emit('input', value);
            }
        }
    }
</script>
