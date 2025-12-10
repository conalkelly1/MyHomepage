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
  window.pipeInterval = setInterval(createPipe, 2500);
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
  const game = document.getElementById("game");

  // Create elements
  const pipeTop = document.createElement("div");
  const pipeBottom = document.createElement("div");
  pipeTop.className = "pipe pipe-top";
  pipeBottom.className = "pipe pipe-bottom";
  pipeTop.style.position = "absolute";
  pipeBottom.style.position = "absolute";

  // DYNAMIC HEIGHTS + GAP
  const gapHeight = 300; // adjust this to change difficulty
  const totalHeight = 900; // total pipe area (top + gap + bottom)

  pipeTop.style.top = "0px";
  pipeBottom.style.bottom = "0px";

  // random top height between 50 and 450
  const topHeight = Math.floor(Math.random() * 400) + 50;

  // bottom height = whatever is left after top + gap
  const bottomHeight = totalHeight - topHeight - gapHeight;

// Apply styling
pipeTop.style.height = topHeight + "px";
pipeBottom.style.height = bottomHeight + "px";
  // Start pipes offscreen right
  pipeTop.style.left = "600px";
  pipeBottom.style.left = "600px";

  pipeTop.style.width = "60px";
  pipeBottom.style.width = "60px";

  // Add to game
  game.appendChild(pipeTop);
  game.appendChild(pipeBottom);

  // movement variables
  let pipeX = 600;
  let scored = false;

  function movePipe() {
    if (gameOver) return;

    // Move left
    pipeX -= 2;
    pipeTop.style.left = pipeX + "px";
    pipeBottom.style.left = pipeX + "px";

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

    // Scoring (bird passes pipe)
    if (!scored && pipeX + 60 < bird.offsetLeft) {
      scored = true;
      updateScore();
    }

    // Remove pipe if off screen
    if (pipeX + 60 > 0) {
      requestAnimationFrame(movePipe);
    } else {
      pipeTop.remove();
      pipeBottom.remove();
    }
  }

  requestAnimationFrame(movePipe);
}