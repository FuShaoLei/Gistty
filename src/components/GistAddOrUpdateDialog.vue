<template>
  <div class="custom_dialog_wrapper">
    <div class="edit_container">
      <div class="edit_title">
        <input type="text" placeholder="Gist description" class="custom_input" v-model="currentData.description"/>
      </div>

      <div class="edit_item" v-for="(item, index) in currentData.files" :key="index">
        <div class="edit_item_filename">
          <input type="text" placeholder="Filename including extension" class="custom_input" v-model="currentData.files[index].filename"/>
        </div>
        <div class="edit_item_content">
          <textarea id="message" name="message" rows="4" cols="50" placeholder="input here " class="custom_textarea" v-model="currentData.files[index].content"></textarea>
        </div>
      </div>

      <div class="add_file_wrapper">
        <div class="add_file_button custom_button">
          <i class="ri-add-line"></i>
          Add File
        </div>

        <div>
          <div class="custom_button cancel_button" @click="closeDialog">
            <i class="ri-close-line"></i>
            Cancel
          </div>
          <div class="custom_button" @click="saveGist">
            <i class="ri-save-line"></i>
            Create Gist
          </div>
        </div>
      </div>
    </div>
  </div>

</template>

<script setup="GistAddOrUpdateDialog">
import 'remixicon/fonts/remixicon.css'
import {ref} from "vue";
const props = defineProps({
  showDialog: {
    type: Boolean,
    required: true
  }
})
const emit = defineEmits(['close', 'confirm'])

const closeDialog = () => emit('close')

const currentData = ref({
  files: [
    {
      content: "",
      filename: ""
    }
  ]

})

const saveGist = () => {
  // TODO 检查合法性
  console.log("saveGist")
  console.log(currentData.value)

  const tmpData = {...currentData.value}

  const requestFiles = tmpData.files.reduce((acc, item) => {
    acc[item.filename] = {...item};
    return acc;
  }, {});

  console.log("requestFiles", requestFiles);

  Object.assign(tmpData, {files: requestFiles}, {public: false})

  console.log("after")
  console.log(tmpData)

  emit('confirm', tmpData)

}

</script>
<style scoped>
@import url('src/CustomDialog.css');
@import url('src/style.css');


</style>