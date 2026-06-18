/* ==========================================
   CLASSROOM ARCADE - BALLOON POPPER (balloon.js)
   ========================================== */

const BalloonGame = {
  container: null,
  score: 0,
  lives: 10,
  timeLeft: 60,
  timerInterval: null,
  animationId: null,
  canvas: null,
  ctx: null,

  currentQuestion: null,
  correctCount: 0,
  totalPops: 0,

  balloons: [],
  particles: [],

  init() {
    this.container = document.getElementById('game-body');
    this.score = 0;
    this.sessionQuestions = ArcadeState.getRandomQuestions(20);
    this.currentQuestionIndex = 0;
    this.lives = 10;
    this.timeLeft = 60;
    this.correctCount = 0;
    this.totalPops = 0;
    this.balloons = [];
    this.particles = [];

    document.getElementById('game-stage-title').textContent = "歡樂氣球派對";
    document.getElementById('game-score').textContent = this.score;
    this.updateStatsUI();

    this.renderStage();
    this.initCanvas();
    this.nextQuestion();
    this.startTimers();
    this.loop();
  },

  updateStatsUI() {
    let hearts = "";
    for (let i = 0; i < 10; i++) {
      hearts += i < this.lives ? "🎈" : "💥";
    }
    document.getElementById('game-timer').textContent = `氣球: ${hearts} | 時間: ${this.timeLeft}s`;
  },

  renderStage() {
    this.container.innerHTML = `
      <div class="balloon-wrapper" style="position:relative; width:100%; height:550px; background:#0f111a; border-radius:12px; overflow:hidden; border:2px solid var(--neon-pink); display:flex; flex-direction:column;">
        <div class="balloon-question-box" style="padding:10px; background:rgba(255, 0, 127, 0.1); border-bottom:1px solid rgba(255,0,127,0.3); text-align:center; z-index:5;">
          <p style="font-size:0.75rem; color:var(--neon-pink); text-transform:uppercase; font-weight:700; margin:0 0 4px 0">挑戰任務：點擊並戳破代表「正確答案」的上升氣球！</p>
          <h3 id="balloon-question-text" style="font-size:1.1rem; line-height:1.3; margin:0; color:#fff">載入問題中...</h3>
        </div>
        <canvas id="balloon-canvas" style="flex:1; width:100%; display:block; cursor:pointer;"></canvas>
      </div>
    `;
  },

  initCanvas() {
    this.canvas = document.getElementById('balloon-canvas');
    this.ctx = this.canvas.getContext('2d');
    
    this.canvas.width = this.canvas.clientWidth;
    this.canvas.height = this.canvas.clientHeight;

    // Click handler
    this.canvas.addEventListener('click', this.handleCanvasClick);
  },

  handleCanvasClick: (e) => {
    const rect = BalloonGame.canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Check hit
    BalloonGame.balloons.forEach((b, bIdx) => {
      // Balloon is oval: approximate with distance check
      const dx = clickX - b.x;
      const dy = clickY - b.y;
      // Ellipse equation: (dx/rx)^2 + (dy/ry)^2 <= 1
      const rx = b.width / 2;
      const ry = b.height / 2;

      if ((dx * dx) / (rx * rx) + (dy * dy) / (ry * ry) <= 1.2) {
        // Hit!
        BalloonGame.balloons.splice(bIdx, 1);
        BalloonGame.totalPops++;
        BalloonGame.handlePop(b);
      }
    });
  },

  startTimers() {
    clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.timeLeft--;
      this.updateStatsUI();
      if (this.timeLeft <= 0) {
        this.endGame();
      }
    }, 1000);
  },

  nextQuestion() {
    if (this.currentQuestionIndex >= 20) {
      this.endGame();
      return;
    }
    const rawQuestion = this.sessionQuestions[this.currentQuestionIndex];
    this.currentQuestionIndex++;
    this.currentQuestion = ArcadeState.getMultipleChoiceQuestion(rawQuestion);
    
    document.getElementById('balloon-question-text').textContent = this.currentQuestion.question;
    
    this.spawnBalloons();
  },

  spawnBalloons() {
    this.balloons = [];
    const options = this.currentQuestion.options;
    const count = options.length;
    const colWidth = this.canvas.width / count;

    options.forEach((opt, idx) => {
      this.balloons.push({
        x: colWidth * idx + colWidth / 2,
        y: this.canvas.height + 60 + Math.random() * 80,
        width: 75,
        height: 95,
        speed: 1.2 + Math.random() * 0.8,
        text: opt.length > 8 ? opt.substring(0, 7) + ".." : opt,
        fullText: opt,
        isCorrect: idx === this.currentQuestion.answer,
        color: `hsl(${idx * (360 / count)}, 85%, 60%)`,
        wiggleOffset: Math.random() * 100,
        wiggleSpeed: 0.02 + Math.random() * 0.02
      });
    });
  },

  loop() {
    this.updatePhysics();
    this.draw();
    if (this.lives > 0 && this.timeLeft > 0) {
      this.animationId = requestAnimationFrame(() => this.loop());
    }
  },

  updatePhysics() {
    // 1. Move Balloons
    this.balloons.forEach((b, idx) => {
      b.y -= b.speed;
      b.wiggleOffset += b.wiggleSpeed;

      // Check if off screen top
      if (b.y < -b.height) {
        this.balloons.splice(idx, 1);
        if (b.isCorrect) {
          // Missed correct balloon! Lose life
          this.lives--;
          this.score = Math.max(0, this.score - 20);
          document.getElementById('game-score').textContent = this.score;
          this.updateStatsUI();
          SoundFX.playFail();

          if (this.lives <= 0) {
            this.endGame();
            return;
          }
          this.nextQuestion();
        }
      }
    });

    // If correct balloon popped or gone and all gone, spawn next question
    if (this.balloons.length === 0) {
      this.nextQuestion();
    }

    // 2. Update confetti/pop particles
    this.particles.forEach((p, index) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.1; // gravity
      p.alpha -= 0.03;
      if (p.alpha <= 0) {
        this.particles.splice(index, 1);
      }
    });
  },

  handlePop(balloon) {
    // Create confetti explosion
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 2;
      this.particles.push({
        x: balloon.x,
        y: balloon.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 3 + 2,
        alpha: 1,
        color: balloon.color
      });
    }

    if (balloon.isCorrect) {
      SoundFX.playCoin();
      this.score += 100;
      this.correctCount++;
      document.getElementById('game-score').textContent = this.score;
      
      setTimeout(() => {
        this.nextQuestion();
      }, 300);
    } else {
      SoundFX.playFail();
      this.score = Math.max(0, this.score - 20);
      document.getElementById('game-score').textContent = this.score;
    }
  },

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 1. Draw pop particles
    this.particles.forEach(p => {
      this.ctx.save();
      this.ctx.globalAlpha = p.alpha;
      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    });

    // 2. Draw Balloons
    this.balloons.forEach(b => {
      this.ctx.save();
      
      // Calculate gentle sine wiggle left-right
      const wiggleX = Math.sin(b.wiggleOffset) * 15;
      this.ctx.translate(b.x + wiggleX, b.y);

      // Balloon string
      this.ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      this.ctx.lineWidth = 1.5;
      this.ctx.beginPath();
      this.ctx.moveTo(0, b.height / 2);
      // Sine line to simulate string wobble
      this.ctx.bezierCurveTo(-10, b.height / 2 + 20, 10, b.height / 2 + 40, 0, b.height / 2 + 60);
      this.ctx.stroke();

      // Balloon Body (Ellipse gradient)
      const grad = this.ctx.createRadialGradient(-10, -15, 5, 0, 0, b.height / 2);
      grad.addColorStop(0, '#ffffff'); // gloss reflection highlight
      grad.addColorStop(0.2, b.color);
      grad.addColorStop(1, '#000000');
      
      this.ctx.fillStyle = grad;
      this.ctx.beginPath();
      this.ctx.ellipse(0, 0, b.width / 2, b.height / 2, 0, 0, Math.PI * 2);
      this.ctx.fill();

      // Balloon knot (small triangle at bottom)
      this.ctx.fillStyle = b.color;
      this.ctx.beginPath();
      this.ctx.moveTo(-6, b.height / 2 - 2);
      this.ctx.lineTo(6, b.height / 2 - 2);
      this.ctx.lineTo(0, b.height / 2 + 6);
      this.ctx.closePath();
      this.ctx.fill();

      // Answer Text
      this.ctx.fillStyle = "#ffffff";
      this.ctx.font = "bold 0.85rem Outfit, sans-serif";
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";
      // Drop shadow for text readability
      this.ctx.shadowColor = "rgba(0,0,0,0.8)";
      this.ctx.shadowBlur = 4;
      this.ctx.fillText(b.text, 0, -5);

      this.ctx.restore();
    });
  },

  endGame() {
    this.destroy();
    SoundFX.playWin();

    this.container.innerHTML = `
      <div class="game-win-overlay">
        <div class="win-title">${this.lives <= 0 ? "🎈 氣球全部漏掉！遊戲結束" : "🏆 挑戰完成！"}</div>
        <p>你在歡樂氣球派對的表現相當亮眼！</p>
        <div class="win-score">SCORE: ${this.score}</div>
        <p style="color:var(--text-muted)">戳破正確氣球: ${this.correctCount} 次 / 總敲擊次數: ${this.totalPops} 次</p>
        <button id="btn-win-exit" class="btn btn-neon-pink">退出並登錄成績</button>
      </div>
    `;

    document.getElementById('btn-win-exit').addEventListener('click', async () => {
      SoundFX.playClick();
      const exitBtn = document.getElementById('btn-win-exit');
      exitBtn.disabled = true;
      exitBtn.textContent = "上傳成績中...";

      await GAS_API.logScore("歡樂氣球派對", this.score, this.correctCount, this.totalPops);

      // Go back to lobby
      document.getElementById('game-stage').classList.add('hidden');
      document.getElementById('arcade-lobby').classList.remove('hidden');
      ArcadeState.currentGame = null;
    });
  },

  destroy() {
    clearInterval(this.timerInterval);
    cancelAnimationFrame(this.animationId);
    if (this.canvas) {
      this.canvas.removeEventListener('click', this.handleCanvasClick);
    }
  }
};

window.BalloonGame = BalloonGame;
