<template>
  <div class="custom_component_dialog_wrapper" v-if="showDialog">
    <div class="custom_component_dialog_container" :style="{width: dialogWidth + 'px'}">
      <div class="custom_component_dialog_title_container" v-if="showTitle">
        <div class="custom_component_dialog_title_text">
          {{titleText}}
        </div>
        <div class="custom_component_dialog_title_close_btn" @click="handleClose" v-if="showTitleClose">
          <i class="ri-close-large-line"></i>
        </div>
      </div>
      <div class="custom_component_dialog_content">
        <slot></slot>
      </div>
<!--      <div class="custom_component_dialog_footer_container">-->
<!--        <div>-->
<!--          xx-->
<!--        </div>-->
<!--      </div>-->
    </div>
  </div>
</template>
<script setup="CustomDialog">
import { defineProps, defineEmits, toRefs } from "vue";

const props = defineProps({
  dialogWidth: {
    type: Number,
    required: true
  },
  showTitle: {
    type: Boolean,
    required: false,
    default: true
  },
  titleText: {
    type: String,
    required: false,
    default: 'Tips'
  },
  showTitleClose: {
    type: Boolean,
    required: false,
    default: true
  }
})

const showDialog = defineModel()

const emit = defineEmits();

const handleClose = () => {
  emit('update:modelValue', false); // 通过事件通知父组件关闭对话框
}

</script>

<style scoped>

</style>