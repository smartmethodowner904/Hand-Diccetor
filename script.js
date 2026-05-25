const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// ===== CAMERA SELECT =====

let currentCamera = "user"; // front camera

async function startCamera(cameraType){

  const stream = await navigator.mediaDevices.getUserMedia({
    video:{
      facingMode: cameraType
    }
  });

  video.srcObject = stream;

}

startCamera(currentCamera);

// ===== SWITCH CAMERA =====

document.addEventListener("dblclick", async ()=>{

  currentCamera =
    currentCamera === "user"
    ? "environment"
    : "user";

  const tracks = video.srcObject.getTracks();

  tracks.forEach(track => track.stop());

  await startCamera(currentCamera);

});

// ===== MEDIAPIPE =====

const hands = new Hands({
  locateFile: (file)=>{
    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
  }
});

hands.setOptions({
  maxNumHands:1,
  modelComplexity:1,
  minDetectionConfidence:0.7,
  minTrackingConfidence:0.7
});

// ===== DRAW =====

hands.onResults((results)=>{

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // FULLSCREEN CAMERA
  ctx.drawImage(
    results.image,
    0,
    0,
    canvas.width,
    canvas.height
  );

  // ONLY ONE SCREEN
  // NO EXTRA CAMERA BOX

  if(results.multiHandLandmarks){

    for(const landmarks of results.multiHandLandmarks){

      // DRAW CONNECTIONS

      for(const connection of HAND_CONNECTIONS){

        const start = landmarks[connection[0]];
        const end = landmarks[connection[1]];

        ctx.beginPath();

        ctx.moveTo(
          start.x * canvas.width,
          start.y * canvas.height
        );

        ctx.lineTo(
          end.x * canvas.width,
          end.y * canvas.height
        );

        ctx.strokeStyle = "lime";
        ctx.lineWidth = 5;
        ctx.stroke();
      }

      // DRAW POINTS

      for(const point of landmarks){

        const x = point.x * canvas.width;
        const y = point.y * canvas.height;

        ctx.beginPath();

        ctx.arc(
          x,
          y,
          10,
          0,
          2 * Math.PI
        );

        ctx.fillStyle = "yellow";
        ctx.fill();
      }

    }

  }

});

// ===== CAMERA START =====

const camera = new Camera(video,{

  onFrame: async ()=>{

    await hands.send({
      image: video
    });

  },

  width:1280,
  height:720

});

camera.start();
