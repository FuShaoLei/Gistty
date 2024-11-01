<template>
  <div class="main_container">
    <div class="tool_container">
      <div class="tool_button" @click="refreshData">
        <i class="ri-refresh-line ri-2x"></i>
      </div>

      <div class="tool_button">
        <i class="ri-settings-line ri-2x"></i>
      </div>

      <div class="tool_button">
        <i class="ri-question-line ri-2x"></i>
      </div>

      <div class="tool_button" @click="openLogoutConfirmDialog">
        <i class="ri-logout-circle-line ri-2x"></i>
      </div>
    </div>
    <div :class="['type_container', isToggle ? 'type_gone':'']">
      <div
          :class="['type_button standard_button', (topShowData.type === 'type' && topShowData.name === 'All Snippets') ? 'active' : '']"
          @click="handleClickType('All Snippets')"
      >
        <i class="ri-user-line"></i>
        All Snippets
      </div>
      <div
          :class="['type_button standard_button', (topShowData.type === 'type' && topShowData.name === 'Starred') ? 'active' : '']"
          @click="handleClickType('Starred')"
      >
        <i class="ri-star-line"></i>
        Starred
      </div>
      <div class="tag_container">
        <div class="tag_line"></div>
        <div
            :class="['tag_button standard_button', (topShowData.type === 'tag' && topShowData.name === value[0]) ? 'active' : '']"
             v-for="(value, key) in tagMap" @click="handleClickTag(value[0])" :key="key">
          <div>
            <i class="ri-hashtag"></i>
            {{value[0]}}
          </div>
          <div>
            {{value[1].size}}
          </div>
        </div>
      </div>
    </div>

    <div :class="['list_container', isToggle ? 'type_gone':'']">
      <div class="list_top_group">
        <div class="list_container_top">
          <div class="list_button_toggle" @click="handleToggle">
            <i
                :class="['ri-xl', isToggle ? 'ri-menu-fold-2-line ':'ri-menu-unfold-2-line ']"
            />
          </div>
          <div class="list_top_text">
            {{ topShowData.name }}
          </div>
        </div>
        <div class="list_button_plus" @click="openAddNewGistDialog" v-if="!(topShowData.type === 'type' && topShowData.name === 'Starred')">
          <i class="ri-file-add-fill ri-xl"></i>
          New
        </div>
      </div>


      <div v-for="item in showGistData"
           :class="['list_button standard_button', currentClickItem.id === item.id ? 'active' : '']"
           @click="handleClickLeftItem(item)">
        {{ item.showDescription === undefined ? item.description : item.showDescription}}
      </div>
    </div>

    <div :class="['detail_container', isToggle ? 'type_gone':'']" v-show="currentClickItem.id !== undefined" ref="detailContainerRef">
      <div class="detail_title_container">
        <div class="detail_title_description_group">
          <div class="detail_title">
            {{ currentClickItem.showDescription === undefined ? currentClickItem.description : currentClickItem.showDescription}}
          </div>
          <div class="detail_title_operate">
            <div v-if="!(topShowData.type === 'type' && topShowData.name === 'Star')" class="text-hover" @click="handleEditGist"><i class="ri-file-edit-line ri-xl"></i></div>
<!--            <div v-if="!(topShowData.type === 'type' && topShowData.name === 'Star')" class="text-hover" @click="handleDeleteGist"><i class="ri-delete-bin-line ri-xl"></i></div>-->
          </div>
        </div>

        <div class="detail_title_info_group" v-if="currentClickItem.showTags !== undefined && currentClickItem.showTags.length > 0">
          <div class="detail_info_tag_group" >
            <div v-for="tag in currentClickItem.showTags" @click="handleClickTag(tag)">
              <i class="ri-hashtag"></i>
              {{tag}}
            </div>
          </div>
        </div>

      </div>
      <div class="detail_content">
        <div v-for="file in currentClickItem.files" class="detail_item">
          <div class="detail_item_filename_wrapper">
            <div>
              {{ file.filename }}
            </div>
             <div class="detail_item_operate">
               <div class="text-hover" @click="handleClickCopy(file.rawContent)"><i class="ri-file-copy-line ri-xl"></i></div>
             </div>
          </div>
          <div class="detail_item_content"><pre v-if="file.language !== 'Markdown'">{{ file.rawContent}}</pre>
            <div class="markdown-body" v-else-if="file.rawContent !==undefined " v-html="marked.parse(file.rawContent)">
            </div>
          </div>
        </div>
      </div>
    </div>

    <GistAddOrUpdateDialog
        ref="gistAddOrUpdateDialogRef"
        v-model="isOpenAddOrUpdateDialog"
        @close="closeAddOrUpdateDialog"
        @confirm="handleConfirmAddOrUpdateDialog"/>

    <LoginDialog v-model="isShowLoginDialog"
                @close="closeLoginDialog"
                @confirm="confirmLoginDialog"/>

    <SecondConfirmDialog
        title="Confirm Logout ?"
        v-model="isShowLogoutConfirmDialog"
        @close="closeLogoutConfirmDialog"
        @confirm="confirmLogoutConfirmDialog"/>

    <SecondConfirmDialog
        title="Confirm Delete ?"
        :show-dialog="isShowDeleteConfirmDialog"
        v-if="isShowDeleteConfirmDialog"
        @close="closeDeleteConfirmDialog"
        @confirm="confirmDeleteConfirmDialog"/>


  </div>


</template>
<script setup="GistTest">
import {CreateGist, DeleteGist, getGist, getRaw, getStarGist, UpdateGist} from "../api/GithubApi.js";
import {getCurrentInstance, provide, ref} from "vue";
import GistAddOrUpdateDialog from "./GistAddOrUpdateDialog.vue";
import LoginDialog from "./LoginDialog.vue";
import {useSettingsStore} from "../stores/settingsData.js";
import SecondConfirmDialog from "./SecondConfirmDialog.vue";
const { proxy } =  getCurrentInstance()
import { marked } from 'marked';
import {parseTag, removeTags} from "../utils/GistUtils.js";

const detailContainerRef = ref(null)
const gistAddOrUpdateDialogRef = ref(null)

const allGistData = ref([])
const allStarGistData = ref([])
const showGistData = ref([])


const tagMap = ref(new Map())

const handleTagData = (arr, id) => {
  if (arr === undefined || arr.length === 0) {
    return
  }
  arr.forEach((item) => {
    if (!tagMap.value.has(item)) {
      let newSet = new Set()
      newSet.add(id)
      tagMap.value.set(item, newSet);
    } else {
      let currentSet = tagMap.value.get(item)
      currentSet.add(id)
      tagMap.value.set(item, currentSet);
    }
  })
}

provide('tagMap', tagMap.value)

const getStarGistArr = async () => {
  try {
    const res = await getStarGist();
    const newAllStarData = res.data;

    allStarGistData.value = [...newAllStarData]
    showGistData.value = [...allStarGistData.value]

    if (currentClickItem.value.id !== undefined) {
      currentClickItem.value = allGistData.value.find(ele => ele.id === currentClickItem.value.id)
    }

  } catch (error) {
    console.error("Error fetching data:", error);
  }
};


const getGistArr = async () => {
  try {
    const res = await getGist();
    const newAllData = res.data;

    const updatedDataPromises = newAllData.map(async (item) => {
      const filePromises = Object.values(item.files).map(async (objValue) => {
        const rawContent = await getContent(objValue.raw_url);
        return Object.assign(objValue, {rawContent});
      });

      // 等待所有文件的内容都获取完
      await Promise.all(filePromises);
      return item;
    });

    // 等待所有数据的更新操作完成
    const latestData = await Promise.all(updatedDataPromises);

    latestData.forEach(ele => {
      // 处理description和tag
      ele.showDescription = removeTags(ele.description)

      // 处理tag
      const tmpTags = parseTag(ele.description)
      handleTagData(tmpTags, ele.id)

      ele.showTags = tmpTags


    })

    allGistData.value = [...newAllData]
    // TODO 可能要处理一些东西

    if (topShowData.value.type === 'tag') {
      handleClickTag(topShowData.value.name)
    } else {
      showGistData.value = [...allGistData.value]
    }



    if (currentClickItem.value.id !== undefined) {
      currentClickItem.value = allGistData.value.find(ele => ele.id === currentClickItem.value.id)
    }

  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

const handleGetRawContentData = async (item) => {

    const filePromises = Object.values(item.files).map(async (objValue) => {
      const rawContent = await getContent(objValue.raw_url);
      return Object.assign(objValue, {rawContent});
    });

    // 等待所有文件的内容都获取完
    await Promise.all(filePromises);

    return item;
}


const getContent = async (url) => {
  let result = null
  try {
    const res = await getRaw(url); // 等待 getRaw 的结果
    // console.log("getRaw");
    // console.log(res.data);
    result = res.data;
  } catch (error) {
    console.error("Error fetching content:", error); // 处理可能的错误
  }
  return result
};

const currentClickItem = ref({})

const handleClickLeftItem = async (data) => {
  console.log("handleClickLeftItem")
  console.log(data)
  currentClickItem.value = data

  // TODO 此处有bug
  if (data.rawContent === undefined) {
    currentClickItem.value = await handleGetRawContentData(data)
  }

  detailContainerRef.value.scrollIntoView({ block: 'start' });
}

const isOpenAddOrUpdateDialog = ref(false)

const openAddNewGistDialog = () => {
  isOpenAddOrUpdateDialog.value = true
  proxy.$nextTick(() => {
    gistAddOrUpdateDialogRef.value.init()
  })
}

const closeAddOrUpdateDialog = () => {
  isOpenAddOrUpdateDialog.value = false
}

const handleConfirmAddOrUpdateDialog = (data) => {
  console.log("handleConfirmAddOrUpdateDialog")
  console.log(data)

  if (data.gist_id !== undefined) {
    console.log("data.gist_id !== undefined")

    UpdateGist(data).then(res => {
      console.log("updateGist")
      console.log(res)
      handleRes(res)
    })
  } else {
    console.log("data.gist_id === undefined")
    CreateGist(data).then(res => {
      console.log(res)
      handleRes(res)
    })
  }

}

const handleRes = (res) => {
  if (res.status === 201 || res.status === 200) {
    closeAddOrUpdateDialog()
    getGistArr()
    // TODO 提示成功

  } else {
    // TODO 提示错误
  }
}

const handleEditGist = () => {
  isOpenAddOrUpdateDialog.value = true
  proxy.$nextTick(() => {
    gistAddOrUpdateDialogRef.value.init({...currentClickItem.value})
  })
}

const refreshData = () => {
  getGistArr()
}


const isShowLoginDialog = ref(false)

const closeLoginDialog = () => {
  isShowLoginDialog.value = false
}

const openLoginDialog = () => {
  isShowLoginDialog.value = true
}

const confirmLoginDialog = (data) => {
  mSettingsStore.setLoginSettings({token: data})
  closeLoginDialog()
  init()
}

const mSettingsStore = useSettingsStore()
const init = () => {
  if (mSettingsStore.loginData.token.length === 0) {
    currentClickItem.value = {}
    allGistData.value = []
    openLoginDialog()
  } else {
    getGistArr()
  }
}

const isShowDeleteConfirmDialog = ref(false)

const openDeleteConfirmDialog = () => {
  isShowDeleteConfirmDialog.value = true
}

const closeDeleteConfirmDialog = () => {
  isShowDeleteConfirmDialog.value = false
}

const confirmDeleteConfirmDialog = () => {
  DeleteGist(currentClickItem.value).then(res=>{
    if (res.status === 204) {
      currentClickItem.value = {}
      closeDeleteConfirmDialog()
      init()
    }
  })
}

const isShowLogoutConfirmDialog = ref(false)

const openLogoutConfirmDialog = () => {
  isShowLogoutConfirmDialog.value = true
}

const closeLogoutConfirmDialog = () => {
  isShowLogoutConfirmDialog.value = false
}

const confirmLogoutConfirmDialog = () => {
  mSettingsStore.setLoginSettings({token: ""})
  closeLogoutConfirmDialog()
  init()
}

const handleDeleteGist = () => {
  openDeleteConfirmDialog()
}


const topShowData = ref({type: "type", name: "All Snippets"}) // default display All Snippets Gist

const handleClickTag = (key) => {
  console.log("handleClickTag", key)

  if (topShowData.value.type === "tag" && topShowData.value.name === key) {
    return
  }

  topShowData.value = {type: "tag", name: key}
  // TODO 处理数据的展示

  // TODO 名称后面改成tagMap
  const idSet = tagMap.value.get(key)

  showGistData.value = [...allGistData.value].filter(ele => idSet.has(ele.id))

  currentClickItem.value = {}
}

const handleClickType = (key) => {
  topShowData.value = {type: "type", name: key}
  if (key === 'Starred') {

    showGistData.value = []

    // TODO 请求Star的数据
    if (allStarGistData.value.length === 0) {
      getStarGistArr()
    } else {
      showGistData.value = [...allStarGistData.value]
    }

    currentClickItem.value = {}

  } else if (key === 'All Snippets') {
    // TODO 请求我的自己全部gist数据

    // TODO 这里应该重新请求一次，为了好看先用原来的数据
    showGistData.value = [...allGistData.value]
  }
}

const isToggle = ref(false)

const handleToggle = () => {
   isToggle.value = !isToggle.value
}

const handleClickCopy = (text) => {
  navigator.clipboard.writeText(text)
  // TODO 提示复制成功
}

init()


</script>
