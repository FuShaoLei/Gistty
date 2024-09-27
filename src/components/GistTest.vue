<script setup="GistTest">
import {getGist, getRaw} from "../api/GithubApi.js";
import {ref} from "vue";

const gistDataArr = ref([])


const getGistArrBak = async ()=>{
  getGist().then((res) => {

    const allData = res.data

    allData.forEach((item) => {
      console.log("-----")
      Object.values(item.files).forEach(async objValue => {
        const rawContent = await getContent(objValue.raw_url)

        Object.assign(objValue,{rawContent: rawContent})

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
        return Object.assign(objValue, { rawContent });
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

getGistArr()



</script>

<template>

  <div>

    <div v-for="item in gistDataArr" class="item">

      <div>{{ item.description }}</div>

            <div v-for="file in item.files">

                <div class="filename">{{file.filename}}</div>

              <el-input v-model="file.rawContent"
                  autosize
                        type="textarea">

              </el-input>
            </div>

    </div>

  </div>

</template>

<style scoped>

.item {
  border-bottom: 2px solid #333;
  padding: 10px;
}
.filename {
  background: #f3f4f5;
}
</style>
