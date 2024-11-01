<template>
  <CustomDialog v-model="showDialog" :title-text="title" @confirm="handleConfirm">
  </CustomDialog>
</template>
<script setup="SecondConfirmDialog">
import CustomDialog from "../customComponents/CustomDialog.vue";
const props = defineProps({
  title: {
    type: String,
    required: true
  }
})

const showDialog = defineModel()

const emit = defineEmits(['close', 'confirm'])

const handleCancel = () => {
  emit('close')
}

const handleConfirm = () =>{
  emit('confirm')
}

</script>