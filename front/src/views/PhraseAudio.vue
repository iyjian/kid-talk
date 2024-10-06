<template>
  <div style="display: flex; flex-direction: column; margin: 10px 20px">
    <el-form :inline="true">
      <el-form-item label="单元">
        <el-select v-model="selectedUnit" style="width: 120px">
          <el-option
            v-for="(unit, idx) in units"
            :key="idx"
            :value="unit.unitName"
            :label="unit.unitName"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item
        ><el-button :loading="loading.play" type="primary" @click="playAll"
          >播放全部</el-button
        ></el-form-item
      >
      <el-form-item
        ><el-button v-if="loading.play" type="primary" @click="pause">暂停</el-button></el-form-item
      >
    </el-form>
    <el-table :data="sentences" style="width: 100%" v-loading="loading.table">
      <!-- <el-table-column prop="unit" label="unit"></el-table-column> -->
      <el-table-column prop="phrase" label="Phrase"></el-table-column>
      <el-table-column prop="sentence" label="Sentence"></el-table-column>
      <el-table-column width="100">
        <template #default="{ row }">
          <audio
            :src="'data:audio/mp3;base64,' + row.audio"
            :id="row.id"
            autobuffer="autobuffer"
          ></audio>
          <el-button v-if="!loading.play" @click="play(row.id)" type="primary">播放</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { apiClient } from '@/libs/api'

const loading = ref({
  table: false,
  play: false
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
  currentAudioIndex = 0
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
  audioEls = document.querySelectorAll('audio') as unknown as HTMLMediaElement[]
  audioEls.forEach(function (audio) {
    audio.removeEventListener('ended', playNextAudio)
  })

  const mediaEl = document.getElementById(`${id}`) as HTMLMediaElement
  if (mediaEl) {
    mediaEl.play()
  }
}

let audioEls: HTMLMediaElement[]
let currentAudioIndex = 0

async function playAll() {
  loading.value.play = true
  audioEls = document.querySelectorAll('audio') as unknown as HTMLMediaElement[]
  audioEls.forEach(function (audio) {
    audio.removeEventListener('ended', playNextAudio)
    audio.addEventListener('ended', playNextAudio)
  })

  await playNextAudio()
}

async function playNextAudio() {
  await new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(true)
    }, 1000)
  })

  if (currentAudioIndex < audioEls.length) {
    audioEls[currentAudioIndex].play()
  } else {
    currentAudioIndex = 0
    loading.value.play = false
  }
  currentAudioIndex++
}

function pause() {
  audioEls[currentAudioIndex - 1].pause()
  loading.value.play = false
}
</script>

<style scoped></style>
