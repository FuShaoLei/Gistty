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
    <div class="type_container">
      <div
          :class="['type_button', (topShowData.type === 'type' && topShowData.name === 'Mine') ? 'active' : '']"
          @click="handleClickType('Mine')"
      >
        Mine
      </div>
      <div
          :class="['type_button', (topShowData.type === 'type' && topShowData.name === 'Star') ? 'active' : '']"
          @click="handleClickType('Star')"
      >
        Star
      </div>
      <div class="tag_container">
        <div class="tag_line"></div>
        <div
            :class="['tag_button standard_button', (topShowData.type === 'tag' && topShowData.name === key) ? 'active' : '']"
             v-for="key in tagDataArr.keys()" @click="handleClickTag(key)">
          <i class="ri-hashtag"></i>
          {{ key }}
        </div>
      </div>
    </div>

    <div class="list_container">
      <div class="list_container_top">
        <div class="list_button_toggle">
          <i class="ri-menu-unfold-2-line ri-xl"></i>
        </div>
        <div class="list_top_text">
          {{ topShowData.name }}
        </div>
      </div>
      <div class="list_button_plus standard_button" @click="openAddNewGistDialog">
        <i class="ri-add-line ri-xl"></i>
      </div>
      <div v-for="item in showGistData"
           :class="['list_button standard_button', currentClickItem.id === item.id ? 'active' : '']"
           @click="handleClickLeftItem(item)">
        {{ item.description }}
      </div>
    </div>

    <div class="detail_container" v-if="currentClickItem.id !== undefined">
      <div class="detail_title_container">
        <div class="detail_title">
          {{currentClickItem.description}}
        </div>

        <div class="detail_title_operate">
          <div class="text-hover" @click="handleEditGist"><i class="ri-file-edit-line ri-xl"></i></div>
          <div class="text-hover" @click="handleDeleteGist"><i class="ri-delete-bin-line ri-xl"></i></div>
        </div>
      </div>
      <div class="detail_content">
        <div v-for="file in currentClickItem.files" class="detail_item">
          <div class="detail_item_file"> {{ file.filename }} </div>
          <div class="detail_item_content"> <pre>{{file.rawContent}}</pre></div>
        </div>
      </div>
    </div>

    <GistAddOrUpdateDialog
        ref="gistAddOrUpdateDialogRef"
        :show-dialog="isOpenAddOrUpdateDialog"
        v-if="isOpenAddOrUpdateDialog"
        @close="closeAddOrUpdateDialog"
        @confirm="handleConfirmAddOrUpdateDialog"/>

    <LoginDialog :show-dialog="isShowLoginDialog"
                 v-if="isShowLoginDialog"
                @close="closeLoginDialog"
                @confirm="confirmLoginDialog"/>

    <SecondConfirmDialog
        title="Confirm Logout ?"
        :show-dialog="isShowLogoutConfirmDialog"
        v-if="isShowLogoutConfirmDialog"
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
import {CreateGist, DeleteGist, getGist, getRaw, UpdateGist} from "../api/GithubApi.js";
import {getCurrentInstance, ref} from "vue";
import GistAddOrUpdateDialog from "./GistAddOrUpdateDialog.vue";
import LoginDialog from "./LoginDialog.vue";
import {useSettingsStore} from "../stores/settingsData.js";
import SecondConfirmDialog from "./SecondConfirmDialog.vue";
const { proxy } =  getCurrentInstance()

const gistAddOrUpdateDialogRef = ref(null)

const gistDataArr = ref([]) // 我的全部数据

const showGistData = ref([]) // 实际展示的数据 有可能是 我的， 也可能是star的

const tagDataArr = ref(new Map())

const handleTagData = (arr, id) => {
  arr.forEach((item) => {
    if (!tagDataArr.value.has(item)) {
      let newSet = new Set()
      newSet.add(id)
      tagDataArr.value.set(item, newSet);
    } else {
      let currentSet = tagDataArr.value.get(item)
      currentSet.add(id)
      tagDataArr.value.set(item, currentSet);
    }
  })
}

const getGistArr = async () => {
  try {
    const res = await getGist();
    const allData = res.data;

    // 使用 Promise.all 等待所有异步操作完成
    const updatedDataPromises = allData.map(async (item) => {
      const filePromises = Object.values(item.files).map(async (objValue) => {
        const rawContent = await getContent(objValue.raw_url);
        return Object.assign(objValue, {rawContent});
      });

      // 等待所有文件的内容都获取完
      await Promise.all(filePromises);
      return item;
    });

    // 等待所有数据的更新操作完成
    const updatedData = await Promise.all(updatedDataPromises);

    updatedData.forEach(ele => {
      console.log("ele.description = " + ele.description)
      // let tags = ele.description.match(/#(\w+)/g).map(tag => tag.slice(1));
      // const text = "这里是一些文字，其中包含 #life #coding #生命 #生活";

      if (ele.description !== undefined && ele.description !== null) {

        const matchData = ele.description.match(/#([\w\u4e00-\u9fa5]+)/g);

        if(matchData !== null) {
          let tags = matchData.map(tag => tag.slice(1));

          if (tags.length > 0) {
            console.log(tags); // 输出: ["life", "coding"]
            handleTagData(tags, ele.id)
          }
        }
      }
    })

    console.log("tagDataArr.value")
    console.log(tagDataArr.value)

    gistDataArr.value = updatedData;

    // TODO 可能要处理一些东西

    showGistData.value = [...gistDataArr.value]


    if (currentClickItem.value.id !== undefined) {
      currentClickItem.value = gistDataArr.value.find(ele => ele.id === currentClickItem.value.id)
    }

  } catch (error) {
    console.error("Error fetching data:", error);
  }
};


const test_url = "https://gist.githubusercontent.com/FuShaoLei/3bc755decb52a8d81f08ed48d870cd82/raw/e0ca010f35a59c568b15b3943d35f79271eae456/activity.kt";

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

const testGetContent = async () => {
  const result = await getContent(test_url);
  console.log("testGetContent")
  console.log(result)
}

// testGetContent()

const currentClickItem = ref({})

const handleClickLeftItem = (data) => {
  console.log("handleClickLeftItem")
  console.log(data)
  currentClickItem.value = data

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
  // TODO 存储
  console.log("confirmLoginDialog")
  console.log(data)

  mSettingsStore.setLoginSettings({token: data})

  console.log("after token")

  console.log(mSettingsStore.loginData.token)

  closeLoginDialog()

  init()

}

const mSettingsStore = useSettingsStore()
const init = () => {
  // TODO 取出存储 看看是否有token
  if (mSettingsStore.loginData.token.length === 0) {
    // TODO 清除当前数据
    currentClickItem.value = {}
    gistDataArr.value = []
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


const topShowData = ref({type: "type", name: "Mine"}) // default display Mine Gist

const handleClickTag = (key) => {
  console.log("handleClickTag", key)
  topShowData.value = {type: "tag", name: key}
  // TODO 处理数据的展示

  // TODO 名称后面改成tagMap
  const idSet = tagDataArr.value.get(key)

  showGistData.value = [...gistDataArr.value].filter(ele => idSet.has(ele.id))

  currentClickItem.value = {}
}

const handleClickType = (key) => {
  topShowData.value = {type: "type", name: key}
  if (key === 'Star') {
    // TODO 请求Star的数据
  } else if (key === 'Mine') {
    // TODO 请求我的自己全部gist数据

    // TODO 这里应该重新请求一次，为了好看先用原来的数据
    showGistData.value = [...gistDataArr.value]
  }
}

init()


</script>


<style>
@import url('src/style.css');

</style>
