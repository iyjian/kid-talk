
# 语音文字互转接口

## 科大讯飞语音识别接口文档
https://www.xfyun.cn/doc/tts/online_tts/API.html#%E6%8E%A5%E5%8F%A3%E8%A6%81%E6%B1%82

## 语音合成（流式版）WebAPI 文档
https://www.xfyun.cn/doc/tts/online_tts/API.html#%E6%8E%A5%E5%8F%A3%E8%B0%83%E7%94%A8%E6%B5%81%E7%A8%8B

## 语音播放
https://github.com/TooTallNate/node-speaker
https://github.com/TooTallNate/node-lame

## 播放声音
```javascript
function convertDataURIToBinary(base64) {
  // var base64Index = dataURI.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
  // var base64 = dataURI.substring(base64Index);
  var raw = window.atob(base64);
  var rawLength = raw.length;
  var array = new Uint8Array(new ArrayBuffer(rawLength));

  for(i = 0; i < rawLength; i++) {
    array[i] = raw.charCodeAt(i);
  }
  return array;
}

var binary= convertDataURIToBinary(data);

var blob=new Blob([binary], {type : 'audio/ogg'});

var blobUrl = URL.createObjectURL(blob);

var audio = new Audio(blobUrl);

audio.play();
```

## m4a转mp3
```bash
ffmpeg -i input.m4a -c:v copy -c:a libmp3lame -q:a 4 output.mp3
```

ffmpeg -i test.m4a -ac 1 -ar 8000 -f s16le test.pcm



## 更改采样率
```bash
ffmpeg -i test.m4a -ac 1 -ar 16000 -c:v copy -c:a libmp3lame -q:a 4  -y test.mp3
```

## 转PCM
```bash
ffmpeg -y  -i test2.webm  -acodec pcm_s16le -f s16le -ac 1 -ar 16000 test2.pcm
```

```bash
ffprobe -show_streams -show_format test2.pcm
```

ffmpeg -i test2.webm -ac 1 -ar 16000 -vn test2.wav