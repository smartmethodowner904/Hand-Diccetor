const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const switchBtn = document.getElementById("switchBtn");

let currentCamera = "user";
let currentStream = null;

// =======================
// START CAMERA
// =======================

async function startCamera() {

  try {

    // Stop old camera
    if (currentStream) {

      currentStream
        .getTracks()
        .forEach(track => track.stop());

    }

    // Open new camera
    currentStream =
      await navigator.mediaDevices.getUserMedia({

        video: {
          facingMode: currentCamera,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },

        audio: false

      });

    video.srcObject = currentStream;

    // Wait for video
    await video.play();

  }
  catch (error) {

    alert(
      "Camera access denied or not working 😢"
    );

    console.log(error);

  }

}

// Start default camera
startCamera();

// =======================
// SWITCH CAMERA
// =======================

switchBtn.addEventListener("click", async () => {

  currentCamera =
    currentCamera === "user"
      ? "environment"
      : "user";

  await startCamera();

});

// =======================
// MEDIAPIPE HANDS
// =======================

const hands = new Hands({

  locateFile: (file) => {

    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;

  }

});

// Settings
hands.setOptions({

  maxNumHands: 1,
  modelComplexity: 1,

  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.7

});

// =======================
// FINGER COUNT
// =======================

function countFingers(landmarks) {

  let fingers = 0;

  // Thumb
  if (
    landmarks[4].x <
    landmarks[3].x
  ) {
    fingers++;
  }

  // Index
  if (
    landmarks[8].y <
    landmarks[6].y
  ) {
    fingers++;
  }

  // Middle
  if (
    landmarks[12].y <
    landmarks[10].y
  ) {
    fingers++;
  }

  // Ring
  if (
    landmarks[16].y <
    landmarks[14].y
  ) {
    fingers++;
  }

  // Pinky
  if (
    landmarks[20].y <
    landmarks[18].y
  ) {
    fingers++;
  }

  return fingers;

}

// =======================
// RESULTS
// =======================

hands.onResults((results) => {

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // Clear screen
  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  // Draw full camera
  ctx.drawImage(
    results.image,
    0,
    0,
    canvas.width,
    canvas.height
  );

  // Hand detected
  if (results.multiHandLandmarks) {

    for (
      const landmarks
      of results.multiHandLandmarks
    ) {

      // =======================
      // DRAW HAND CONNECTIONS
      // =======================

      drawConnectors(
        ctx,
        landmarks,
        HAND_CONNECTIONS,
        {
          color: "#00ff00",
          lineWidth: 5
        }
      );

      // =======================
      // DRAW LANDMARKS
      // =======================

      drawLandmarks(
        ctx,
        landmarks,
        {
          color: "#ffff00",
          lineWidth: 2,
          radius: 6
        }
      );

      // =======================
      // COUNT FINGERS
      // =======================

      const totalFingers =
        countFingers(landmarks);

      // =======================
      // GESTURE NAME
      // =======================

      let gesture =
        "Unknown Gesture";

      if (totalFingers === 0) {

        gesture = "✊ Fist";

      }
      else if (totalFingers === 1) {

        gesture = "👆 Point";

      }
      else if (totalFingers === 2) {

        gesture = "✌️ Peace";

      }
      else if (totalFingers === 3) {

        gesture = "🤟 Three";

      }
      else if (totalFingers === 5) {

        gesture = "🖐 Open Hand";

      }

      // =======================
      // SHOW UI TEXT
      // =======================

      ctx.font =
        "bold 35px Arial";

      ctx.fillStyle =
        "#00ffff";

      ctx.fillText(
        `Gesture: ${gesture}`,
        20,
        60
      );

      ctx.fillStyle =
        "#00ff00";

      ctx.fillText(
        `Fingers: ${totalFingers}`,
        20,
        110
      );

    }

  }
  else {

    // No hand detected

    ctx.font =
      "bold 35px Arial";

    ctx.fillStyle =
      "red";

    ctx.fillText(
      "✋ Show Your Hand",
      20,
      60
    );

  }

});

// =======================
// CAMERA LOOP
// =======================

const camera = new Camera(video, {

  onFrame: async () => {

    await hands.send({
      image: video
    });

  },

  width: 1280,
  height: 720

});

// Start tracking
camera.start();
