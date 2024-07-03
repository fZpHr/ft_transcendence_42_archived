const canvas = document.getElementById('pongCanvas');
const context = canvas.getContext('2d');

const paddleWidth = 10;
const paddleHeight = 100;
const ballSize = 10;

let leftPaddleY = canvas.height / 2 - paddleHeight / 2;
let rightPaddleY = canvas.height / 2 - paddleHeight / 2;
let ballX = canvas.width / 2;
let ballY = canvas.height / 2;
let ballSpeedX = 6;
let ballSpeedY = 3;
let sensitivity = 20;

let rightMove = 0;
let leftMove = 0;

function drawRect(x, y, width, height, color) {
    context.fillStyle = color;
    context.fillRect(x, y, width, height);
}

function update() {
    ballX += ballSpeedX;
    ballY += ballSpeedY;

    if (ballY <= 0 || ballY + ballSize >= canvas.height) {
        ballSpeedY = -ballSpeedY;
    }
    if (ballX <= paddleWidth && ballY + ballSize >= leftPaddleY && ballY <= leftPaddleY + paddleHeight) {
        ballSpeedX = -ballSpeedX;
    }
    if (ballX + ballSize >= canvas.width - paddleWidth && ballY + ballSize >= rightPaddleY && ballY <= rightPaddleY + paddleHeight) {
        ballSpeedX = -ballSpeedX;
    }

    if (rightMove == -1)
        rightPaddleY = rightPaddleY - sensitivity >= 0 ? rightPaddleY - sensitivity : 0;
    else if (rightMove == 1)
        rightPaddleY = rightPaddleY + sensitivity + paddleHeight <= canvas.height ? rightPaddleY + sensitivity : canvas.height - paddleHeight;

    if (leftMove == -1)
        leftPaddleY = leftPaddleY - sensitivity >= 0 ? leftPaddleY - sensitivity : 0;
    else if (leftMove == 1)
        leftPaddleY = leftPaddleY + sensitivity + paddleHeight <= canvas.height ? leftPaddleY + sensitivity : canvas.height - paddleHeight;

    if (ballX <= 0 || ballX + ballSize >= canvas.width) {
        ballX = canvas.width / 2;
        ballY = canvas.height / 2;
    }
}

function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawRect(0, leftPaddleY, paddleWidth, paddleHeight, 'white');
    drawRect(canvas.width - paddleWidth, rightPaddleY, paddleWidth, paddleHeight, 'white');
    drawRect(ballX, ballY, ballSize, ballSize, 'white');
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

document.addEventListener('keydown', async function (event) {
    switch (event.key) {
        case "ArrowDown":
            rightMove = 1;
            break;
        case "ArrowUp":
            rightMove = -1;
            break;
        case "w":
            leftMove = -1;
            break;
        case "s":
            leftMove = 1;
            break;
        default:
            return;
    }
    event.preventDefault();
});

document.addEventListener('keyup', async function (event){
    switch(event.key){
        case "ArrowDown":
            rightMove = 0;
            break;
        case "ArrowUp":
            rightMove = 0;
            break;
        case "w":
            leftMove = 0;
            break;
        case "s":
            leftMove = 0;
            break;
        default:
            return;
    }
    event.preventDefault();
});

gameLoop();
