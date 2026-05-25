const video = document.getElementById("video");

navigator.mediaDevices.getUserMedia({
  video:true
}).then(stream=>{
  video.srcObject = stream;
});

const hands = new Hands({
  locateFile: file => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
  }
});

hands.setOptions({
  maxNumHands:1,
  minDetectionConfidence:0.7,
  minTrackingConfidence:0.7
});

hands.onResults(results => {

  console.log(results);

});

const camera = new Camera(video,{
  onFrame: async ()=>{
    await hands.send({image:video});
  },
  width:640,
  height:480
});

camera.start();
