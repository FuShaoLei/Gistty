<template>
  <div class="custom_dialog_wrapper">
    <div class="edit_container">
      <div class="edit_title">
        <div class="edit_title_label">DESCRIPTION</div>
        <div class="edit_title_input">
          <input type="text" placeholder="Gist description" class="custom_input " v-model="currentEditData.description"/>
        </div>
      </div>

      <div class="edit_tags_container">
        <div class="edit_tags_groups_label">TAGS</div>
        <div class="edit_tags_groups">
          <div class="edit_tags_item">
            <div class="edit_tags_item_label">life</div>
            <div class="edit_tags_item_btn text-hover"><i class="ri-close-line"></i></div>
          </div>
          <div class="edit_tags_plus text-hover" @click="handleClickManageTags" ref="manageTagsBtnRef">
            <i class="ri-add-line"></i>
            manage tags
          </div>
        </div>
      </div>

      <div class="manage_tags_popup_container" ref="manageTagsPopupContainerRef">
        <div class="manage_tags_search_container">
          <input type="text" placeholder="Search Tag" class="custom_input " v-model="tagSearchText"/>
        </div>
        <div class="manage_tags_group">
          <div :class="['manage_tags_item', selectTag.has(value[0]) ? 'active': '']"
               v-for="value in manageTagMap" @click="handleClickSelectTag(value[0])">
            <div>
              <i class="ri-hashtag"></i>
              {{value[0]}}
            </div>
              <div v-if="selectTag.has(value[0])">
                <i class="ri-check-line"></i>
              </div>
          </div>
          <div class="manage_tags_item" v-if="isCanPlusTags" @click="handleClickPlusNewTag(tagSearchText)">
            <div>
              <i class="ri-add-line"></i>
              Create Tag {{`"${tagSearchText}"`}}
            </div>
          </div>
        </div>
        <div class="manage_tags_operate_container">
          <div>Cancel</div>
          <div>Confirm</div>
        </div>

      </div>

      <div class="files_group_label">FILES</div>
      <div class="edit_item" v-for="(item, index) in currentEditData.files" :key="index">
        <div class="edit_item_filename">
          <input type="text" placeholder="Filename including extension" class="custom_input" v-model="currentEditData.files[index].filename"/>
          <div v-if="(currentEditData.files[index].filename !== null && currentEditData.files[index].filename.endsWith('.md'))"
               class="preview_btn text-hover" @click="handleClickPreview">
            <i :class="['ri-xl', isMarkDownPreview ? 'ri-eye-off-line':'ri-eye-line']"></i>
          </div>
          <div class="filename_close_btn text-hover" v-if="currentEditData.files.length > 1" @click="removeFile(index)"><i class="ri-close-line ri-xl"></i></div>
        </div>
        <div class="edit_item_content" v-if="(currentEditData.files[index].filename !== null && (!currentEditData.files[index].filename.endsWith('.md') || currentEditData.files[index].filename.endsWith('.md') && !isMarkDownPreview))">
          <textarea ref="mContentRef" id="message" name="message" rows="20" cols="50" placeholder="input here " class="custom_textarea"
                    v-model="currentEditData.files[index].content"></textarea>
        </div>
        <div class="markdown-body" v-if="(isMarkDownPreview && currentEditData.files[index].content !== null)"
             v-html="marked.parse(currentEditData.files[index].content)">
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
import {computed, inject, ref} from "vue";
import { marked } from 'marked';

const tagMap = inject('tagMap', undefined)


const props = defineProps({
  showDialog: {
    type: Boolean,
    required: true
  }
})
const emit = defineEmits(['close', 'confirm'])

const manageTagsBtnRef = ref(null)
const manageTagsPopupContainerRef = ref(null)

const isCanPlusTags = ref(false)

const tagSearchText = ref("")

const manageTagMap = computed(() => {
  if (tagMap !== undefined && tagSearchText.value.length > 0) {
    let returnTag = [...tagMap]

    // tagMap.forEach((val, key)=>{
    //   if (key.includes(tagSearchText.value)) {
    //     returnTag.set(key, val)
    //   }
    // })

    returnTag = returnTag.filter(value => value[0].includes(tagSearchText.value))

    // 如果搜索的标签不在里面，那么就有一个是否新增标签
    if(returnTag.length === 0 || returnTag.filter(value => value[0] === tagSearchText.value).length === 0) {
      isCanPlusTags.value = true
      // returnTag.push([`Create Tag "${tagSearchText.value}"`, []])
    } else {
      isCanPlusTags.value = false
    }

    return returnTag
  } else {
    isCanPlusTags.value = false
    return [...tagMap]
  }
})

const isMarkDownPreview = ref(false)

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

const mContentRef = ref([])

const init = (data = undefined) => {
  if (data === undefined) {
    const now = new Date();

  // 格式化日期
    const formattedDate = now.getFullYear() + '-' +
        String(now.getMonth() + 1).padStart(2, '0') + '-' +
        String(now.getDate()).padStart(2, '0') + ' ' +
        String(now.getHours()).padStart(2, '0') + ':' +
        String(now.getMinutes()).padStart(2, '0') + ':' +
        String(now.getSeconds()).padStart(2, '0');

    console.log(formattedDate);

    currentEditData.value.description = formattedDate;
    currentEditData.value.files = [{content: "",  filename: "README.md"}]

    setTimeout(()=>{
      mContentRef.value[0].focus();
    }, 200)


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

const handleClickPreview  = () => {
  isMarkDownPreview.value = !isMarkDownPreview.value
}

const handleClickManageTags = () => {
  const rect = manageTagsBtnRef.value.getBoundingClientRect();
  console.log(rect)
  manageTagsPopupContainerRef.value.style.top = rect.top + window.scrollY + "px"
  manageTagsPopupContainerRef.value.style.left = rect.right + window.scrollX + 5 + "px"
  manageTagsPopupContainerRef.value.style.display = "block"
}

const initText = () => {
  // let returnTag = new Map()
  //
  // console.log("tagMap")
  // console.log(tagMap)
  //
  // console.log("returnTag")
  // console.log(returnTag)
  //
  // tagMap.forEach((val, key)=>{
  //   console.log(`${key}: ${val}`)
  //
  //   if (key.includes("c")) {
  //     returnTag.set(key, val)
  //   }
  // })

  const arr = [...tagMap]
  console.log("arr", arr)
}



// initText()

const selectTag = ref(new Set())

const handleClickSelectTag = (tag) => {

  if (selectTag.value.has(tag)) {
    selectTag.value.delete(tag)
  } else  {
    selectTag.value.add(tag)
  }

  tagSearchText.value = ""

}

const handleClickPlusNewTag = (newTag) => {


}

defineExpose({init})

</script>
<style scoped>
@import url('src/CustomDialog.css');
@import url('src/style.css');


</style>