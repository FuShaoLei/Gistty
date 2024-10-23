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

      <div class="tool_button" @click="handleLogout">
        <i class="ri-logout-circle-line ri-2x"></i>
      </div>
    </div>
    <div class="type_container">
      <div class="type_button">
        Mine
      </div>
      <div class="type_button">
        Star
      </div>
      <div class="tag_container">
        <div class="tag_line"></div>
        <div class="tag_button standard_button">
          <i class="ri-hashtag"></i>
          日常
        </div>
        <div class="tag_button standard_button">
          <i class="ri-hashtag"></i>
          备忘
        </div>
        <div class="tag_button standard_button">
          <i class="ri-hashtag"></i>
          技巧
        </div>
        <div class="tag_button standard_button">
          <i class="ri-hashtag"></i>
          工作
        </div>
      </div>
    </div>

    <div class="list_container">
      <div class="list_button_plus standard_button" @click="openAddNewGistDialog">
        <i class="ri-add-line ri-xl"></i>
      </div>
      <div v-for="item in gistDataArr"
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
          <div class="text-hover"><i class="ri-delete-bin-line ri-xl"></i></div>
        </div>
      </div>
      <div class="detail_content">
        <div v-for="file in currentClickItem.files" class="detail_item">
          <div class="detail_item_file"> {{ file.filename }} </div>
          <div class="detail_item_content"> <pre>{{file.rawContent}}</pre> </div>
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

  </div>


</template>
<script setup="GistTest">
import {CreateGist, getGist, getRaw, UpdateGist} from "../api/GithubApi.js";
import {getCurrentInstance, ref} from "vue";
import {RefreshRight, Plus } from '@element-plus/icons-vue'
import GistAddOrUpdateDialog from "./GistAddOrUpdateDialog.vue";
import LoginDialog from "./LoginDialog.vue";
import {useSettingsStore} from "../stores/settingsData.js";
const { proxy } =  getCurrentInstance()

const gistAddOrUpdateDialogRef = ref(null)

const gistDataArr = ref([])


const getGistArrBak = async () => {
  getGist().then((res) => {

    const allData = res.data

    allData.forEach((item) => {
      console.log("-----")
      Object.values(item.files).forEach(async objValue => {
        const rawContent = await getContent(objValue.raw_url)

        Object.assign(objValue, {rawContent: rawContent})

      });
    })

    console.log("allData")
    console.log(allData)
    // gistDataArr.value = res.data
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
    gistDataArr.value = updatedData;

    if (currentClickItem.value.id !== undefined) {
      currentClickItem.value = gistDataArr.value.find(ele => ele.id === currentClickItem.value.id)
    }

    console.log("allData", updatedData);
    // gistDataArr.value = updatedData;
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
    openLoginDialog()
  } else {
    getGistArr()
  }

}

const handleLogout = () => {
  mSettingsStore.setLoginSettings({token: ""})
  init()
}

init()


</script>


<style>
@import url('src/style.css');

</style>
