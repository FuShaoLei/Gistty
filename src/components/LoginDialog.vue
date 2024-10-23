<template>
  <div class="custom_dialog_wrapper">
    <div class="login_container">
      <div>
        <input type="text" placeholder="Input Token" class="custom_input" v-model="inputToken"/>
      </div>
      <div class="login_button" @click="handleLoginButton">
        <i class="ri-login-circle-line ri-xl"></i>
      </div>
    </div>
  </div>
</template>

<script setup="LoginDialog">
import {ref} from "vue";
const props = defineProps({
  showDialog: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['close', 'confirm'])

const inputToken = ref("")

const handleLoginButton = () => {
  console.log("handleLoginButton")

  if (inputToken.value.length > 0) {
    emit('confirm', inputToken.value)
  } else {
    // TODO 提示错误信息
  }
}

</script>

<style scoped>
@import url('src/CustomDialog.css');
@import url('src/style.css');

</style>