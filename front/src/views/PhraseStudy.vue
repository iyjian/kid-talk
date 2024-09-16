<template>
    <el-form :model="data" label-width="100px">
    <el-form-item label="短语">
      <el-input type="textarea" rows="3" v-model="data.phrases"></el-input>
    </el-form-item>
    <el-form-item label="读音">
      <el-select v-model="data.voice">
        <el-option label="Alloy" value="alloy"></el-option>
        <el-option label="Echo" value="echo"></el-option>
        <el-option label="Fable" value="fable"></el-option>
        <el-option label="Onyx" value="onyx"></el-option>
        <el-option label="Nova" value="nova"></el-option>
        <el-option label="Shimmer" value="shimmer"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="语速">
      <el-slider
        v-model="data.speed"
        :min="0.25"
        :max="4"
        :step="0.25"
        show-stops
        show-input
      ></el-slider>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="generate">Generate</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {apiClient} from '@/libs/api'

const data = ref({
  phrases: '',
  voice: 'alloy',
  speed: 1
})

function generate() {

  apiClient.makeSentence({
    phrases: data.value.phrases.split('\n'),
    voice: data.value.voice,
    speed: data.value.speed
  })
}
</script>

<style scoped>

</style>
