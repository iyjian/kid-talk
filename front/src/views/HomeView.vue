<template>
  <main>
    <p v-for="message in messages">
      {{ message.content }}
    </p>
    <input type="text" v-model="content"><button @click="send">发送</button>
  </main>
</template>

<script setup lang="ts">
import { io } from "socket.io-client";
import RecordRTC from 'recordrtc'
import { ref } from "vue";
import axios from 'axios'
import { reactive } from "vue";

const session = 'test'
const socket = io('http://localhost:3000');
let stream: any
let recorder: any
const content = ref("")
const messages = ref<{content: string}[]>([])



initUserMedia()
refresh()

async function refresh () {
  const result = await axios.get(`http://localhost:3000/chatrepo/session/${session}`)
  messages.value = result.data
}

function send() {
  socket.emit('chat', { content: content.value, session }, (result: any) => {
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