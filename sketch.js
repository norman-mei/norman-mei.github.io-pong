let player1Score = 0;
let player2Score = 0;

let ball;
let player1;
let player2;

let gameState = "start";

let fontRetro;
let ponghit, pongbounce, pongscore;

let servingPlayer;
let messageTimer = null;

function preload() {
  fontRetro = loadFont("font.ttf");
  ponghit = loadSound("ponghit.wav");
  pongbounce = loadSound("pongbounce.wav");
  pongscore = loadSound("pongscore.wav");
}

function setup() {
  createCanvas(800, 500);
  ball = new Ball();
  player1 = new Paddle(20);
  player2 = new Paddle(width - 40);
  servingPlayer = 1;
}

function draw() {
  background(0);
  dashedLine(25);
  displayMessages();
  score();

  if (gameState === "start") {
    ball.reset();
  } else if (gameState === "play") {
    ball.update();
    player1.update();
    player2.aiMove(ball);
    checkCollisions();
    checkScore();
  }

  ball.draw();
  player1.draw();
  player2.draw();
}

function displayMessages() {
  if (gameState === "start" && messageTimer === null) {
    title("Press Enter to Begin");
  } else if (gameState === "serve" && messageTimer !== null) {
    if (millis() - messageTimer < 2000) {
      title(`Player ${servingPlayer} serves`);
    } else {
      messageTimer = null;
      gameState = "play";
    }
  }
}

function title(message) {
  fill(255);
  noStroke();
  textSize(18);
  textFont(fontRetro);
  text(message, width / 2, 35);
}

function score() {
  fill(180);
  noStroke();
  textAlign(CENTER);
  textSize(60);
  textFont(fontRetro);
  text(player1Score, width / 4, 80);
  text(player2Score, 3 * width / 4, 80);
}

function dashedLine(pixels) {
  stroke(180);
  strokeWeight(2);
  let center = width / 2;
  for (let i = 0; i < height / pixels; i++) {
    line(center, i * pixels + 5, center, i * pixels + 15);
  }
}

function keyPressed() {
  if (keyCode === ENTER && gameState === "start") {
    gameState = "serve";
    messageTimer = millis();
  }
}

function checkCollisions() {
  if (ball.intersects(player1) || ball.intersects(player2)) {
    ball.bounce();
    ponghit.play();
  }

  if (ball.y < 0 || ball.y > height) {
    ball.bounceY();
    pongbounce.play();
  }
}

function checkScore() {
  if (ball.x < 0) {
    player2Score++;
    pongscore.play();
    gameState = "start";
  } else if (ball.x > width) {
    player1Score++;
    pongscore.play();
    gameState = "start";
  }
}

class Ball {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = width / 2;
    this.y = height / 2;
    this.dx = random([-3, 3]);
    this.dy = random([-3, 3]);
    this.radius = 10;
    this.justBounced = false;
  }

  update() {
    this.x += this.dx;
    this.y += this.dy;

    if ((this.dx < 0 && this.x > player1.x + player1.width) || (this.dx > 0 && this.x < player2.x - this.radius)) {
      this.justBounced = false;
    }
  }

  draw() {
    fill(0, 255, 0);
    ellipse(this.x, this.y, this.radius * 2);
  }

  bounce() {
    if (!this.justBounced) {
      this.dx *= -1;
      this.justBounced = true;
    }
  }

  bounceY() {
    this.dy *= -1;
  }

  intersects(paddle) {
    if (this.y + this.radius > paddle.y &&
        this.y - this.radius < paddle.y + paddle.height &&
        !this.justBounced) {
      if (this.dx > 0 && this.x + this.radius > paddle.x && this.x + this.radius < paddle.x + paddle.width) {
        return true;
      } else if (this.dx < 0 && this.x - this.radius < paddle.x + paddle.width && this.x - this.radius > paddle.x) {
        return true;
      }
    }
    return false;
  }
}

class Paddle {
  constructor(x) {
    this.x = x;
    this.y = height / 2 - 50;
    this.width = 10;
    this.height = 100;
    this.isLeft = this.x < width / 2;
  }

  update() {
    if (this.isLeft && keyIsDown(UP_ARROW)) {
      this.y -= 5;
    } else if (this.isLeft && keyIsDown(DOWN_ARROW)) {
      this.y += 5;
    }

    this.y = constrain(this.y, 0, height - this.height);
  }

  aiMove(ball) {
    if (!this.isLeft) {
      let targetY = ball.y;
      let dy = targetY - this.y;
      this.y += dy * 0.1;
      this.y = constrain(this.y, 0, height - this.height);
    }
  }

  draw() {
    fill(this.isLeft ? 255 : 0, this.isLeft ? 0 : 0, this.isLeft ? 0 : 255);
    rect(this.x, this.y, this.width, this.height);
  }
}

