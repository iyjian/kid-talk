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
            @loadeddata="markAsLoaded(row)"
            @ended="onAudioEnded(row)"
          ></audio>
          <el-button
            @click="play(row)"
            type="primary"
            :disabled="!!(currentPlayId && currentPlayId !== row.id)"
            :loading="currentPlayId === row.id"
            >播放</el-button
          >
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { apiClient } from '@/libs/api'
import { ElMessage } from 'element-plus'

const selectedUnit = ref<string>('六上/1c')
const units = ref<any[]>([{ unitName: '六上/1c' }])
const sentences = ref([])
const currentPlayId = ref<number>(0)

const loading = ref({
  table: false,
  play: false
})

const queryParams = computed(() => {
  const [grade, unit] = selectedUnit.value.split('/')
  return {
    grade,
    unit,
    attributes: ['id', 'unit', 'grade', 'phrase', 'sentence']
  }
})

loadUnits()
reloadPhraseSentences(queryParams.value)

watch(queryParams, (val) => {
  // currentAudioIndex = 0
  reloadPhraseSentences(val)
})

function markAsLoaded(row: any) {
  console.log(`${row.id} loaded`)
  row.loaded = true
}

function onAudioEnded(row: any) {
  console.log(`${row.id} ended`)
  currentPlayId.value = 0
}

async function loadUnits() {
  units.value = (await apiClient.getAllUnits({})).data
}

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

function waitLoaded(row: any) {
  const retry = 0
  return new Promise((resolve, reject) => {
    setInterval(() => {
      if (row.loaded) {
        resolve(true)
      } else if (retry > 100) {
        reject(false)
      }
    }, 100)
  })
}

async function play(row: any) {
  try {
    currentPlayId.value = row.id
    console.log('playing', currentPlayId.value)
    // 读取音频数据
    if (!row.loaded) {
      const response = await apiClient.getOnePhraseSentenceWithAudio(row.id)
      row.audio = response.data.audio
    }

    const loadSuccess = await waitLoaded(row)

    if (!loadSuccess) {
      ElMessage({
        message: '音频数据加载失败',
        type: 'error'
      })
      currentPlayId.value = 0
    }

    console.log('play', row.id)

    const mediaEl = document.getElementById(`${row.id}`) as HTMLMediaElement

    if (mediaEl) {
      mediaEl.play()
    }
  } catch (e) {
    ElMessage({
      message: '系统异常',
      type: 'error'
    })
    currentPlayId.value = 0
  }
}

// let audioEls: HTMLMediaElement[]
// let currentAudioIndex = 0

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

function pause(row: any) {
  const mediaEl = document.getElementById(`${row.id}`) as HTMLMediaElement
  mediaEl.pause()
}
</script>

<style scoped></style>
