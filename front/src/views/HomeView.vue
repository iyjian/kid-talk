<template>
  <div style="display: flex;flex-direction: column;align-items: center;">
    <!-- <div class="messages">
      <div v-for="message, idx in messages" :key="idx" class="message">
        <span class="role">{{message.role}}:</span> {{ message.content }}
      </div>
    </div>
    <div style="display: flex;align-items: center;flex-direction: column;">
      <button class="record-button" :class="recording ? 'Rec' : 'notRec'"></button>
      <span>按住空格后说话</span>recording: {{ recording }}&nbsp;&nbsp;&nbsp;isKeyDown:{{ isKeyDown }}
    </div> -->
  </div>
</template>

<script setup lang="ts">
import {Howl, Howler} from 'howler';
import { io } from "socket.io-client";
import { ref } from "vue";
import axios from 'axios'
import {apiClient} from './../libs/api'
const debug = false
const session = 'test'
const socket = io('/', {
  query: {
    token: localStorage.getItem('token')
  }
});
const content = ref("")
const messages = ref<{content: string, role: string}[]>([])
const recording = ref(false)
const isKeyDown = ref(false)
const startRecordingTime = ref<number>(0)

setTimeout(() => {
  socket.emit('test')
}, 2000)

// @ts-ignore
const SpeechRecognition = window.SpeechRecognition || webkitSpeechRecognition;
// @ts-ignore
// const SpeechRecognitionEvent = window.SpeechRecognitionEvent || webkitSpeechRecognitionEvent;

// persist voice permission
// https://stackoverflow.com/questions/15993581/reprompt-for-permissions-with-getusermedia-after-initial-denial/15999940
const recognition = new SpeechRecognition();
recognition.continuous = false;
recognition.lang = "en-US";
recognition.interimResults = false;
recognition.maxAlternatives = 1;


if (debug) {
  const UA = navigator.userAgent.toLowerCase();
  messages.value.push({content: "UA:" + UA, role: 'debug'})
}

recognition.onresult = (event: any) => {
  const text = event.results[0][0].transcript;
  if (+new Date() - startRecordingTime.value > 1000) {
    console.log(`speech reconition - result: ${text} confidence: ${event.results[0][0].confidence}`)
    send(text)
    messages.value.push({content: text, role: 'me'})
  } else {
    console.log(`speech reconition - result: ${text} confidence: ${event.results[0][0].confidence} too short`)
  }
  
};

recognition.onstart = function() {
  console.log('speech reconition - start')
  if (debug) {
    messages.value.push({content: 'speech reconition - start', role: 'debug'})
  }
}

recognition.onend = function() {
  console.log('speech reconition - end')
  if (debug) {
    messages.value.push({content: 'speech reconition - end', role: 'debug'})
  }  
}

recognition.onspeechend = () => {
  console.log('speech reconition - onspeechend')
  if (debug) {
    messages.value.push({content: 'speech reconition - onspeechend', role: 'debug'})
  }  
  // recording.value = false
  // recognition.stop();
};

window.addEventListener("touchstart", event => {
  if (debug) {
    messages.value.push({content: 'speech reconition - touchstart', role: 'debug'})
  }
  if (!recording.value && !isKeyDown.value) {
    console.log('speech reconition - touchstart')
  if (debug) {
    messages.value.push({content: 'speech reconition - onspeechend', role: 'debug'})
  }      
    recording.value = true
    startRecordingTime.value = +new Date()
    recognition.start();
  }
})

window.addEventListener("touchend", event => {
  if (debug) {
    messages.value.push({content: 'speech reconition - touchend', role: 'debug'})
  }
  event.preventDefault()
  if (recording.value) {
    recording.value = false
    isKeyDown.value = false
    recognition.stop();
  }
})

window.addEventListener("keypress", event => {
  event.preventDefault()
  if (event.code === 'Space' && !recording.value && !isKeyDown.value) {
    console.log('speech reconition - keypress')
    recording.value = true
    startRecordingTime.value = +new Date()
    recognition.start();
  }
});


window.addEventListener("keyup", event => {
  event.preventDefault()
  if (event.code === 'Space' && recording.value) {
    recording.value = false
    isKeyDown.value = false
    recognition.stop();
  }
});

refresh()

async function refresh () {
  const result = await apiClient.getSession(1)
  messages.value = result.data
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

function unlockAudio() {
  console.log('unlockAudio')
    const sound = new Audio('./2-seconds-and-500-milliseconds-of-silence.mp3');

    sound.play();
    sound.pause();
    sound.currentTime = 0;

    document.body.removeEventListener('click', unlockAudio)
    document.body.removeEventListener('touchstart', unlockAudio)
}
document.body.addEventListener('click', unlockAudio);
document.body.addEventListener('touchstart', unlockAudio);

/**
 * https://stackoverflow.com/questions/54047606/allow-audio-play-on-safari-for-chat-app
 * https://github.com/goldfire/howler.js/issues/1030
 * @param data 
 */
function playAudio(data: BinaryData) {
  const blob=new Blob([data], {type : 'audio/ogg'});
  const blobUrl = URL.createObjectURL(blob);
  // const audio = new Audio(blobUrl);
  // audio.play();
  const sound = new Howl({
    src: blobUrl
  });

  sound.play();
}

// setTimeout(() => {
//   const sound = new Howl({
//     src: './2-seconds-and-500-milliseconds-of-silence.mp3'
//   });

//   sound.play();
//   console.log('played')
// }, 3000)

</script>

<style scoped>
.messages {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  margin-bottom: 5px;
  max-height: 60vh;
  max-width: 900px;
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

.notRec{
	background-color: darkred;
}

.Rec{
	animation-name: pulse;
	animation-duration: 1.5s;
	animation-iteration-count: infinite;
	animation-timing-function: linear;
}

@keyframes pulse{
	0%{
		box-shadow: 0px 0px 5px 0px rgba(173,0,0,.3);
	}
	65%{
		box-shadow: 0px 0px 5px 13px rgba(173,0,0,.3);
	}
	90%{
		box-shadow: 0px 0px 5px 13px rgba(173,0,0,0);
	}
}
</style>
