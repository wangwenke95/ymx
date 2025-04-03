<script setup>
import {ref} from "vue";
import {useMainStore} from "@/stores/main.js";

const aaa = ref('')
const mainStore = useMainStore()
const keyWord = ref('')
const setColor = () => {
  const re = new RegExp('ab', 'gi')
  aaa.value = mainStore.text.replace(re, `<span style="background-color: yellow;"></span>`)
}
</script>

<template>
  <div class="Sw-box">
    <span class="sw-text" v-html="aaaru"></span>
    <button @click="setColor">测试1</button>
  </div>
</template>

<style scoped>
.Sw-box {
  margin-top: 40px;
  width: 100vw;
  justify-content: center;
  display: flex;

}

.sw-text {
  width: 1000px;
  background-color: #8ec490;
  color: black;

//border: 1px solid green;

}


</style>