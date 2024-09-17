<template>
  <div style="display: flex; flex-direction: column; margin: 10px 20px">
    <el-form style="max-width: 150px">
      <el-form-item label="单元">
        <el-select v-model="selectedUnit">
          <el-option
            v-for="(unit, idx) in units"
            :key="idx"
            :value="unit.unitName"
            :label="unit.unitName"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item><el-button type="primary" @click="playAll">播放全部</el-button></el-form-item>
    </el-form>
    <el-table :data="sentences" style="width: 100%" v-loading="loading.table">
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
import { computed, ref, watch } from 'vue'
import { apiClient } from '@/libs/api'

const loading = ref({
  table: false
})

const selectedUnit = ref<string>('六上/1c')

const queryParams = computed(() => {
  const [grade, unit] = selectedUnit.value.split('/')
  return {
    grade,
    unit
  }
})

watch(queryParams, (val) => {
  reloadPhraseSentences(val)
})

const units = ref<any[]>([{ unitName: '六上/1c' }])

async function loadUnits() {
  units.value = (await apiClient.getAllUnits({})).data
}

loadUnits()

const sentences = ref()

async function reloadPhraseSentences(params: any) {
  try {
    loading.value.table = true
    const response = await apiClient.getAllPhraseSentences(params)
    sentences.value = response.data.rows
    loading.value.table = false
  } catch (e) {
    loading.value.table = false
  }
}

reloadPhraseSentences(queryParams.value)

function play(id: string) {
  console.log(id, 'play')
  const mediaEl = document.getElementById(`${id}`) as HTMLMediaElement
  if (mediaEl) {
    mediaEl.play()
  }
}

let audioEls: HTMLMediaElement[]
let currentAudioIndex = 0

function playAll() {
  audioEls = document.querySelectorAll('audio') as unknown as HTMLMediaElement[]
  audioEls.forEach(function (audio) {
    audio.addEventListener('ended', playNextAudio)
  })
  playNextAudio()
}

function playNextAudio() {
  if (currentAudioIndex < audioEls.length) {
    audioEls[currentAudioIndex].play()
  }
  currentAudioIndex++
}
</script>

<style scoped></style>
