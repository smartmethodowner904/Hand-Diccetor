const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Camera Access
navigator.mediaDevices.getUserMedia({
  video: true
}).then((stream) => {
  video.srcObject = stream;
});

// MediaPipe Hands Setup
const hands = new Hands({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
  }
});

hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 1,
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.7
});

// Draw Hand Connections
function drawHand(landmarks) {

  // Draw lines
  const connections = HAND_CONNECTIONS;

  for (const connection of connections) {

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
    ctx.lineWidth = 4;
    ctx.stroke();
  }

  // Draw points
  for (const point of landmarks) {

    const x = point.x * canvas.width;
    const y = point.y * canvas.height;

    ctx.beginPath();
    ctx.arc(x, y, 8, 0, 2 * Math.PI);

    ctx.fillStyle = "yellow";
    ctx.fill();
  }
}

// Finger Count
function countFingers(landmarks) {

  let fingers = 0;

  // Thumb
  if (landmarks[4].x < landmarks[3].x) {
    fingers++;
  }

  // Other fingers
  if (landmarks[8].y < landmarks[6].y) fingers++;
  if (landmarks[12].y < landmarks[10].y) fingers++;
  if (landmarks[16].y < landmarks[14].y) fingers++;
  if (landmarks[20].y < landmarks[18].y) fingers++;

  return fingers;
}

// Results
hands.onResults((results) => {

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw Camera
  ctx.drawImage(
    results.image,
    0,
    0,
    canvas.width,
    canvas.height
  );

  if (results.multiHandLandmarks) {

    for (const landmarks of results.multiHandLandmarks) {

      drawHand(landmarks);

      // Count Fingers
      const total = countFingers(landmarks);

      // Show Text
      ctx.font = "40px Arial";
      ctx.fillStyle = "red";
      ctx.fillText(
        `Fingers: ${total}`,
        20,
        60
      );

      // Gesture Names
      let gesture = "Unknown";

      if (total === 0) {
        gesture = "Fist ✊";
      }
      else if (total === 1) {
        gesture = "Point 👆";
      }
      else if (total === 2) {
        gesture = "Peace ✌️";
      }
      else if (total === 5) {
        gesture = "Open Hand ✋";
      }

      ctx.fillStyle = "cyan";

      ctx.fillText(
        gesture,
        20,
        120
      );
    }
  }
});

// Camera Start
const camera = new Camera(video, {
  onFrame: async () => {
    await hands.send({
      image: video
    });
  },
  width: 640,
  height: 480
});

camera.start();
