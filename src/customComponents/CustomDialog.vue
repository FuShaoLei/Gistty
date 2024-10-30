<template>
  <div class="custom_component_dialog_wrapper">
    <div class="custom_component_dialog_container" :style="{width: dialogWidth + 'px'}">
      <div class="custom_component_dialog_content">
        <slot></slot>
      </div>
    </div>
  </div>
</template>
<script setup="CustomDialog">
const props = defineProps({
  dialogWidth: {
    type: Number,
    required: true
  }
})

</script>

<style scoped>

</style>