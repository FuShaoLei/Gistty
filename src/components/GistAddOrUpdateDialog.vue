<template>
  <div class="custom_dialog_wrapper">
    <div class="edit_container">
      <div class="edit_title">
        <input type="text" placeholder="Gist description" class="custom_input" v-model="currentEditData.description"/>
      </div>

      <div class="edit_item" v-for="(item, index) in currentEditData.files" :key="index">
        <div class="edit_item_filename">
          <input type="text" placeholder="Filename including extension" class="custom_input" v-model="currentEditData.files[index].filename"/>
          <div class="filename_close_btn text-hover" v-if="currentEditData.files.length > 1" @click="removeFile(index)"><i class="ri-close-line ri-xl"></i></div>
        </div>
        <div class="edit_item_content">
          <textarea id="message" name="message" rows="4" cols="50" placeholder="input here " class="custom_textarea" v-model="currentEditData.files[index].content"></textarea>
        </div>
      </div>

      <div class="add_file_wrapper">
        <div class="add_file_button custom_button" @click="handleAddFile">
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
            Save Gist
          </div>
        </div>
      </div>
    </div>
  </div>

</template>

<script setup="GistAddOrUpdateDialog">
import {ref} from "vue";
const props = defineProps({
  showDialog: {
    type: Boolean,
    required: true
  }
})
const emit = defineEmits(['close', 'confirm'])

const closeDialog = () => emit('close')

const currentEditData = ref({
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
  console.log(currentEditData.value)

  const tmpData = {...currentEditData.value}
  const requestFiles = tmpData.files.reduce((acc, item) => {
    acc[item.filename] = {content: item.content};
    return acc;
  }, {});

  console.log("requestFiles", requestFiles);

  Object.assign(tmpData, {files: requestFiles})

  if (tmpData.gist_id === undefined) {
    Object.assign(tmpData, {public: false})
  }

  console.log("after")
  console.log(tmpData)

  emit('confirm', tmpData)

}

const handleAddFile = () => {
  console.log("handleAddFile")
  currentEditData.value.files.push({ content: "", filename: "" })
}

const removeFile = (removeIndex) => {
  currentEditData.value.files = currentEditData.value.files.filter((value, index)=> {
    return index !== removeIndex
  })
}

const init = (data = undefined) => {
  if (data === undefined) {

  } else {
    currentEditData.value = Object.assign({}, {
      gist_id: data.id,
      description: data.description,
      files: Object.entries(data.files).map(([filename, fileData]) => ({
        filename,
        content: fileData.rawContent
      }))
    })
  }
}

defineExpose({init})

</script>
<style scoped>
@import url('src/CustomDialog.css');
@import url('src/style.css');


</style>