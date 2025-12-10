let bird = document.getElementById("bird");
let score = 0;
let gameOver = false;
let velocity = 0;
let gravity = 0.5;
let jumpForce = -10;
let gameStarted = false;
let baseGap = 300;            // starting gap
let basePipeInterval = 2500;  // starting spawn rate
let pipeIntervalSpeed = 2500; // starting pipe interval
let minPipeInterval = 1000;   // fastest pipe spawn
let gap = 300;                 // starting pipe gap
let minGap = 150; 
let pipeTimeout; // store the next scheduled pipe

// On page load, set bird to middle but don't move until game starts
bird.style.top = "400px";
bird.style.left = "280px";

// Remove old inner elements if any
bird.innerHTML = "";

// Add beak
const beak = document.createElement("div");
beak.className = "beak";
bird.appendChild(beak);

// Add eye
const eye = document.createElement("div");
eye.className = "eye";
bird.appendChild(eye);

// Add wing
const wing = document.createElement("div");
wing.className = "wing";
bird.appendChild(wing);

// Show prompt to start game
const promptDiv = document.createElement("div");
promptDiv.textContent = "Press SPACE to start!";
promptDiv.className = "game-prompt";
document.getElementById("game").appendChild(promptDiv);

function startGame() {
  // Remove all pipes from previous game
  document.querySelectorAll('.pipe, .pipe-end').forEach(p => p.remove());

  const game = document.getElementById("game");
  game.style.display = "none";
  void game.offsetHeight; // force reflow
  game.style.display = "block";

  // Cancel any previously scheduled pipes
  if (pipeTimeout) clearTimeout(pipeTimeout);

  // Reset bird and game state
  bird.style.background = "yellow";
  gameOver = false;
  score = 0;
  velocity = 0;
  bird.style.top = "400px";
  updateScoreDisplay();
  gameStarted = true;
  promptDiv.style.display = "none";

  // Reset difficulty settings
  pipeIntervalSpeed = basePipeInterval; // reset pipe interval
  gap = baseGap;                        // reset gap

  // Start spawning pipes recursively
  scheduleNextPipe();
}


function endGame() {
  gameOver = true;
  bird.style.background = "red";
  if (window.pipeInterval) clearInterval(window.pipeInterval);
  showRestartPrompt();
}

function showRestartPrompt() {
  let restartDiv = document.getElementById("restart-div");
  if (!restartDiv) {
    restartDiv = document.createElement("div");
    restartDiv.id = "restart-div";
    restartDiv.className = "game-prompt";
    restartDiv.textContent = "Game Over! Press SPACE to restart.";
    document.getElementById("game").appendChild(restartDiv);
  }
  restartDiv.style.display = "block";
}

function hideRestartPrompt() {
  const restartDiv = document.getElementById("restart-div");
  if (restartDiv) restartDiv.style.display = "none";
}

function updateScore() {
  if (!gameOver && gameStarted) {
    score++;
    updateScoreDisplay();

    // Every 3 points → increase difficulty
    if (score % 3 === 0) {
      // Shrink gap
      gap = Math.max(minGap, gap - 30);

      // Faster pipe spawning
      pipeIntervalSpeed = Math.max(minPipeInterval, pipeIntervalSpeed - 150);
    }
  }
}


function updateScoreDisplay() {
  let scoreDiv = document.getElementById("score-div");
  if (!scoreDiv) {
    scoreDiv = document.createElement("div");
    scoreDiv.id = "score-div";
    scoreDiv.className = "score-div";
    scoreDiv.style.position = "absolute";
    scoreDiv.style.top = "24px";
    scoreDiv.style.left = "50%";
    scoreDiv.style.transform = "translateX(-50%)";
    scoreDiv.style.background = "rgba(0,0,0,0.5)";
    scoreDiv.style.color = "#fff";
    scoreDiv.style.fontSize = "2rem";
    scoreDiv.style.padding = "8px 32px";
    scoreDiv.style.borderRadius = "12px";
    scoreDiv.style.zIndex = "20";
    document.getElementById("game").appendChild(scoreDiv);
  }
  scoreDiv.textContent = `Score: ${score}`;
}

document.addEventListener("keydown", function (event) {
  if (event.code === "Space") {
    handleJump();
  }
});

document.addEventListener("click", handleJump);
document.addEventListener("touchstart", handleJump);

function handleJump() {
  if (!gameStarted) {
    startGame();
    gameLoop();
  } else if (gameOver) {
    hideRestartPrompt();
    startGame();
    gameLoop();
  } else {
    velocity = jumpForce;
    bird.style.transform = "rotate(-25deg)";
  }
}

function gameLoop() {
  if (!gameOver && gameStarted) {
    velocity += gravity;
    let birdY = bird.offsetTop + velocity;
    bird.style.top = birdY + "px";

    let angle = velocity * 4;           // scale tilt from velocity
    angle = Math.max(-25, angle);       // cap upward tilt
    angle = Math.min(90, angle);        // cap downward tilt
    bird.style.transform = `rotate(${angle}deg)`;

    // Prevent bird from going off screen
    if (birdY < 0) {
      bird.style.top = "0px";
      velocity = 0;
    }
    if (birdY > 855) {
      bird.style.top = "855px";
      endGame();
    }
    requestAnimationFrame(gameLoop);
  }
}

function scheduleNextPipe() {
  if (gameOver) return;
  createPipe();
  pipeTimeout = setTimeout(scheduleNextPipe, pipeIntervalSpeed);
}


function createPipe() {
  const game = document.getElementById("game");

  // Create elements
  const pipeTop = document.createElement("div");
  const pipeBottom = document.createElement("div");
  const pipeTopEnd = document.createElement("div");    // top pipe cap
  const pipeBottomEnd = document.createElement("div"); // bottom pipe cap

  pipeTop.className = "pipe pipe-top";
  pipeBottom.className = "pipe pipe-bottom";
  pipeTopEnd.className = "pipe-end";
pipeBottomEnd.className = "pipe-end";
  pipeTop.style.position = "absolute";
  pipeBottom.style.position = "absolute";
  pipeTopEnd.style.position = "absolute";
  pipeBottomEnd.style.position = "absolute";

  // Heights & gap
  const gapHeight = gap;
  const totalHeight = 900; 
  pipeTop.style.top = "0px";
  pipeBottom.style.bottom = "0px";

  const topHeight = Math.floor(Math.random() * 400) + 50;
  const bottomHeight = totalHeight - topHeight - gapHeight;

  pipeTop.style.height = topHeight + "px";
  pipeBottom.style.height = bottomHeight + "px";

  // Pipes start offscreen right
  pipeTop.style.left = "600px";
  pipeBottom.style.left = "600px";
  pipeTop.style.width = "60px";
  pipeBottom.style.width = "60px";

  // PIPE END INDICATORS (caps)
  const capHeight = 20; // taller
  const capExtraWidth = 10; // extend beyond pipe sides
  pipeTopEnd.style.left = (600 - capExtraWidth / 2) + "px";
  pipeTopEnd.style.top = (topHeight - capHeight) + "px"; // bottom of top pipe
  pipeTopEnd.style.width = (60 + capExtraWidth) + "px"; 
  pipeTopEnd.style.height = capHeight + "px";
  pipeTopEnd.style.background = "#228B22"; // same color as pipe
  pipeTopEnd.style.zIndex = "5";

  pipeBottomEnd.style.left = (600 - capExtraWidth / 2) + "px";
  pipeBottomEnd.style.top = (topHeight + gapHeight) + "px"; // top of bottom pipe
  pipeBottomEnd.style.width = (60 + capExtraWidth) + "px"; 
  pipeBottomEnd.style.height = capHeight + "px";
  pipeBottomEnd.style.background = "#228B22"; // same color as pipe
  pipeBottomEnd.style.zIndex = "5";

  // Add to game
  game.appendChild(pipeTop);
  game.appendChild(pipeBottom);
  game.appendChild(pipeTopEnd);
  game.appendChild(pipeBottomEnd);

  let pipeX = 600;
  let scored = false;

function movePipe() {
  if (gameOver) {
    pipeTop.remove();
    pipeBottom.remove();
    pipeTopEnd.remove();
    pipeBottomEnd.remove();
    return;
  }

  pipeX -= 2;
  pipeTop.style.left = pipeX + "px";
  pipeBottom.style.left = pipeX + "px";
  pipeTopEnd.style.left = (pipeX - capExtraWidth / 2) + "px";
  pipeBottomEnd.style.left = (pipeX - capExtraWidth / 2) + "px";

    // Collision check
    const birdRect = bird.getBoundingClientRect();
    const topRect = pipeTop.getBoundingClientRect();
    const bottomRect = pipeBottom.getBoundingClientRect();

    const hitTop =
      birdRect.right > topRect.left &&
      birdRect.left < topRect.right &&
      birdRect.top < topRect.bottom;

    const hitBottom =
      birdRect.right > bottomRect.left &&
      birdRect.left < bottomRect.right &&
      birdRect.bottom > bottomRect.top;

    if (hitTop || hitBottom) {
      endGame();
      return;
    }

    // Scoring
    if (!scored && pipeX < bird.offsetLeft) {
      scored = true;
      updateScore();
    }

    // Remove pipes if off screen
    if (pipeX + 60 > 0) {
      requestAnimationFrame(movePipe);
    } else {
      pipeTop.remove();
      pipeBottom.remove();
      pipeTopEnd.remove();
      pipeBottomEnd.remove();
    }
  }

  requestAnimationFrame(movePipe);
}

