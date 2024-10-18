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
        ><el-button :loading="continuePlay && status.playing" :disabled="!continuePlay && status.playing" type="primary" @click="playAll"
          >播放全部</el-button
        ></el-form-item
      >
      <el-form-item
        ><el-button v-if="continuePlay && status.playing" type="primary" @click="pause"
          >暂停</el-button
        ></el-form-item
      >
    </el-form>
    <el-table :data="sentences" style="width: 100%" v-loading="status.tableLoading">
      <!-- <el-table-column prop="unit" label="unit"></el-table-column> -->
      <el-table-column prop="phrase" label="Phrase"></el-table-column>
      <el-table-column prop="sentence" label="Sentence"></el-table-column>
      <el-table-column width="100">
        <template #default="{ row, column, $index }">
          <audio controls
            :src="'data:audio/mp3;base64,' + row.audio"
            :id="$index"
            autobuffer="autobuffer"
            @canplay="markAsLoaded(row, $index)"
            @ended="onAudioEnded(row, $index)"
          ></audio>
          <el-button
            @click="play(row, $index, false)"
            size="large"
            type="primary"
            :disabled="!!(status.playing && currentPlayId !== -1 && currentPlayId !== $index)"
            :loading="status.playing && currentPlayId === $index"
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

const currentPlayId = ref<number>(-1)
const continuePlay = ref(false)

const status = ref({
  tableLoading: false,
  playing: false
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
  reloadPhraseSentences(val)
})

function markAsLoaded(row: any, index: number) {
  console.log(`${row.id} loaded`)
  row.loaded = true
}

function onAudioEnded(row: any, index: number) {
  console.log(`${index} ended`)
  if (continuePlay.value && currentPlayId.value < sentences.value.length - 1) {
    currentPlayId.value = index + 1
    play(sentences.value[currentPlayId.value], currentPlayId.value, true)
  } else {
    currentPlayId.value = -1
    status.value.playing = false
  }
}

async function loadUnits() {
  units.value = (await apiClient.getAllUnits({})).data
}

async function reloadPhraseSentences(params: any) {
  try {
    status.value.tableLoading = true
    const response = await apiClient.getAllPhraseSentences(params)
    sentences.value = response.data.rows
    status.value.tableLoading = false
  } catch (e) {
    status.value.tableLoading = false
  }
}

function waitLoaded(row: any) {
  let retry = 0
  return new Promise((resolve, reject) => {
    const timer = setInterval(() => {
      retry += 1
      console.log(`wait load ${row.id}`)
      if (row.loaded) {
        clearInterval(timer)
        resolve(true)
      } else if (retry > 100) {
        clearInterval(timer)
        reject(false)
      }
    }, 100)
  })
}

async function play(row: any, index: number, isContinuePlay: boolean) {
  try {
    continuePlay.value = isContinuePlay
    currentPlayId.value = index
    status.value.playing = true
    console.log('playing', currentPlayId.value)
    // 读取音频数据
    if (!row.loaded) {
      const response = await apiClient.getOnePhraseSentenceWithAudio(row.id)
      row.audio = response.data.audio
      console.log(row)
    }

    const loadSuccess = await waitLoaded(row)

    if (!loadSuccess) {
      ElMessage({
        message: '音频数据加载失败',
        type: 'error'
      })
      currentPlayId.value = -1
      status.value.playing = false
    }

    console.log('play', row.id)

    const mediaEl = document.getElementById(`${index}`) as HTMLMediaElement

    if (mediaEl) {
      mediaEl.play()
    }
  } catch (e) {
    ElMessage({
      message: '系统异常',
      type: 'error'
    })
    currentPlayId.value = -1
    status.value.playing = false
  }
}

async function playAll() {
  const startIndex = currentPlayId.value === -1 ? 0 : currentPlayId.value
  play(sentences.value[startIndex], startIndex, true)
}

function pause() {
  const mediaEl = document.getElementById(`${currentPlayId.value}`) as HTMLMediaElement
  mediaEl.pause()
  status.value.playing = false
}
</script>

<style scoped></style>
