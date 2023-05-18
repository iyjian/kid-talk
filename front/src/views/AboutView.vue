<template>
  <div style="display: flex; flex-direction: column; align-items: center">
    <div class="messages">
      <div v-for="(message, idx) in messages" :key="idx" class="message">
        <span class="role">{{ message.role }}:</span> {{ message.content }}
      </div>
    </div>
    <!-- <input type="text" v-model="content"><button @click="sendText">发送</button> -->
    <div style="display: flex; align-items: center; flex-direction: column">
      <button class="record-button" :class="recording ? 'Rec' : 'notRec'"></button>
      <span>按住空格后说话</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { io } from 'socket.io-client'
import RecordRTC from 'recordrtc'
import { ref } from 'vue'
import axios from 'axios'

const session = 'test'
const socket = io('http://localhost:3000')
let stream: any
let recorder: any
const content = ref('')
const messages = ref<{ content: string; role: string }[]>([])
const recording = ref(false)
const startRecordingTime = ref<number>(0)

// @keydown.space="onSpaceKeyDown($event)" @keyup.space="onSpaceKeyUp($event)"
window.addEventListener('keypress', (event) => {
  event.preventDefault()
  if (event.code === 'Space' && !recording.value) {
    recording.value = true
    startRecordingTime.value = +new Date()
    recorder.startRecording()
  }
})

window.addEventListener('keyup', (event) => {
  event.preventDefault()
  if (event.code === 'Space') {
    recording.value = false
    recorder.stopRecording(() => {
      let blob = recorder.getBlob()
      blob.arrayBuffer().then((buffer: BinaryData) => {
        if (+new Date() - startRecordingTime.value > 1000) {
          console.log('send voice', buffer.byteLength)
          send(buffer)
        } else {
          alert('录音时间太短')
        }
      })
    })
  }
})

initUserMedia()
refresh()

async function refresh() {
  const result = await axios.get(`http://localhost:3000/chatrepo/session/${session}`)
  messages.value = result.data
}

function sendText() {
  send(content.value)
}

function send(content: string | BinaryData) {
  socket.emit('chat', { content, session }, (result: any) => {
    const { text, audio } = result
    refresh()
    if (audio) {
      playAudio(audio)
    }
  })
}

async function initUserMedia() {
  stream = await navigator.mediaDevices.getUserMedia({
    audio: true
  })

  recorder = new RecordRTC(stream, {
    type: 'audio',
    mimeType: 'audio/wav',
    timeSlice: 1000,
    sampleRate: 16000,
    numberOfAudioChannels: 1,
    ondataavailable: function (blob) {}
  })
}

function playAudio(data: BinaryData) {
  const blob = new Blob([data], { type: 'audio/ogg' })
  const blobUrl = URL.createObjectURL(blob)
  const audio = new Audio(blobUrl)
  audio.play()
}

function convertDataURIToBinary(base64: string) {
  var raw = window.atob(base64)
  var rawLength = raw.length
  var array = new Uint8Array(new ArrayBuffer(rawLength))

  for (let i = 0; i < rawLength; i++) {
    array[i] = raw.charCodeAt(i)
  }
  return array
}
</script>

<style scoped>
.messages {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  margin-bottom: 5px;
  min-height: 600px;
  width: 900px;
  padding: 20px;
  border: 1px solid lightgray;
}
.message {
  font-size: 16px;
  margin-bottom: 5px;
}
.message .role {
  font-weight: bold;
}

.record-button {
  width: 35px;
  height: 35px;
  font-size: 0;
  background-color: red;
  border: 0;
  border-radius: 35px;
  margin: 18px;
  outline: none;
}

.notRec {
  background-color: darkred;
}

.Rec {
  animation-name: pulse;
  animation-duration: 1.5s;
  animation-iteration-count: infinite;
  animation-timing-function: linear;
}

@keyframes pulse {
  0% {
    box-shadow: 0px 0px 5px 0px rgba(173, 0, 0, 0.3);
  }
  65% {
    box-shadow: 0px 0px 5px 13px rgba(173, 0, 0, 0.3);
  }
  90% {
    box-shadow: 0px 0px 5px 13px rgba(173, 0, 0, 0);
  }
}
</style>
