class Field {
  constructor(size) {
    this.size = size;
    this.center = size / 2;
    this.border = 5;
    this.scoringSize = 122;
    this.scoringMarginX = 170;
    this.gridStep = 166;
    this.robotSpawn = { x: this.center, y: size - 54 };

    this.leftCenterNode = { x: 500, y: 520 };
    this.rightCenterNode = { x: 840, y: 520 };
    this.rightWallX = 840;
    this.cornerInsetY = 165;

    this.scoringZones = {
      blue: {
        x: size - this.scoringSize - this.scoringMarginX,
        y: 208,
        size: this.scoringSize,
        color: "#2563eb"
      },
      red: {
        x: size - this.scoringSize - this.scoringMarginX,
        y: size - this.scoringSize - 206,
        size: this.scoringSize,
        color: "#e11d48"
      }
    };

    this.topBars = [
      { x: this.center - 16, y: 92, color: "#ff2536" },
      { x: this.center - 2, y: 92, color: "#ff2536" }
    ];

    this.bottomBars = [
      { x: this.center - 16, y: size - 126, color: "#2f43c8" },
      { x: this.center - 2, y: size - 126, color: "#2f43c8" }
    ];
  }

  containsInScoringZone(ball, zoneKey) {
    const zone = this.scoringZones[zoneKey];
    return (
      ball.x + ball.radius > zone.x &&
      ball.x - ball.radius < zone.x + zone.size &&
      ball.y + ball.radius > zone.y &&
      ball.y - ball.radius < zone.y + zone.size
    );
  }

  draw(ctx) {
    const s = this.size;

    ctx.fillStyle = "#2f2f33";
    ctx.fillRect(0, 0, s, s);

    ctx.strokeStyle = "rgba(0,0,0,0.45)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= s; i += this.gridStep) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, s);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(s, i);
      ctx.stroke();
    }

    ctx.fillStyle = "#ff1729";
    ctx.beginPath();
    ctx.moveTo(0, 48);
    ctx.lineTo(0, 170);
    ctx.lineTo(154, 48);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#3436a6";
    ctx.beginPath();
    ctx.moveTo(0, s - 48);
    ctx.lineTo(0, s - 170);
    ctx.lineTo(154, s - 48);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "#f8fafc";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(0, 170);
    ctx.lineTo(this.leftCenterNode.x, this.leftCenterNode.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(102, s - 102);
    ctx.lineTo(this.leftCenterNode.x, this.leftCenterNode.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(s, 350);
    ctx.lineTo(this.rightCenterNode.x, this.rightCenterNode.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(s, 680);
    ctx.lineTo(this.rightCenterNode.x, this.rightCenterNode.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, 170);
    ctx.lineTo(154, 48);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, s - 170);
    ctx.lineTo(154, s - 48);
    ctx.stroke();

    ctx.strokeStyle = "#2f43c8";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(500, 40);
    ctx.lineTo(this.rightWallX, 40);
    ctx.stroke();

    ctx.strokeStyle = "#ff2536";
    ctx.beginPath();
    ctx.moveTo(500, s - 40);
    ctx.lineTo(this.rightWallX, s - 40);
    ctx.stroke();

    ctx.strokeStyle = "#f8fafc";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(this.rightWallX, 0);
    ctx.lineTo(this.rightWallX, s);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(this.rightWallX, this.cornerInsetY);
    ctx.lineTo(s, this.cornerInsetY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(this.rightWallX, s - this.cornerInsetY);
    ctx.lineTo(s, s - this.cornerInsetY);
    ctx.stroke();

    Object.values(this.scoringZones).forEach((zone) => {
      ctx.strokeStyle = zone.color;
      ctx.lineWidth = 5;
      ctx.strokeRect(zone.x, zone.y, zone.size, zone.size);
    });

    [...this.topBars, ...this.bottomBars].forEach((bar) => {
      ctx.fillStyle = bar.color;
      ctx.fillRect(bar.x, bar.y, 8, 72);
    });

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = this.border;
    ctx.strokeRect(0, 0, s, s);
  }
}

class Ball {
  constructor(x, y, color, staticOnField = true) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.radius = 11;
    this.vx = 0;
    this.vy = 0;
    this.gravity = 420;
    this.staticOnField = staticOnField;
    this.active = true;
    this.scored = false;
  }

  launch(vx, vy) {
    this.staticOnField = false;
    this.vx = vx;
    this.vy = vy;
  }

  update(dt, field) {
    if (!this.active || this.staticOnField || this.scored) {
      return;
    }

    this.vy += this.gravity * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    if (this.x - this.radius < 0) {
      this.x = this.radius;
      this.vx *= -0.45;
    }
    if (this.x + this.radius > field.size) {
      this.x = field.size - this.radius;
      this.vx *= -0.45;
    }
    if (this.y - this.radius < 0) {
      this.y = this.radius;
      this.vy *= -0.45;
    }
    if (this.y + this.radius > field.size) {
      this.y = field.size - this.radius;
      this.vy *= -0.35;
      this.vx *= 0.9;

      if (Math.abs(this.vy) < 28) {
        this.vy = 0;
      }
    }

    if (Math.abs(this.vx) < 2 && Math.abs(this.vy) < 2 && this.y > field.size - this.radius - 2) {
      this.active = false;
    }
  }

  draw(ctx) {
    if (!this.active && !this.scored) {
      return;
    }

    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(255,255,255,0.24)";
    ctx.beginPath();
    ctx.arc(this.x - 3, this.y - 3, this.radius * 0.42, 0, Math.PI * 2);
    ctx.fill();
  }
}

class Robot {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 22;
    this.speed = 320;
    this.color = "#05070b";
    this.carrying = null;
  }

  update(dt, keys, field) {
    let dx = 0;
    let dy = 0;

    if (keys["w"]) dy -= 1;
    if (keys["s"]) dy += 1;
    if (keys["a"]) dx -= 1;
    if (keys["d"]) dx += 1;

    if (dx !== 0 || dy !== 0) {
      const len = Math.hypot(dx, dy);
      this.x += (dx / len) * this.speed * dt;
      this.y += (dy / len) * this.speed * dt;
    }

    this.x = Math.max(this.radius, Math.min(field.size - this.radius, this.x));
    this.y = Math.max(this.radius, Math.min(field.size - this.radius, this.y));

    if (this.carrying) {
      this.carrying.x = this.x;
      this.carrying.y = this.y - this.radius - 13;
    }
  }

  collect(groundBalls) {
    if (this.carrying) {
      return false;
    }

    let nearest = null;
    let nearestDistance = Infinity;

    for (const ball of groundBalls) {
      if (!ball.active || !ball.staticOnField) continue;
      const distance = Math.hypot(this.x - ball.x, this.y - ball.y);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearest = ball;
      }
    }

    if (nearest && nearestDistance <= 40) {
      this.carrying = nearest;
      nearest.x = this.x;
      nearest.y = this.y - this.radius - 13;
      return true;
    }

    return false;
  }

  throwBall(targetX, targetY) {
    if (!this.carrying) {
      return null;
    }

    const ball = this.carrying;
    this.carrying = null;

    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const len = Math.hypot(dx, dy) || 1;
    const launchSpeed = 640;

    ball.x = this.x;
    ball.y = this.y;
    ball.launch((dx / len) * launchSpeed, (dy / len) * launchSpeed - 180);

    return ball;
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#6b7280";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius - 5, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "#9ca3af";
    ctx.beginPath();
    ctx.arc(this.x + 4, this.y - 4, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}

class Game {
  constructor(canvas, redScoreElement, blueScoreElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.redScoreElement = redScoreElement;
    this.blueScoreElement = blueScoreElement;

    this.logicalSize = 1000;
    this.field = new Field(this.logicalSize);
    this.robot = new Robot(this.field.robotSpawn.x, this.field.robotSpawn.y);

    this.keys = {};
    this.groundBalls = [];
    this.flyingBalls = [];

    this.redScore = 0;
    this.blueScore = 0;

    this.lastTimestamp = 0;

    this.seedBalls();
    this.setupCanvasScale();
    this.setupEvents();
  }

  seedBalls() {
    const green = "#22c55e";
    const purple = "#9333ea";

    const positions = [
      [{ x: 418, y: 132, c: green }, { x: 418, y: 168, c: purple }, { x: 418, y: 204, c: purple }],
      [{ x: 586, y: 132, c: purple }, { x: 586, y: 168, c: green }, { x: 586, y: 204, c: purple }],
      [{ x: 754, y: 132, c: purple }, { x: 754, y: 168, c: purple }, { x: 754, y: 204, c: green }],
      [{ x: 904, y: 36, c: purple }, { x: 940, y: 36, c: green }, { x: 976, y: 36, c: purple }],
      [{ x: 418, y: 796, c: purple }, { x: 418, y: 832, c: purple }, { x: 418, y: 868, c: green }],
      [{ x: 586, y: 796, c: purple }, { x: 586, y: 832, c: green }, { x: 586, y: 868, c: purple }],
      [{ x: 754, y: 796, c: green }, { x: 754, y: 832, c: purple }, { x: 754, y: 868, c: purple }],
      [{ x: 904, y: 976, c: purple }, { x: 940, y: 976, c: green }, { x: 976, y: 976, c: purple }]
    ];

    positions.flat().forEach((item) => {
      this.groundBalls.push(new Ball(item.x, item.y, item.c, true));
    });
  }

  setupCanvasScale() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = this.logicalSize * dpr;
    this.canvas.height = this.logicalSize * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  setupEvents() {
    document.addEventListener("keydown", (event) => {
      const key = event.key.toLowerCase();
      this.keys[key] = true;

      if (key === "e") {
        this.robot.collect(this.groundBalls);
      }
    });

    document.addEventListener("keyup", (event) => {
      const key = event.key.toLowerCase();
      this.keys[key] = false;
    });

    this.canvas.addEventListener("click", (event) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.logicalSize / rect.width;
      const scaleY = this.logicalSize / rect.height;
      const x = (event.clientX - rect.left) * scaleX;
      const y = (event.clientY - rect.top) * scaleY;

      const thrownBall = this.robot.throwBall(x, y);
      if (thrownBall) {
        this.flyingBalls.push(thrownBall);
      }
    });

    window.addEventListener("resize", () => this.setupCanvasScale());
  }

  updateScoreDisplay() {
    this.redScoreElement.textContent = String(this.redScore);
    this.blueScoreElement.textContent = String(this.blueScore);
  }

  handleScoring(ball) {
    if (ball.scored || !ball.active) {
      return;
    }

    if (this.field.containsInScoringZone(ball, "red")) {
      ball.scored = true;
      ball.active = false;
      this.redScore += 1;
      this.updateScoreDisplay();
      return;
    }

    if (this.field.containsInScoringZone(ball, "blue")) {
      ball.scored = true;
      ball.active = false;
      this.blueScore += 1;
      this.updateScoreDisplay();
    }
  }

  update(deltaTime) {
    this.robot.update(deltaTime, this.keys, this.field);

    for (const ball of this.flyingBalls) {
      ball.update(deltaTime, this.field);
      this.handleScoring(ball);
    }

    this.flyingBalls = this.flyingBalls.filter((ball) => ball.active);
    this.groundBalls = this.groundBalls.filter((ball) => ball.active || this.robot.carrying === ball);
  }

  draw() {
    this.field.draw(this.ctx);

    this.groundBalls.forEach((ball) => {
      if (this.robot.carrying === ball) return;
      ball.draw(this.ctx);
    });

    this.flyingBalls.forEach((ball) => ball.draw(this.ctx));
    if (this.robot.carrying) {
      this.robot.carrying.draw(this.ctx);
    }

    this.robot.draw(this.ctx);
  }

  frame = (timestamp) => {
    if (!this.lastTimestamp) {
      this.lastTimestamp = timestamp;
    }

    const deltaTime = Math.min((timestamp - this.lastTimestamp) / 1000, 0.033);
    this.lastTimestamp = timestamp;

    this.update(deltaTime);
    this.draw();
    requestAnimationFrame(this.frame);
  };

  start() {
    this.updateScoreDisplay();
    requestAnimationFrame(this.frame);
  }
}

const canvas = document.getElementById("gameCanvas");
const redScoreElement = document.getElementById("redScore");
const blueScoreElement = document.getElementById("blueScore");

const game = new Game(canvas, redScoreElement, blueScoreElement);
game.start();
