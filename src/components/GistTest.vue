<template>

  <div class="main_container">
    <div class="tool_container">
      <div class="tool_wrapper_container">
        <div>
          <el-button :icon="Plus" plain class="tool_item"></el-button>
        </div>
        <div>
          <el-button :icon="RefreshRight" plain class="tool_item"></el-button>
        </div>

      </div>

    </div>
    <div class="left_container">
      <div class="left_wrapper_container">
        <div v-for="item in gistDataArr"
             :class="['left_item', currentClickItem.id === item.id ? 'active_item' : '']"
             @click="handleClickLeftItem(item)">{{ item.description }}
        </div>
      </div>

    </div>
    <div class="right_container">
      <div v-for="file in currentClickItem.files">
        <div style="margin-bottom: 8px">
          <el-text type="info" >{{ file.filename }}</el-text>
        </div>

        <el-input
            v-model="file.rawContent"
            autosize
            type="textarea">
        </el-input>
      </div>
    </div>

  </div>

</template>
<script setup="GistTest">
import {getGist, getRaw} from "../api/GithubApi.js";
import {ref} from "vue";
import {RefreshRight, Plus } from '@element-plus/icons-vue'


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

getGistArr()


</script>


<style>
* {
  margin: 0;
  padding: 0;


}

.main_container {
  display: flex;

}

.tool_container {
  flex-basis: 50px;
  border-right: 1px solid #f3f4f5;
}
.tool_wrapper_container {
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;

  position: sticky;
  top: 0;
}

.tool_item {
  margin-top: 10px;
}

.left_container {
  min-height: 100vh;
  height: auto;
  width: 250px;
  border-right: 1px solid #f3f4f5;
}
.left_wrapper_container {
  position: sticky;
  top: 0;
}

.left_item {
  cursor: pointer;
  padding: 10px;
  border-bottom: 1px solid #f3f4f5;
}

.left_item.active_item {
  background: #f3f4f5;
}

.left_item:hover {
  background: #f3f4f5;
}

.right_container {
  height: 100vh;
  width: 100%;
  padding: 10px;
}

</style>
