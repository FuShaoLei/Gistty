<template>
  <div class="custom_dialog_wrapper">
    <div class="confirm_container">
      <div>{{ title }}</div>
      <div class="confirm_operate">
        <div @click="handleCancel">Cancel</div>
        <div @click="handleConfirm">Confirm</div>
      </div>
    </div>

  </div>
</template>
<script setup="SecondConfirmDialog">
const props = defineProps({
  showDialog: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['close', 'confirm'])

const handleCancel = () => {
  emit('close')
}

const handleConfirm = () =>{
  emit('confirm')
}

</script>
<style scoped>
@import url('src/CustomDialog.css');
@import url('src/style.css');

</style>