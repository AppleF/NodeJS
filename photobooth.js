// photobooth.js
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Folder where images will be saved
const photoDir = path.join(__dirname, 'photobooth');

// Ensure folder exists
async function ensurePhotoDir() {
  try {
    await mkdir(photoDir, { recursive: true });
  } catch (err) {
    console.error("Error creating photo directory:", err);
  }
}

export async function handlePhotoBooth(req, res) {

  // Serve the page
  if (req.method === 'GET' && req.url === '/photobooth') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(getPhotoBoothHTML());
    return;
  }

  // Handle image upload
  if (req.method === 'POST' && req.url === '/photobooth/upload') {

    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        await ensurePhotoDir();

        const { image } = JSON.parse(body);

        const base64Data = image.replace(/^data:image\/png;base64,/, '');

        const fileName = `photo-${Date.now()}.png`;
        const filePath = path.join(photoDir, fileName);

        await writeFile(filePath, base64Data, 'base64');

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));

      } catch (err) {
        console.error(err);
        res.writeHead(500);
        res.end('Error saving image');
      }
    });

    return;
  }

  res.writeHead(404);
  res.end();
}

function getPhotoBoothHTML() {
  return `
<!DOCTYPE html>
<html>
<head>
  <title>Photo Booth</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      margin:0;
      font-family:Segoe UI, sans-serif;
      background:#111;
      color:white;
      display:flex;
      flex-direction:column;
      align-items:center;
      justify-content:center;
      height:100vh;
    }

    h1 {
      margin-bottom:20px;
    }

    .camera-container {
      width:700px;
      max-width:90%;
      aspect-ratio:16/9;
      background:black;
      border-radius:20px;
      overflow:hidden;
      box-shadow:0 0 40px rgba(0,0,0,0.6);
      display:flex;
      align-items:center;
      justify-content:center;
    }

    video {
      width:100%;
      height:100%;
      object-fit:cover;
    }

    canvas {
      display:none;
    }

    .controls {
      margin-top:30px;
      display:flex;
      gap:20px;
      flex-wrap:wrap;
      justify-content:center;
    }

    button {
      border:none;
      padding:15px 25px;
      border-radius:50px;
      font-size:16px;
      cursor:pointer;
      font-weight:bold;
      transition:0.3s;
    }

    .activate-btn { background:#4fc3f7; color:black; }
    .disable-btn { background:#9e9e9e; color:black; }

    .capture-btn {
      width:70px;
      height:70px;
      border-radius:50%;
      background:#ff5252;
      font-size:28px;
      display:flex;
      align-items:center;
      justify-content:center;
    }

    button:disabled {
      opacity:0.4;
      cursor:not-allowed;
      transform:none !important;
      box-shadow:none !important;
    }

    .message {
      margin-top:20px;
      font-weight:600;
      min-height:24px;
    }

    .status-info { color:#4fc3f7; }
    .status-success { color:#4caf50; }
    .status-error { color:#ff5252; }
  </style>
</head>
<body>

  <h1>Photo Booth</h1>

  <div class="camera-container">
    <video id="video" autoplay playsinline></video>
  </div>

  <canvas id="canvas"></canvas>

  <div class="controls">
    <button id="activateBtn" class="activate-btn" onclick="startCamera()">Activate Webcam</button>
    <button id="deactivateBtn" class="disable-btn" onclick="stopCamera()" disabled>Deactivate Webcam</button>
    <button id="captureBtn" class="capture-btn" onclick="takePhoto()" disabled>📷</button>
  </div>

  <div class="message" id="message"></div>

<script>
  const video = document.getElementById('video');
  const canvas = document.getElementById('canvas');
  const message = document.getElementById('message');

  const activateBtn = document.getElementById('activateBtn');
  const deactivateBtn = document.getElementById('deactivateBtn');
  const captureBtn = document.getElementById('captureBtn');

  let currentStream = null;
  let statusTimeout = null;

  function updateStatus(text, type = "info") {
    message.className = "message status-" + type;
    message.textContent = text;

    clearTimeout(statusTimeout);
    statusTimeout = setTimeout(() => {
      message.textContent = "";
      message.className = "message";
    }, 4000);
  }

  async function startCamera() {
    try {
      updateStatus("Activating webcam...", "info");

      currentStream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = currentStream;

      activateBtn.disabled = true;
      deactivateBtn.disabled = false;
      captureBtn.disabled = false;

      updateStatus("Webcam activated", "success");
    } catch (err) {
      updateStatus("Could not access webcam", "error");
    }
  }

  function stopCamera() {
    if (!currentStream) {
      updateStatus("Webcam is not active", "error");
      return;
    }

    currentStream.getTracks().forEach(track => track.stop());
    video.srcObject = null;
    currentStream = null;

    activateBtn.disabled = false;
    deactivateBtn.disabled = true;
    captureBtn.disabled = true;

    updateStatus("Webcam deactivated", "info");
  }

  async function takePhoto() {
    if (!video.srcObject) {
      updateStatus("Activate webcam first!", "error");
      return;
    }

    updateStatus("Capturing photo...", "info");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0);

    const imageData = canvas.toDataURL('image/png');

    updateStatus("Uploading photo...", "info");

    try {
      const response = await fetch('/photobooth/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageData })
      });

      if (response.ok) {
        updateStatus("Photo saved successfully!", "success");
      } else {
        updateStatus("Error saving photo.", "error");
      }
    } catch (err) {
      updateStatus("Upload failed.", "error");
    }
  }
</script>

</body>
</html>
`;
}