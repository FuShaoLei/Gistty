<template>
  <CustomDialog
      v-model="showDialog"
      title-text="Login"
      :show-title-close="false"
      :show-footer="false">
    <div class="login_container">
      <div>
        <input type="text" placeholder="scope:gist" class="custom_input" v-model="inputToken"/>
      </div>
      <div class="login_button" @click="handleLoginButton">
        <i class="ri-login-circle-line ri-xl"></i>
      </div>
    </div>
  </CustomDialog>
</template>

<script setup="LoginDialog">
import CustomDialog from "../customComponents/CustomDialog.vue";
import {ref, toRefs} from "vue";

const showDialog = defineModel()

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