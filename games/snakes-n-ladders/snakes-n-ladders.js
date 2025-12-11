const canvas = document.getElementById("boardCanvas");
const ctx = canvas.getContext("2d");
const boardSize = 10; // 10x10
let squareSize;

const turnDisplay = document.getElementById("turnDisplay");
const diceResult = document.getElementById("diceResult");
const rollDiceBtn = document.getElementById("rollDice");

const playerColors = ["red", "blue", "green", "orange", "purple", "yellow"];
let players = [];
let currentPlayer = 0; // index of current player

let ladders = [];

// Ask user for number of players (1-6)
let numPlayers = parseInt(prompt("Enter number of players (1-6):"));
if (isNaN(numPlayers) || numPlayers < 1) numPlayers = 2;
if (numPlayers > 6) numPlayers = 6;

// Create player objects
for (let i = 0; i < numPlayers; i++) {
  players.push({
    name: `Player ${i + 1}`,
    position: 1,
    color: playerColors[i]
  });
}

// resize canvas to fit container
function resizeCanvas() {
  const container = document.getElementById("game-container");
  const containerWidth = container.clientWidth * 0.66;
  const containerHeight = container.clientHeight;
  const size = Math.min(containerWidth, containerHeight);

  canvas.width = size;
  canvas.height = size;
  squareSize = size / boardSize;

  generateLadders();
  drawBoard();
  drawLadders();
  drawPlayers();
}

// Draw numbered squares
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

// Draw all players
function drawPlayers() {
  players.forEach(drawToken);
}

function generateLadders() {
  ladders = []; // reset every time
  const numLadders = Math.floor(Math.random() * (13 - 8 + 1)) + 8; // 8–13 ladders

  let attempts = 0;
  while (ladders.length < numLadders && attempts < 200) {
    attempts++;

    // Pick a start square between 2 and 90 (to allow space for ladder)
    let start = Math.floor(Math.random() * 89) + 2; // 2 → 90

    // Random ladder length 10–40
    const length = Math.floor(Math.random() * (40 - 10 + 1)) + 10;
    let end = start + length;

    // Check constraints:
    const bottomLadder = start <= 10;
    const topLadder = end >= 91;

    const conflict = ladders.some(l =>
      Math.abs(l.start - start) < 5 || // 5-square buffer between starts
      Math.abs(l.end - end) < 5 ||     // 5-square buffer between ends
      l.start === end ||               // no ladder starting where another ends
      l.end === start                  // no ladder ending where another starts
    );

    const bottomExists = ladders.some(l => l.start <= 10);
    const topExists = ladders.some(l => l.end >= 91);

    if (!conflict && (!bottomLadder || !bottomExists) && (!topLadder || !topExists)) {
      ladders.push({ start, end });
    }
  }

  console.log(ladders);
}

function drawLadders() {
  const ladderWidth = 10; // distance between the 2 rails
  const railCount = 2;
  const rungSpacing = 15;

  ladders.forEach(ladder => {
    // Get the center coordinates of start and end squares
    const start = getSquareCoordinates(ladder.start);
    const end = getSquareCoordinates(ladder.end);

    // Vector from start to end
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const length = Math.sqrt(dx*dx + dy*dy);
    const ux = dx / length;
    const uy = dy / length;

    // Perpendicular vector for rail width
    const px = -uy * (ladderWidth / 2);
    const py = ux * (ladderWidth / 2);

    // Draw rails
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

    // Dynamic rung count based on ladder length
    const rungCount = Math.max(2, Math.floor(length / rungSpacing));

    // Draw rungs, centered inside the squares
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
      ctx.lineWidth = 2; // optional: thinner rungs
      ctx.stroke();
    }
  });
}

// Draw single token
function drawToken(player) {
  const { x, y } = getSquareCoordinates(player.position);
  const tokenRadius = squareSize / 6; // smaller so multiple tokens fit
  const offset = tokenRadius * 2; // space tokens apart if multiple

  const index = players.indexOf(player);
  const colOffset = (index % 2) * offset - offset / 2; // 2 per row max
  const rowOffset = Math.floor(index / 2) * offset - offset / 2;

  ctx.beginPath();
  ctx.arc(x + colOffset, y + rowOffset, tokenRadius, 0, Math.PI * 2);
  ctx.fillStyle = player.color;
  ctx.fill();
  ctx.strokeStyle = "#000";
  ctx.stroke();
}

// Convert board position to canvas coordinates
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

  // Move current player
  let player = players[currentPlayer];
  player.position += roll;
  if (player.position > 100) player.position = 100;

  drawBoard();
  drawPlayers();

  // Next player's turn
  currentPlayer = (currentPlayer + 1) % players.length;
  turnDisplay.textContent = players[currentPlayer].name + "'s turn";
});

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// Initialize turn display
turnDisplay.textContent = players[currentPlayer].name + "'s turn";
