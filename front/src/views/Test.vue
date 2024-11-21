<template>
  <div style="margin: 10px">
    <div style="display: flex; flex-direction: row; gap: 20px 20px">
      <button @click="init">对话初始化</button>
      <!-- <input v-model="content" style="width:200px;"> -->
      <button @click="chat">测试发送对话</button>
    </div>
    <!-- {{ niceToSeeYou }} -->
    <h2>当前会话Id: {{ currentSessionId }}</h2>

    <h2>数据返回：</h2>
    <pre
      style="
        padding: 10px;
        word-break: break-all;
        word-wrap: break-word;
        width: 100%;
        overflow-y: scroll;
        border: 1px solid lightgray;
      "
      v-for="response in responses"
      >{{ response }}</pre
    >
  </div>
</template>

<script setup lang="ts">
import { Howl, Howler } from 'howler'
import { ref } from 'vue'
import { niceToSeeYou } from './../assets/nice2seeu'
import { useAdminStore } from '@/stores/user';
const adminStore = useAdminStore()

const debug = false
const currentSessionId = ref<number>()
const content = ref<any>(niceToSeeYou)

const responses = ref<string[]>([])

// const socket = new WebSocket('wss://kidtalk.tltr.top/ws/')
const socket = new WebSocket('/ws')

socket.onopen = () => {
  console.log('socket open')
}

socket.onmessage = (msg: any) => {
  console.log(msg, typeof msg)
  const { command, sessionId, content, role, audio } = JSON.parse(msg.data)

  if (command === 'init') {
    console.log(command, sessionId, content, role, audio)
    // const { sessionId, content, role, audio } = payload
    currentSessionId.value = sessionId
    responses.value.push(JSON.stringify(msg.data, null, 2))
  } else if (command === 'chat') {
    // const { sessionId, content, role, audio } = payload
    responses.value.push(JSON.stringify(msg.data, null, 2))
  }
}

socket.onclose = () => {
  console.log('socket close')
}

function init() {
  socket.send(
    JSON.stringify({
      event: 'init',
      data: {
        token: adminStore?.user.token,
        id: 8
      }
    })
  )
}

function chat() {
  // if (!currentSessionId.value) {
  //   alert('对话前请先初始化对话！')
  // }
  // socket.emit('chat', { content: content.value, sessionId: currentSessionId.value }, (result: any) => {
  //   const { sessionId, content, role, audio } = result
  //   responses.value.push(JSON.stringify(result, null, 2))
  // })
  socket.send(
    JSON.stringify({
      event: 'chat',
      data: {
        token: adminStore?.user.token,
        content: content.value,
        sessionId: currentSessionId.value
      }
    })
  )
}

// function base64ToBuffer(base64String) {
//   // Convert base64 string to binary data
//   const byteCharacters = atob(base64String)
//   // Create an 8-bit unsigned integer array (Uint8Array)
//   const byteNumbers = new Array(byteCharacters.length)
//   for (let i = 0; i < byteCharacters.length; i++) {
//     byteNumbers[i] = byteCharacters.charCodeAt(i)
//   }
//   // Create a buffer from the 8-bit unsigned integer array
//   const buffer = new Uint8Array(byteNumbers).buffer
//   console.log(buffer, '----')
//   return buffer
// }

/*

const messages = ref<{ content: string; role: string }[]>([])
const recording = ref(false)
const isKeyDown = ref(false)
const startRecordingTime = ref<number>(0)

let currentSessionId: number

apiClient.getLatestSession().then((latestSession) => {
  if (latestSession?.data?.latestSession) {
    messages.value = latestSession.data.chatHistories
    console.log(messages.value)
    currentSessionId = latestSession.data.latestSession.id
  }
})

// setTimeout(() => {
//   socket.emit('test')
// }, 2000)

// @ts-ignore
const SpeechRecognition = window.SpeechRecognition || webkitSpeechRecognition
// @ts-ignore
// const SpeechRecognitionEvent = window.SpeechRecognitionEvent || webkitSpeechRecognitionEvent;

// persist voice permission
// https://stackoverflow.com/questions/15993581/reprompt-for-permissions-with-getusermedia-after-initial-denial/15999940
const recognition = new SpeechRecognition()
recognition.continuous = false
recognition.lang = 'en-US'
recognition.interimResults = false
recognition.maxAlternatives = 1

if (debug) {
  const UA = navigator.userAgent.toLowerCase()
  messages.value.push({ content: 'UA:' + UA, role: 'debug' })
}

recognition.onresult = (event: any) => {
  const text = event.results[0][0].transcript
  if (+new Date() - startRecordingTime.value > 1000) {
    console.log(`speech reconition - result: ${text} confidence: ${event.results[0][0].confidence}`)
    send(text)
    messages.value.push({ content: text, role: 'me' })
  } else {
    console.log(
      `speech reconition - result: ${text} confidence: ${event.results[0][0].confidence} too short`
    )
  }
}

recognition.onstart = function () {
  console.log('speech reconition - start')
  if (debug) {
    messages.value.push({ content: 'speech reconition - start', role: 'debug' })
  }
}

recognition.onend = function () {
  console.log('speech reconition - end')
  if (debug) {
    messages.value.push({ content: 'speech reconition - end', role: 'debug' })
  }
}

recognition.onspeechend = () => {
  console.log('speech reconition - onspeechend')
  if (debug) {
    messages.value.push({ content: 'speech reconition - onspeechend', role: 'debug' })
  }
  // recording.value = false
  // recognition.stop();
}

window.addEventListener('touchstart', (event) => {
  event.preventDefault()
  if (debug) {
    messages.value.push({ content: 'speech reconition - touchstart', role: 'debug' })
  }
  if (!recording.value && !isKeyDown.value) {
    console.log('speech reconition - touchstart')
    if (debug) {
      messages.value.push({ content: 'speech reconition - onspeechend', role: 'debug' })
    }
    recording.value = true
    startRecordingTime.value = +new Date()
    recognition.start()
  }
})

window.addEventListener('touchend', (event) => {
  event.preventDefault()
  if (debug) {
    messages.value.push({ content: 'speech reconition - touchend', role: 'debug' })
  }
  if (recording.value) {
    recording.value = false
    isKeyDown.value = false
    recognition.stop()
  }
})

window.addEventListener('keypress', (event) => {
  event.preventDefault()
  if (event.code === 'Space' && !recording.value && !isKeyDown.value) {
    console.log('key event - keypress')
    recording.value = true
    startRecordingTime.value = +new Date()
    recognition.start()
  }
})

window.addEventListener('keyup', (event) => {
  event.preventDefault()
  if (event.code === 'Space' && recording.value) {
    console.log('key event - keyup')
    recording.value = false
    isKeyDown.value = false
    recognition.stop()
  }
})

refresh()

async function refresh() {
  if (currentSessionId) {
    const result = await apiClient.getSession(currentSessionId)
    messages.value = result.data
  }
}

async function restart() {
  messages.value = []
  socket.emit('init', { mode: '' }, (result: any) => {
    const { sessionId, text, audio } = result
    currentSessionId = sessionId
    refresh()
    if (audio) {
      playAudio(audio)
    }
  })
}

function send(content: string | BinaryData) {
  socket.emit('chat', { content, sessionId: currentSessionId }, (result: any) => {
    const { text, audio } = result
    refresh()
    if (audio) {
      playAudio(audio)
    }
  })
}
*/

/**
 * https://stackoverflow.com/questions/54047606/allow-audio-play-on-safari-for-chat-app
 * https://github.com/goldfire/howler.js/issues/1030
 * @param data
 */
function playAudio(data: string) {
  const sound = new Howl({
    src: [data]
  })

  sound.once('load', function () {
    console.log('loaded')
    sound.play()
  })

  sound.play()
}
</script>

<style scoped>
.messages {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  margin-bottom: 5px;
  max-height: 60vh;
  min-height: 60vh;
  width: 60vw;
  padding: 20px;
  border: 1px solid lightgray;
  overflow: scroll;
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
