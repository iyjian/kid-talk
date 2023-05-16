<template>
  <div>
    <div class="messages">
      <div v-for="message, idx in messages" :key="idx" class="message">
        {{ message.content }}
      </div>
    </div>
    {{ recording }}
    <input type="text" v-model="content"><button @click="sendText">发送</button>
  </div>
</template>

<script setup lang="ts">
import { io } from "socket.io-client";
import RecordRTC from 'recordrtc'
import { ref } from "vue";
import axios from 'axios'

const session = 'test'
const socket = io('http://localhost:3000');
let stream: any
let recorder: any
const content = ref("")
const messages = ref<{content: string}[]>([])
const recording = ref(false)
const startRecordingTime = ref('')

// @keydown.space="onSpaceKeyDown($event)" @keyup.space="onSpaceKeyUp($event)"
window.addEventListener("keypress", event => {
  event.preventDefault()
  if (event.code === 'Space' && !recording.value) {
    recording.value = true
    recorder.startRecording()
  }
});

window.addEventListener("keyup", event => {
  event.preventDefault()
  if (event.code === 'Space') {
    recording.value = false
    recorder.stopRecording(function() {
      let blob = recorder.getBlob();
      blob.arrayBuffer().then((buffer: BinaryData) => {
        // send(buffer)
      })
    });
  }
});

initUserMedia()
refresh()

// function onSpaceKeyDown (event: KeyboardEvent) {
//   console.log(event, '---------')
//   if (event.code === 'Space') {
//     recording.value = true
//     event.preventDefault()
//     recorder.startRecording()
//   }
// }

// function onSpaceKeyUp (event: KeyboardEvent) {
//   if (event.code === 'Space') {
//     event.preventDefault()
//     recorder.stopRecording(function() {
//         let blob = recorder.getBlob();
//         blob.arrayBuffer().then((buffer: BinaryData) => {
//           send(buffer)
//           recording.value = false
//         })
//     });
//   }
// }

async function refresh () {
  const result = await axios.get(`http://localhost:3000/chatrepo/session/${session}`)
  messages.value = result.data
}

function sendText(){
  send(content.value)
}

function send(content: string | BinaryData) {
  socket.emit('chat', { content, session }, (result: any) => {
    const {text, audio} = result
    refresh()
    if (audio) {
      playAudio(audio)
    }
  });
}


async function initUserMedia () {
  stream = await navigator.mediaDevices.getUserMedia({
    audio: true
  })

  recorder = new RecordRTC(stream, {
    type: 'audio',
    mimeType: 'audio/wav',
    timeSlice: 1000,
    sampleRate: 16000,
    numberOfAudioChannels: 1,
    ondataavailable: function(blob) {},
  });
}

function playAudio(data: BinaryData) {
  const blob=new Blob([data], {type : 'audio/ogg'});
  const blobUrl = URL.createObjectURL(blob);
  const audio = new Audio(blobUrl);
  audio.play();
}

function convertDataURIToBinary(base64: string) {
  var raw = window.atob(base64);
  var rawLength = raw.length;
  var array = new Uint8Array(new ArrayBuffer(rawLength));

  for(let i = 0; i < rawLength; i++) {
    array[i] = raw.charCodeAt(i);
  }
  return array;
}


</script>

<style scoped>
.messages {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  margin-bottom: 5px;
  min-height: 600px;
  padding: 20px;
}
.message {
  font-size: 16px;
  margin-bottom: 5px;
}
</style>
