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
          <div class="edit_tags_item" v-for="tag in currentEditTag">
            <div class="edit_tags_item_label">
              <i class="ri-hashtag"></i>
              {{ tag }}
            </div>
            <div class="edit_tags_item_btn text-hover" @click="handleClickRemoveTag(tag)"><i class="ri-close-line"></i></div>
          </div>
          <div class="edit_tags_plus text-hover" @click="handleClickManageTags" ref="manageTagsBtnRef">
            <i class="ri-list-check"></i>
            Select Tags
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
          <div ref="manageTagsPlusItemRef" class="manage_tags_item" v-show="isCanPlusTags" @click="handleClickPlusNewTag(tagSearchText)">
            <div>
              <i class="ri-add-line"></i>
              Create Tag {{`"${tagSearchText}"`}}
            </div>
          </div>
        </div>
        <div class="manage_tags_operate_container">
          <div @click="handleClickManageTagCancelBtn">Cancel</div>
          <div @click="handleClickManageTagConfirmBtn">Confirm</div>
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
import {computed, inject, onMounted, onBeforeUnmount, ref, nextTick} from "vue";
import { marked } from 'marked';
import {parseTag, removeTags} from "../utils/GistUtils.js";

const tagMap = inject('tagMap', undefined)

const tagMapArr = ref([])

const props = defineProps({
  showDialog: {
    type: Boolean,
    required: true
  }
})
const emit = defineEmits(['close', 'confirm'])


const manageTagsPlusItemRef = ref(null)
const manageTagsBtnRef = ref(null)
const manageTagsPopupContainerRef = ref(null)


const isCanPlusTags = ref(false)
const tagSearchText = ref("")

const manageTagMap = computed(() => {
  if (tagMapArr.value !== undefined && tagSearchText.value.length > 0) {
    let returnTag = [...tagMapArr.value]

    // tagMap.forEach((val, key)=>{
    //   if (key.includes(tagSearchText.value)) {
    //     returnTag.set(key, val)
    //   }
    // })

    console.log("tagMapArr")
    console.log(tagMapArr.value)

    const fuck = [...tagMapArr.value]

    console.log("fuck")
    console.log(fuck)

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
    return [...tagMapArr.value]
  }
})

const isMarkDownPreview = ref(false)

const closeDialog = () => emit('close')

const currentEditTag = ref([])
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

  Object.assign(tmpData, {
    description: currentEditData.value.description + ' ' + currentEditTag.value.map(item =>  `#${item}`).join(' '),
    files: requestFiles
  })

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


  if (tagMap !== undefined) {
    tagMapArr.value = [...tagMap]
  }

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
      description: removeTags(data.description),
      originDescription: data.description,
      files: Object.entries(data.files).map(([filename, fileData]) => ({
        filename,
        content: fileData.rawContent
      }))
    })

    currentEditTag.value = [...parseTag(data.description)]
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


  // TODO 初始化selectTag
  if (currentEditTag.value.length > 0) {
    selectTag.value = new Set()
    currentEditTag.value.forEach((tag) => {
      selectTag.value.add(tag)
    })
  } else {
    selectTag.value = new Set()
  }

}

const selectTag = ref(new Set())


const handleClickPlusNewTag = (newTag) => {
  tagMapArr.value.push([newTag, []])
  handleClickSelectTag(newTag)
}

const handleClickSelectTag = (tag) => {

  if (selectTag.value.has(tag)) {
    selectTag.value.delete(tag)
  } else {
    selectTag.value.add(tag)
  }

  tagSearchText.value = ""
}


const handleClickManageTagCancelBtn = () => {
  manageTagsPopupContainerRef.value.style.display = "none"
}

const handleClickManageTagConfirmBtn = () => {
  currentEditTag.value = [...selectTag.value]
  selectTag.value = new Set()
  handleClickManageTagCancelBtn()
}

const handleClickOutside = async (event) => {
  await nextTick();


  if (manageTagsPopupContainerRef.value && !manageTagsPopupContainerRef.value.contains(event.target) && !manageTagsBtnRef.value.contains(event.target)) {
    handleClickManageTagCancelBtn()
  }
};


onMounted(async () => {
  await nextTick(); // 确保 DOM 已完成更新
  window.addEventListener("click", handleClickOutside);
});


onBeforeUnmount(async ()=>{
  await nextTick(); // 确保 DOM 已完成更新
  window.removeEventListener("click", handleClickOutside);
})


const handleClickRemoveTag = (removeTag) => {
  currentEditTag.value = currentEditTag.value.filter(item=> item !== removeTag)
}

defineExpose({init})

</script>
<style scoped>
@import url('src/CustomDialog.css');
@import url('src/style.css');


</style>