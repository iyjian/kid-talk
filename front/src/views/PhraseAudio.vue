<template>
  <div style="display: flex; flex-direction: column; margin: 10px 20px">
    <el-form style="max-width: 150px;">
      <el-form-item label="单元">
        <el-select v-model="selectedUnit">
          <el-option v-for="unit, idx in units" :key="idx" :value="unit.unitName" :label="unit.unitName"></el-option>
        </el-select>
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
import { computed, ref } from 'vue'
import { apiClient } from '@/libs/api'

const selectedUnit = ref<string>('六上/1c')

const queryParams = computed(() => {
  const [grade, unit] = selectedUnit.value.split('/')
  return {
    grade, unit
  }
})

const units = ref<any[]>([{unitName: '六上/1c'}])

async function loadUnits() {
  units.value = (await apiClient.getAllUnits({})).data
}

loadUnits()

const sentences = ref()

async function reloadPhraseSentences(params: any) {
  console.log(params, '-----------')
  const response = await apiClient.getAllPhraseSentences(params)
  sentences.value = response.data.rows
}

reloadPhraseSentences(queryParams.value)

function play(id: string) {
  console.log(id, 'play')
  const mediaEl = document.getElementById(`${id}`) as HTMLMediaElement
  if (mediaEl) {
    mediaEl.play()
  }
}
</script>

<style scoped></style>
