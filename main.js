
// Grab ref to canvas
var canvas = document.getElementById("canvas");

// Create 2D context
var ctx = canvas.getContext("2d");

const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContext();
let masterGain = null;
let noteFreq = 580;
masterGain = audioContext.createGain();
masterGain.gain.value = 0.1;
masterGain.connect(audioContext.destination);


// Ball coordinates
var x = canvas.width / 2;
var y = canvas.height - 30;

// coordinates change factor
var dx = 1;
var dy = -1;

var ballRadius = 8;
var ballColor = "white"

var paddleHeight = 10;
var paddleWidth = 75;
// Starting point of the paddle on the x axis
var paddleX = (canvas.width - paddleWidth) / 2;

var rightPressed = false;
var leftPressed = false;

var brickRowCount = 3;
var brickColumnCount = 5;
var brickWidth = 75;
var brickHeight = 20;
var brickPadding = 10;
var brickOffsetTop = 30;
var brickOffsetLeft = 30;

var score = 0;
var lives = 3;

var bricks = [];
for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < brickRowCount; r++) {
        bricks[c][r] = {x: 0, y: 0, status: 1};
    }
}

// When keydown event fires, keyDownHandler is executed
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
document.addEventListener("mousemove", mouseMoveHandler, false);

function playNote(freq) {
    let osc = audioContext.createOscillator();
    osc.connect(masterGain);
    osc.type = "triangle";
    osc.frequency.value = freq;
    osc.start();
    osc.stop(audioContext.currentTime + 0.05);
}

function mouseMoveHandler(e) {
    var relativeX = e.clientX - canvas.offsetLeft;
    if(relativeX > 0 && relativeX < canvas.width) {
        paddleX = relativeX - paddleWidth / 2;
    }
}

function keyDownHandler(e) {
    if(e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = true;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = true;
    }
}

function keyUpHandler(e) {
    if(e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = false;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = false;
    }
}

function collisionDetection() {
    for(let c = 0; c < brickColumnCount; c++) {
        for(let r = 0; r < brickRowCount; r++) {
            let b = bricks[c][r];
            if(b.status === 1) {
                if(x > b.x && x < b.x + brickWidth && y > b.y  && y < b.y + brickHeight + ballRadius) {
                    dy = -dy;
                    b.status = 0;
                    changeBallColor();
                    playNote(900);
                    score++;
                    if(score === brickRowCount * brickColumnCount) {
                        alert("You win");
                        document.location.reload();
                    }
                }
            }
        }
    }
}

function drawScore() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#FB989A";
    ctx.fillText("Score : " + score, 8, 20);
}

function drawLives() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#FB989A";
    ctx.fillText("Lives : " + lives, canvas.width - 65, 20);
}

function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if(bricks[c][r].status === 1) {
                var brickX = (c*(brickWidth + brickPadding)) + brickOffsetLeft;
                var brickY = (r*(brickHeight + brickPadding)) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                ctx.fillStyle = "white";
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

function changeBallColor() {
    let hexNum = Math.floor(Math.random() * 16777215).toString(16);
    ballColor = "#" + hexNum.toString();
}

function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.closePath();
}

function drawBall() {
    ctx.beginPath();
    // draws a circle
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);

    // fills the circle with white
    ctx.fillStyle = ballColor;
    ctx.fill();

    ctx.closePath();
}

function draw() {

    // clears the canvas so that the circle doesn't leave a trail behind
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBricks();
    drawBall();
    drawPaddle();
    drawScore();
    drawLives();
    collisionDetection();

    // updates position
    x += dx;
    y += dy;

    // makes ball bounce off the walls

    if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) { // side walls
        dx = -dx ;
        changeBallColor();
    }

    if(y + dy < ballRadius) { // top wall
        dy = -dy;
        changeBallColor();
    } else if (y + dy > (canvas.height - paddleHeight) - ballRadius) {
        if(x > paddleX && x < paddleX + paddleWidth) { // if x coordinates of ball is superior to left edge of paddle, or inferior to right edge of paddle, then change ball direction to opposite
            dy = -dy*1.1;
            playNote(noteFreq);
        } else {
            lives--;
            if(!lives) {
                alert("Game Over");
                document.location.reload();
            } else {
                x = canvas.width / 2;
                y = canvas.height - 30;
                dx = 2;
                dy = -2;
                paddleX = (canvas.width - paddleWidth) / 2;
            }

        }
    }

    if(rightPressed) {
        paddleX += 5;
        if(paddleX + paddleWidth > canvas.width) {
            paddleX = canvas.width - paddleWidth;
        }
    } else if (leftPressed) {
        paddleX -= 5;
        if(paddleX < 0) {
            paddleX = 0;
        }
    }

    requestAnimationFrame(draw);
}

console.log(canvas.offsetLeft);

draw();


