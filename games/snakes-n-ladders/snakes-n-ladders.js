const canvas = document.getElementById("boardCanvas");
const ctx = canvas.getContext("2d");
const boardSize = 10;
let squareSize;

const turnDisplay = document.getElementById("turnDisplay");
const diceResult = document.getElementById("diceResult");
const rollDiceBtn = document.getElementById("rollDice");

const playerColors = ["red", "blue", "green", "orange", "purple", "yellow"];
let players = [];
let currentPlayer = 0;

let ladders = [];
let snakes = [];

// Ask user for number of players (1-6)
let numPlayers = parseInt(prompt("Enter number of players (1-6):"));
if (isNaN(numPlayers) || numPlayers < 1) numPlayers = 2;
if (numPlayers > 6) numPlayers = 6;

// Create players
for (let i = 0; i < numPlayers; i++) {
  players.push({ name: `Player ${i + 1}`, position: 1, color: playerColors[i] });
}

// Resize canvas
function resizeCanvas() {
  const container = document.getElementById("game-container");
  const containerWidth = container.clientWidth * 0.66;
  const containerHeight = container.clientHeight;
  const size = Math.min(containerWidth, containerHeight);

  canvas.width = size;
  canvas.height = size;
  squareSize = size / boardSize;

  generateBoardObjects();
  drawBoard();
  drawLadders();
  drawSnakes();
  drawPlayers();
}

// Generate ladders and snakes safely
function generateBoardObjects() {
  ladders = [];
  snakes = [];
  const occupiedPositions = new Set();

  // --- Special snake from 99 ---
  const specialLength = Math.floor(Math.random() * (80 - 40 + 1)) + 40;
  const specialEnd = 99 - specialLength;
  snakes.push({ start: 99, end: specialEnd });
  occupiedPositions.add(99);
  occupiedPositions.add(specialEnd);

  // --- Ladders with controlled start/end zones ---
  const ladderStartZones = [
    { count: 1, min: 1, max: 20 },
    { count: 2, min: 30, max: 40 },
    { count: 2, min: 50, max: 60 }
  ];

  const usedEndBands = new Set(); // To prevent ladders ending in same band

  ladderStartZones.forEach(zone => {
    for (let i = 0; i < zone.count; i++) {
      let attempts = 0;
      while (attempts < 200) {
        attempts++;
        const start = Math.floor(Math.random() * (zone.max - zone.min + 1)) + zone.min;
        if (occupiedPositions.has(start)) continue;

        // Determine end band: divide board into 10 bands (1-10, 11-20, ..., 91-100)
        const bandOptions = Array.from({ length: 10 }, (_, b) => b + 1)
          .filter(b => !usedEndBands.has(b) && b * 10 >= start + 10); // must be above start

        if (bandOptions.length === 0) break; // no free end bands
        const chosenBand = bandOptions[Math.floor(Math.random() * bandOptions.length)];
        const endMin = Math.max(start + 10, (chosenBand - 1) * 10 + 1);
        const endMax = Math.min(start + 40, chosenBand * 10);
        if (endMin > endMax) continue;
        const end = Math.floor(Math.random() * (endMax - endMin + 1)) + endMin;

        ladders.push({ start, end });
        occupiedPositions.add(start);
        occupiedPositions.add(end);
        usedEndBands.add(chosenBand);
        break;
      }
    }
  });

  // --- Additional snakes (4–5 total including special) ---
  const totalSnakes = Math.floor(Math.random() * 2) + 4;
  const snakeAttemptsMax = 500;
  let snakeAttempts = 0;

  while (snakes.length < totalSnakes && snakeAttempts < snakeAttemptsMax) {
    snakeAttempts++;
    const start = Math.floor(Math.random() * 80) + 11;
    const length = Math.floor(Math.random() * (40 - 10 + 1)) + 10;
    const end = start - length;
    if (end <= 0) continue;
    if (occupiedPositions.has(start) || occupiedPositions.has(end)) continue;
    if (ladders.some(l => l.start === start || l.end === start || l.start === end || l.end === end)) continue;

    snakes.push({ start, end });
    occupiedPositions.add(start);
    occupiedPositions.add(end);
  }
}

// Draw board
function drawBoard() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 1;
  ctx.font = `${squareSize / 4}px Arial`;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";

  let number = 1;
  for (let row = boardSize - 1; row >= 0; row--) {
    const isEvenRow = (boardSize - 1 - row) % 2 === 0;
    for (let col = 0; col < boardSize; col++) {
      const x = isEvenRow ? col * squareSize : (boardSize - 1 - col) * squareSize;
      const y = row * squareSize;

      ctx.fillStyle = "#fff";
      ctx.fillRect(x, y, squareSize, squareSize);
      ctx.strokeRect(x, y, squareSize, squareSize);

      ctx.fillStyle = "#000";
      ctx.fillText(number, x + 5, y + 5);
      number++;
    }
  }
}

// Draw ladders
function drawLadders() {
  const ladderWidth = 10;
  const railCount = 2;
  const rungSpacing = 15;

  ladders.forEach(ladder => {
    const start = getSquareCoordinates(ladder.start);
    const end = getSquareCoordinates(ladder.end);

    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    const px = -dy / length * (ladderWidth / 2);
    const py = dx / length * (ladderWidth / 2);

    for (let i = 0; i < railCount; i++) {
      const t = i / (railCount - 1);
      const offsetX = px * (1 - 2 * t);
      const offsetY = py * (1 - 2 * t);

      ctx.beginPath();
      ctx.moveTo(start.x + offsetX, start.y + offsetY);
      ctx.lineTo(end.x + offsetX, end.y + offsetY);
      ctx.strokeStyle = "green";
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    const rungCount = Math.max(2, Math.floor(length / rungSpacing));
    for (let i = 1; i < rungCount; i++) {
      const t = i / rungCount;
      const rungStartX = start.x + dx * t + px;
      const rungStartY = start.y + dy * t + py;
      const rungEndX = start.x + dx * t - px;
      const rungEndY = start.y + dy * t - py;

      ctx.beginPath();
      ctx.moveTo(rungStartX, rungStartY);
      ctx.lineTo(rungEndX, rungEndY);
      ctx.strokeStyle = "green";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  });
}

// Draw snakes
function drawSnakes() {
  snakes.forEach(snake => {
    const start = getSquareCoordinates(snake.start);
    const end = getSquareCoordinates(snake.end);

    ctx.strokeStyle = "red";
    ctx.lineWidth = squareSize / 12;
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();

    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(start.x, start.y, squareSize / 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;
    ctx.stroke();
  });
}

// Draw players
function drawPlayers() {
  players.forEach(drawToken);
}

function drawToken(player) {
  const { x, y } = getSquareCoordinates(player.position);
  const tokenRadius = squareSize / 6;
  const offset = tokenRadius * 2;

  const index = players.indexOf(player);
  const colOffset = (index % 2) * offset - offset / 2;
  const rowOffset = Math.floor(index / 2) * offset - offset / 2;

  ctx.beginPath();
  ctx.arc(x + colOffset, y + rowOffset, tokenRadius, 0, Math.PI * 2);
  ctx.fillStyle = player.color;
  ctx.fill();
  ctx.strokeStyle = "#000";
  ctx.stroke();
}

// Convert position to canvas coordinates
function getSquareCoordinates(position) {
  const row = Math.floor((position - 1) / 10);
  const col = (row % 2 === 0)
    ? (position - 1) % 10
    : 9 - ((position - 1) % 10);

  const x = col * squareSize + squareSize / 2;
  const y = (9 - row) * squareSize + squareSize / 2;
  return { x, y };
}

// Dice roll
rollDiceBtn.addEventListener("click", () => {
  const roll = Math.floor(Math.random() * 6) + 1;
  diceResult.textContent = "Dice: " + roll;

  const player = players[currentPlayer];
  player.position += roll;
  if (player.position > 100) player.position = 100;

  drawBoard();
  drawLadders();
  drawSnakes();
  drawPlayers();

  currentPlayer = (currentPlayer + 1) % players.length;
  turnDisplay.textContent = players[currentPlayer].name + "'s turn";
});

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

turnDisplay.textContent = players[currentPlayer].name + "'s turn";
