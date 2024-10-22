<template>
  <el-dialog
      width="800px"
      :model-value="showDialog"
      :before-close="closeDialog">
    <div>
      xxx 无敌
    </div>

  </el-dialog>

</template>

<script setup="GistAddOrUpdateDialog">
const props = defineProps({
  showDialog: {
    type: Boolean,
    required: true
  }
})
const emit = defineEmits(['close', 'confirm'])

const closeDialog = () => emit('close')


</script>
<style scoped>

</style>