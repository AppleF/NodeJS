// flappybird.js

export async function handleFlappyBird(req, res) {
  if (req.method !== 'GET') {
    res.writeHead(405);
    res.end('Method not allowed');
    return;
  }

  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(getFlappyBirdHTML());
}

function getFlappyBirdHTML() {
  return `
<!DOCTYPE html>
<html>
<head>
  <title>Flappy Bird</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      margin:0;
      background: linear-gradient(#70c5ce, #ffffff);
      display:flex;
      justify-content:center;
      align-items:center;
      height:100vh;
      font-family:sans-serif;
      overflow:hidden;
    }

    canvas {
      background:#70c5ce;
      border:4px solid #333;
      border-radius:10px;
    }

    .info {
      position:absolute;
      top:20px;
      font-size:20px;
      font-weight:bold;
      color:#333;
    }

    .back-btn {
      position:absolute;
      bottom:20px;
      padding:10px 20px;
      border-radius:20px;
      border:none;
      cursor:pointer;
      background:#333;
      color:#fff;
    }
  </style>
</head>
<body>

<div class="info">Click or Press Space to Jump</div>
<button class="back-btn" onclick="location.href='/'">Back Home</button>
<canvas id="game" width="1200" height="600"></canvas>

<script>
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let birdY = 300;
let velocity = 0;
let gravity = 0.4;
let lift = -6;

let pipes = [];
let frame = 0;
let score = 0;
let gameOver = false;

function resetGame() {
  birdY = 300;
  velocity = 0;
  pipes = [];
  frame = 0;
  score = 0;
  gameOver = false;
}

function drawBird() {
  ctx.fillStyle = "yellow";
  ctx.beginPath();
  ctx.arc(80, birdY, 15, 0, Math.PI * 2);
  ctx.fill();
}

function drawPipes() {
  ctx.fillStyle = "green";
  pipes.forEach(pipe => {
    ctx.fillRect(pipe.x, 0, 50, pipe.top);
    ctx.fillRect(pipe.x, pipe.bottom, 50, canvas.height - pipe.bottom);
  });
}

function updatePipes() {
  if (frame % 90 === 0) {
    let top = Math.random() * 300 + 50;
    let gap = 150;
    pipes.push({
      x: canvas.width,
      top: top,
      bottom: top + gap
    });
  }

  pipes.forEach(pipe => {
    pipe.x -= 2;

    if (
      80 + 15 > pipe.x &&
      80 - 15 < pipe.x + 50 &&
      (birdY - 15 < pipe.top || birdY + 15 > pipe.bottom)
    ) {
      gameOver = true;
    }

    if (pipe.x === 78) score++;
  });

  pipes = pipes.filter(pipe => pipe.x > -50);
}

function drawScore() {
  ctx.fillStyle = "#000";
  ctx.font = "24px Arial";
  ctx.fillText("Score: " + score, 10, 30);
}

function update() {
  if (gameOver) {
    ctx.fillStyle = "red";
    ctx.font = "40px Arial";
    ctx.fillText("Game Over", 100, 300);
    ctx.font = "20px Arial";
    ctx.fillText("Click to Restart", 120, 340);
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  velocity += gravity;
  birdY += velocity;

  if (birdY + 15 > canvas.height || birdY - 15 < 0) {
    gameOver = true;
  }

  updatePipes();
  drawPipes();
  drawBird();
  drawScore();

  frame++;
  requestAnimationFrame(update);
}

document.addEventListener("click", () => {
  if (gameOver) {
    resetGame();
    update();
  } else {
    velocity = lift;
  }
});

document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    if (gameOver) {
      resetGame();
      update();
    } else {
      velocity = lift;
    }
  }
});

update();
</script>

</body>
</html>
`;
}