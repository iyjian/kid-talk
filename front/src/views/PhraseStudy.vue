<template>
  <div style="display: flex; flex-direction: column; margin: 10px 20px">
    <el-form :model="data" label-width="100px">
      <el-form-item label="年级">
        <el-input v-model="data.grade"></el-input>
      </el-form-item>
      <el-form-item label="单元">
        <el-input v-model="data.unit"></el-input>
      </el-form-item>
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

    <el-table :data="sentences" style="width: 100%">
      <el-table-column prop="unit" label="unit" width="180"></el-table-column>
      <el-table-column prop="phrase" label="Phrase" width="180"></el-table-column>
      <el-table-column prop="sentence" label="Sentence" width="400px;"></el-table-column>
      <el-table-column label="Operation" width="250">
        <template #default="{ row }">
          <audio
            :src="'data:audio/mp3;base64,' + row.audio"
            :id="row.id"
            autobuffer="autobuffer"
          ></audio>
          <el-button @click="play(row.id)" type="primary">播放</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { apiClient } from '@/libs/api'

const data = ref({
  grade: '',
  unit: '',
  phrases: '',
  voice: 'alloy',
  speed: 1
})

const sentences = ref()

function generate() {
  apiClient.makeSentence({
    grade: data.value.grade,
    unit: data.value.unit,
    phrases: data.value.phrases.split('\n'),
    voice: data.value.voice,
    speed: data.value.speed
  })
}

async function reloadPhraseSentences() {
  const response = await apiClient.getAllPhraseSentences({})
  sentences.value = response.data.rows
}

reloadPhraseSentences()

function play(id: string) {
  console.log(id, 'play')
  const mediaEl = document.getElementById(`${id}`) as HTMLMediaElement
  if (mediaEl) {
    mediaEl.play()
  }
}
</script>

<style scoped></style>
