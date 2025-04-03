<script setup>
import {ref} from "vue";
import {ElNotification} from "element-plus";
import {useMainStore} from "@/stores/main.js";
import { useRouter } from 'vue-router';
const mainStore= useMainStore()

const qc = ref('')
const getGjc = () => {
  // 转为小写、按行去重
  const uniqueKeywords = [...new Set(mainStore.text.toLowerCase().split('\n'))].join('\n');
  qc.value = uniqueKeywords;
}

// watch(gjc,(newVal)=>{
//   // 转为小写、按行去重
//   const uniqueKeywords = [...new Set(gjc.value.toLowerCase().split('\n'))].join('\n');
//   qc.value=uniqueKeywords
// })

//跳转到统计周报页面
const router = useRouter();
const goToTjzb = () => {
  window.open('/Tjzb', '_blank'); // 跳转到 /report 页面
};
const getTitle = (str) => {
  const prepositions = ["of", "and", "in", "on", "at", "by", "for", "with", "about", "as", "to", "but", "or", "nor"]
  let newVal = str
      .replace(/,([^ ])/g, ", $1")   // 1. 逗号后面没有空格的部分加上一个空格
      .replace(/[.,;!?]$/, "")   // 2. 去除结尾的标点符号
      .toLowerCase()
      .split(" ")
      .map((word, index) =>
          prepositions.includes(word) && index !== 0
              ? word // 保持介词小写
              : word.charAt(0).toUpperCase() + word.slice(1) // 其余单词首字母大写
      )
      .join(" ");
  console.log(newVal)

  qc.value = newVal;
}

const createXq = () => {
  qc.value = 'Specification:<br>\n' +
      'Size:  <br>\n' +
      'weight: <br>\n' +
      'Material: <br>\n' +
      'Features: <br><br>\n' +
      'Package Includes:<br>\n' +
      '1 Pcs * 18 in 1 foldable wire stripper<br><br>\n' +
      '\n' +
      'Notice:<br>\n' +
      '1.Please allow slight measurement deviation due to manual measurement<br><br>\n' +
      '2.Due to different monitors and lighting effects, the actual color of the item may be slightly different from the color shown in the picture'
}

// 复制到粘贴板
const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text).then(() => {
    ElNotification({
      message: '复制成功！',
      type: 'success',
    })
  }).catch(err => {
    ElNotification({
      message: '复制失败',
      type: 'success',
    })
  });
}

const copy = () => {
  if (qc.value) {
    copyToClipboard(qc.value)
  }
}
</script>

<template>
  <div class="tools-box">
    <textarea class="gjc"
              rows="20"
              style="width: 400px;"
              v-model="mainStore.text"
              placeholder="请放入需要检索的文本"
    />
    <div class="buttons">
      <el-button type="success" @click="getGjc">关键词处理</el-button>
      <el-button type="success" @click="getTitle(mainStore.text)">标题处理</el-button>
      <el-button type="success" @click="createXq">生成详情模版</el-button>
      <el-button type="success" @click="goToTjzb">统计周报</el-button>
    </div>
    <textarea
        rows="40"
        style="width: 400px;"
        v-model="qc"
        @dblclick="copy"
    />
  </div>
</template>

<style scoped>
.tools-box {
  width: 100vw;
  //position: fixed;
  top: 20px;
  justify-content: center;
  display: flex;
  gap: 20px;
//align-items: start;

}

.buttons {

  gap: 20px; /* 子元素之间的间距 */
  display: flex;
  flex-direction: column;
  justify-content: center; /* 垂直居中对齐 */
  align-items: center; /* 水平居中 */
}

.buttons >>> .el-button {
  width: 150px;
  margin: 10px 0; /* 设置上下间距 */
}

textarea {
  background-color: #8ec490;
  color: black;
  border: 1px solid green;

}
textarea:focus {
  outline: none; /* 去除默认的蓝色边框 */
  border: 2px solid green; /* 设置为自定义边框 */
}


</style>