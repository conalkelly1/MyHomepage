let bird = document.getElementById("bird");
let score = 0;
let gameOver = false;
let velocity = 0;
let gravity = 0.5;
let jumpForce = -10;
let gameStarted = false;

// On page load, set bird to middle but don't move until game starts
bird.style.top = "400px";

// Show prompt to start game
const promptDiv = document.createElement("div");
promptDiv.textContent = "Press SPACE to start!";
promptDiv.className = "game-prompt";
document.getElementById("game").appendChild(promptDiv);

function startGame() {
  // Remove all pipes from previous game
  document.querySelectorAll('.pipe').forEach(pipe => pipe.remove());
  bird.style.background = "yellow";
  gameOver = false;
  score = 0;
  velocity = 0;
  bird.style.top = "400px";
  updateScoreDisplay();
  gameStarted = true;
  promptDiv.style.display = "none";
  // Start pipe interval
  if (window.pipeInterval) clearInterval(window.pipeInterval);
  window.pipeInterval = setInterval(createPipe, 1800);
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
    if (!gameStarted) {
      startGame();
      gameLoop();
    } else if (gameOver) {
      hideRestartPrompt();
      startGame();
      gameLoop();
    } else {
      velocity = jumpForce;
    }
  }
});

function gameLoop() {
  if (!gameOver && gameStarted) {
    velocity += gravity;
    let birdY = bird.offsetTop + velocity;
    bird.style.top = birdY + "px";
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

function createPipe() {
  const pipeTop = document.createElement("div");
  const pipeBottom = document.createElement("div");
  pipeTop.className = "pipe pipe-top";
  pipeBottom.className = "pipe pipe-bottom";

  // Fixed gap and pipe heights
  const gapHeight = 200;
  const topHeight = 300;
  const bottomHeight = 400;

  pipeTop.style.height = topHeight + "px";
  pipeBottom.style.height = bottomHeight + "px";
  pipeTop.style.top = "0px";
  pipeBottom.style.bottom = "0px";
  pipeTop.style.right = "-60px";
  pipeBottom.style.right = "-60px";
  pipeTop.style.width = "60px";
  pipeBottom.style.width = "60px";

  document.getElementById("game").appendChild(pipeTop);
  document.getElementById("game").appendChild(pipeBottom);

  let pipeX = -60;
  let scored = false;
  function movePipe() {
    if (gameOver) return;
    pipeX += 2;
    pipeTop.style.right = pipeX + "px";
    pipeBottom.style.right = pipeX + "px";
    // Scoring: when pipe passes bird's left edge
    if (!scored && pipeX > (600 - 75 - 60)) {
      scored = true;
      updateScore();
    }
    if (pipeX < 600) {
      requestAnimationFrame(movePipe);
    } else {
      pipeTop.remove();
      pipeBottom.remove();
    }
  }
  requestAnimationFrame(movePipe);
}