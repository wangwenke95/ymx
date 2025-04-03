<script setup>
import SensitiveWords from "@/views/Sensitive-words.vue";

import Tools from "@/views/Tools.vue";


</script>

<template>
  <div class="box">
    <Tools></Tools>
<!--    <SensitiveWords></SensitiveWords>-->
    <!--    <SensitiveWords></SensitiveWords>-->
  </div>
</template>

<style scoped>

.box {

}
textarea {
  border: 1px solid green;

}
textarea:focus {
  outline: none; /* 去除默认的蓝色边框 */
  border: 2px solid green; /* 设置为自定义边框 */
}

</style>