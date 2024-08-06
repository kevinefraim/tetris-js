// Import CSS file
import "./style.css";

// Import constants
import { BOARD_WIDTH, BLOCK_SIZE, BOARD_HEIGHT, PIECES } from "./consts";

// Initialize the canvas
const canvas = document.querySelector("canvas");
const context = canvas.getContext("2d");
const $score = document.getElementById("score");

// Initialize score
let score = 0;

// Set canvas dimensions
canvas.width = BLOCK_SIZE * BOARD_WIDTH;
canvas.height = BLOCK_SIZE * BOARD_HEIGHT;

// Scale the context
context.scale(BLOCK_SIZE, BLOCK_SIZE);

// Create the game board
const board = createBoard(BOARD_WIDTH, BOARD_HEIGHT);

// Create the player's piece
let piece = getRandomPiece();

function getRandomPiece() {
  const randomIndex = Math.floor(Math.random() * PIECES.length);
  const randomPiece = PIECES[randomIndex];
  const randomX = Math.floor(
    Math.random() * (BOARD_WIDTH - randomPiece[0].length + 1)
  );
  return {
    position: { x: randomX, y: 0 },
    shape: randomPiece,
  };
}

// Function to create the game board
function createBoard(width, height) {
  return Array(height)
    .fill()
    .map(() => Array(width).fill(0));
}

// Game loop
let dropCounter = 0;
let lastTime = 0;
function update(time = 0) {
  const deltaTime = time - lastTime;
  lastTime = time;
  dropCounter += deltaTime;
  if (dropCounter > 500) {
    piece.position.y++;
    dropCounter = 0;

    if (checkCollision()) {
      piece.position.y--;
      solidifyPiece();
      removeRows();
    }
  }
  draw();
  window.requestAnimationFrame(update);
}

// Function to draw the game
function draw() {
  context.fillStyle = "#000";
  context.fillRect(0, 0, canvas.width, canvas.height);
  drawBoard();
  drawPiece();
  $score.innerText = score;
}

// Function to draw the game board
function drawBoard() {
  board.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value === 1) {
        context.fillStyle = "yellow";
        context.fillRect(x, y, 1, 1);
      }
    });
  });
}

// Function to draw the player's piece
function drawPiece() {
  piece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        context.fillStyle = "red";
        context.fillRect(x + piece.position.x, y + piece.position.y, 1, 1);
      }
    });
  });
}

// Event listener for keyboard input
document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") {
    movePiece(-1, 0);
  }
  if (event.key === "ArrowRight") {
    movePiece(1, 0);
  }
  if (event.key === "ArrowDown") {
    movePiece(0, 1);
  }
  if (event.key === "ArrowUp") {
    rotatePiece();
  }
});

// Function to move the player's piece
function movePiece(deltaX, deltaY) {
  piece.position.x += deltaX;
  piece.position.y += deltaY;
  if (checkCollision()) {
    piece.position.x -= deltaX;
    piece.position.y -= deltaY;
  }
}

// Function to rotate the player's piece
function rotatePiece() {
  const rotated = [];
  for (let i = 0; i < piece.shape[0].length; i++) {
    const row = [];
    for (let j = piece.shape.length - 1; j >= 0; j--) {
      row.push(piece.shape[j][i]);
    }
    rotated.push(row);
  }
  const previousShape = piece.shape;
  piece.shape = rotated;
  if (checkCollision()) {
    piece.shape = previousShape;
  }
}

// Function to check for collisions
function checkCollision() {
  return piece.shape.find((row, y) => {
    return row.find((value, x) => {
      return (
        value !== 0 && board[y + piece.position.y]?.[x + piece.position.x] !== 0
      );
    });
  });
}

// Function to solidify the player's piece
function solidifyPiece() {
  piece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value === 1) {
        board[y + piece.position.y][x + piece.position.x] = 1;
      }
    });
  });

  piece = getRandomPiece();

  if (checkCollision()) {
    window.alert("Game over!! Sorry!");
    board.forEach((row) => row.fill(0));
  }
}

// Function to remove completed rows
function removeRows() {
  const rowsToRemove = [];
  board.forEach((row, y) => {
    if (row.every((value) => value === 1)) {
      rowsToRemove.push(y);
    }
  });

  rowsToRemove.forEach((y) => {
    board.splice(y, 1);
    const newRow = Array(BOARD_WIDTH).fill(0);
    board.unshift(newRow);
    score += 10;
  });
}

// Start the game loop
update();
