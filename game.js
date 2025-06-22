// Responsive Pong Game with Touch and Mouse Support

const canvas = document.getElementById('pong');
const ctx = canvas.getContext('2d');

// Base dimensions for scaling
const BASE_WIDTH = 800;
const BASE_HEIGHT = 500;
let scale = 1;

// Game constants (relative to base size)
const PADDLE_WIDTH = 15;
const PADDLE_HEIGHT = 100;
const BALL_SIZE = 16;
const PLAYER_X = 20;
const AI_X = BASE_WIDTH - 20 - PADDLE_WIDTH;
const AI_SPEED = 5;

// State
let playerY = (BASE_HEIGHT - PADDLE_HEIGHT) / 2;
let aiY = (BASE_HEIGHT - PADDLE_HEIGHT) / 2;
let ballX = BASE_WIDTH / 2 - BALL_SIZE / 2;
let ballY = BASE_HEIGHT / 2 - BALL_SIZE / 2;
let ballSpeedX = Math.random() > 0.5 ? 5 : -5;
let ballSpeedY = (Math.random() - 0.5) * 8;
let playerScore = 0;
let aiScore = 0;

// Responsive canvas
function resizeCanvas() {
    // Use the available container size
    const container = document.querySelector(".canvas-container");
    const maxWidth = container.clientWidth;
    const maxHeight = container.clientHeight;

    // Maintain aspect ratio
    let width = maxWidth;
    let height = width * (BASE_HEIGHT / BASE_WIDTH);
    if (height > maxHeight) {
        height = maxHeight;
        width = height * (BASE_WIDTH / BASE_HEIGHT);
    }

    canvas.width = width;
    canvas.height = height;
    scale = width / BASE_WIDTH;
}
window.addEventListener('resize', resizeCanvas);
window.addEventListener('orientationchange', resizeCanvas);
resizeCanvas();

// Drawing helpers (with scaling)
function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * scale, y * scale, w * scale, h * scale);
}

function drawCircle(x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x * scale, y * scale, r * scale, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
}

function drawText(text, x, y, size = 36) {
    ctx.fillStyle = "#fff";
    ctx.font = `${size * scale}px Arial`;
    ctx.fillText(text, x * scale, y * scale);
}

function drawNet() {
    for (let i = 0; i < BASE_HEIGHT; i += 30) {
        drawRect(BASE_WIDTH / 2 - 1, i, 2, 18, "#fff");
    }
}

function render() {
    drawRect(0, 0, BASE_WIDTH, BASE_HEIGHT, "#111");
    drawNet();
    drawRect(PLAYER_X, playerY, PADDLE_WIDTH, PADDLE_HEIGHT, "#fff");
    drawRect(AI_X, aiY, PADDLE_WIDTH, PADDLE_HEIGHT, "#fff");
    drawCircle(ballX + BALL_SIZE / 2, ballY + BALL_SIZE / 2, BALL_SIZE / 2, "#f9d923");
    drawText(playerScore, BASE_WIDTH / 2 - 60, 50);
    drawText(aiScore, BASE_WIDTH / 2 + 35, 50);
}

// Game logic
function resetBall() {
    ballX = BASE_WIDTH / 2 - BALL_SIZE / 2;
    ballY = BASE_HEIGHT / 2 - BALL_SIZE / 2;
    ballSpeedX = Math.random() > 0.5 ? 5 : -5;
    ballSpeedY = (Math.random() - 0.5) * 8;
}

function update() {
    // Move ball
    ballX += ballSpeedX;
    ballY += ballSpeedY;

    // Top and bottom collision
    if (ballY <= 0) {
        ballY = 0;
        ballSpeedY *= -1;
    } else if (ballY + BALL_SIZE >= BASE_HEIGHT) {
        ballY = BASE_HEIGHT - BALL_SIZE;
        ballSpeedY *= -1;
    }

    // Left paddle collision
    if (
        ballX <= PLAYER_X + PADDLE_WIDTH &&
        ballY + BALL_SIZE >= playerY &&
        ballY <= playerY + PADDLE_HEIGHT
    ) {
        ballX = PLAYER_X + PADDLE_WIDTH;
        ballSpeedX *= -1;
        let collidePoint = (ballY + BALL_SIZE / 2) - (playerY + PADDLE_HEIGHT / 2);
        collidePoint = collidePoint / (PADDLE_HEIGHT / 2);
        ballSpeedY = collidePoint * 6;
    }

    // Right paddle collision (AI)
    if (
        ballX + BALL_SIZE >= AI_X &&
        ballY + BALL_SIZE >= aiY &&
        ballY <= aiY + PADDLE_HEIGHT
    ) {
        ballX = AI_X - BALL_SIZE;
        ballSpeedX *= -1;
        let collidePoint = (ballY + BALL_SIZE / 2) - (aiY + PADDLE_HEIGHT / 2);
        collidePoint = collidePoint / (PADDLE_HEIGHT / 2);
        ballSpeedY = collidePoint * 6;
    }

    // Score
    if (ballX < 0) {
        aiScore++;
        resetBall();
    }
    if (ballX + BALL_SIZE > BASE_WIDTH) {
        playerScore++;
        resetBall();
    }

    // Move AI paddle (basic AI)
    let aiCenter = aiY + PADDLE_HEIGHT / 2;
    if (ballY + BALL_SIZE / 2 < aiCenter - 10) {
        aiY -= AI_SPEED;
    } else if (ballY + BALL_SIZE / 2 > aiCenter + 10) {
        aiY += AI_SPEED;
    }
    aiY = Math.max(0, Math.min(BASE_HEIGHT - PADDLE_HEIGHT, aiY));
}

// Mouse control for left paddle
canvas.addEventListener('mousemove', function (evt) {
    const rect = canvas.getBoundingClientRect();
    let mouseY = ((evt.clientY - rect.top) / rect.height) * BASE_HEIGHT;
    playerY = mouseY - PADDLE_HEIGHT / 2;
    playerY = Math.max(0, Math.min(BASE_HEIGHT - PADDLE_HEIGHT, playerY));
});

// Touch support for mobile/Android
canvas.addEventListener('touchstart', handleTouch);
canvas.addEventListener('touchmove', handleTouch);

function handleTouch(evt) {
    evt.preventDefault();
    if (evt.touches.length > 0) {
        const rect = canvas.getBoundingClientRect();
        let touchY = ((evt.touches[0].clientY - rect.top) / rect.height) * BASE_HEIGHT;
        playerY = touchY - PADDLE_HEIGHT / 2;
        playerY = Math.max(0, Math.min(BASE_HEIGHT - PADDLE_HEIGHT, playerY));
    }
}

// Main loop
function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

gameLoop();