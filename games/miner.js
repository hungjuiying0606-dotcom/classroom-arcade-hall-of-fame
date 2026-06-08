/* ==========================================
   CLASSROOM ARCADE - GOLD MINER (miner.js)
   ========================================== */

const MinerGame = {
  container: null,
  score: 0,
  timeLeft: 60,
  timerInterval: null,
  animationId: null,
  canvas: null,
  ctx: null,

  currentQuestion: null,
  correctCount: 0,
  totalLaunches: 0,

  miner: { x: 0, y: 50, hookLength: 35, angle: 0, swingSpeed: 0.03, swingDirection: 1, state: 'swinging', hookX: 0, hookY: 0, vx: 0, vy: 0, launchSpeed: 10, grabbedItem: null },
  goldNuggets: [],
  particles: [],

  init() {
    this.container = document.getElementById('game-body');
    this.score = 0;
    this.sessionQuestions = ArcadeState.getRandomQuestions(20);
    this.currentQuestionIndex = 0;
    this.timeLeft = 60;
    this.correctCount = 0;
    this.totalLaunches = 0;
    this.goldNuggets = [];
    this.particles = [];

    document.getElementById('game-stage-title').textContent = "歡樂黃金礦工";
    document.getElementById('game-score').textContent = this.score;
    document.getElementById('game-timer').textContent = "時限: 60s";

    this.renderStage();
    this.initCanvas();
    this.nextQuestion();
    this.startTimers();
    this.loop();
  },

  renderStage() {
    this.container.innerHTML = `
      <div class="miner-wrapper" style="position:relative; width:100%; height:550px; background:#2c1b10; border-radius:12px; overflow:hidden; border:2px solid var(--neon-gold); display:flex; flex-direction:column;">
        <div class="miner-question-box" style="padding:10px; background:rgba(255, 176, 0, 0.1); border-bottom:1px solid rgba(255,176,0,0.3); text-align:center; z-index:5;">
          <p style="font-size:0.75rem; color:var(--neon-gold); text-transform:uppercase; font-weight:700; margin:0 0 4px 0">採礦任務：點擊畫面發射鉤爪，抓取寫有「正確答案」的黃金！</p>
          <h3 id="miner-question-text" style="font-size:1.1rem; line-height:1.3; margin:0; color:#fff">載入問題中...</h3>
        </div>
        <canvas id="miner-canvas" style="flex:1; width:100%; display:block; cursor:pointer; touch-action:none;"></canvas>
      </div>
    `;
  },

  initCanvas() {
    this.canvas = document.getElementById('miner-canvas');
    this.ctx = this.canvas.getContext('2d');
    
    this.canvas.width = this.canvas.clientWidth;
    this.canvas.height = this.canvas.clientHeight;

    this.miner.x = this.canvas.width / 2;
    this.miner.y = 40;
    this.miner.angle = 0;
    this.miner.state = 'swinging';

    this.canvas.addEventListener('pointerdown', this.handleCanvasClick);
  },

  handleCanvasClick: (e) => {
    e.preventDefault();
    if (MinerGame.miner.state !== 'swinging') return;
    MinerGame.launchHook();
  },

  launchHook() {
    if (this.timeLeft <= 0) return;
    this.miner.state = 'launching';
    this.miner.vx = Math.sin(this.miner.angle) * this.miner.launchSpeed;
    this.miner.vy = Math.cos(this.miner.angle) * this.miner.launchSpeed;
    this.miner.hookX = this.miner.x + Math.sin(this.miner.angle) * this.miner.hookLength;
    this.miner.hookY = this.miner.y + Math.cos(this.miner.angle) * this.miner.hookLength;
    this.totalLaunches++;
    SoundFX.playClick();
  },

  startTimers() {
    clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.timeLeft--;
      document.getElementById('game-timer').textContent = `進度: ${this.currentQuestionIndex}/20 | 時間: ${this.timeLeft}s`;
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
    
    document.getElementById('miner-question-text').textContent = this.currentQuestion.question;
    
    this.spawnGold();
  },

  spawnGold() {
    this.goldNuggets = [];
    const options = this.currentQuestion.options;
    const count = options.length;
    const colWidth = this.canvas.width / count;

    options.forEach((opt, idx) => {
      this.goldNuggets.push({
        x: colWidth * idx + colWidth / 2,
        y: 220 + Math.random() * 150,
        radius: 35 + Math.random() * 8,
        text: opt.length > 8 ? opt.substring(0, 7) + ".." : opt,
        fullText: opt,
        isCorrect: idx === this.currentQuestion.answer,
        color: '#ffea00',
        wobble: Math.random() * 10
      });
    });
  },

  loop() {
    this.updatePhysics();
    this.draw();
    if (this.timeLeft > 0) {
      this.animationId = requestAnimationFrame(() => this.loop());
    }
  },

  updatePhysics() {
    // 1. Swing Hook
    if (this.miner.state === 'swinging') {
      this.miner.angle += this.miner.swingSpeed * this.miner.swingDirection;
      if (this.miner.angle > Math.PI / 2.5 || this.miner.angle < -Math.PI / 2.5) {
        this.miner.swingDirection *= -1;
      }
    }

    // 2. Launch Hook
    else if (this.miner.state === 'launching') {
      this.miner.hookX += this.miner.vx;
      this.miner.hookY += this.miner.vy;

      // Check boundary limits
      if (this.miner.hookX < 0 || this.miner.hookX > this.canvas.width || this.miner.hookY > this.canvas.height) {
        this.miner.state = 'retracting';
      }

      // Check collision with gold nuggets
      this.goldNuggets.forEach((gold, gIdx) => {
        const dx = this.miner.hookX - gold.x;
        const dy = this.miner.hookY - gold.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < gold.radius) {
          // Grabbed!
          this.miner.state = 'grabbing';
          this.miner.grabbedItem = gold;
          this.goldNuggets.splice(gIdx, 1);
        }
      });
    }

    // 3. Retrieve / Grab Hook
    else if (this.miner.state === 'grabbing' || this.miner.state === 'retracting') {
      const targetX = this.miner.x + Math.sin(this.miner.angle) * this.miner.hookLength;
      const targetY = this.miner.y + Math.cos(this.miner.angle) * this.miner.hookLength;

      const dx = targetX - this.miner.hookX;
      const dy = targetY - this.miner.hookY;
      const dist = Math.sqrt(dx*dx + dy*dy);
      
      const retractSpeed = this.miner.state === 'grabbing' && !this.miner.grabbedItem.isCorrect ? 3 : 8;

      if (dist > retractSpeed) {
        this.miner.hookX += (dx / dist) * retractSpeed;
        this.miner.hookY += (dy / dist) * retractSpeed;

        // Carry grabbed gold nugget back
        if (this.miner.grabbedItem) {
          this.miner.grabbedItem.x = this.miner.hookX;
          this.miner.grabbedItem.y = this.miner.hookY;
        }
      } else {
        // Returned to starting position
        this.miner.state = 'swinging';
        
        if (this.miner.grabbedItem) {
          this.handleGoldDelivered(this.miner.grabbedItem);
          this.miner.grabbedItem = null;
        }
      }
    }

    // 4. Update particles
    this.particles.forEach((p, index) => {
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.03;
      if (p.alpha <= 0) {
        this.particles.splice(index, 1);
      }
    });
  },

  handleGoldDelivered(gold) {
    if (gold.isCorrect) {
      SoundFX.playCoin();
      this.score += 100;
      this.correctCount++;
      document.getElementById('game-score').textContent = this.score;

      // Spawn shine particles
      for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 4 + 1;
        this.particles.push({
          x: this.miner.x,
          y: this.miner.y + 30,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 3 + 2,
          alpha: 1,
          color: "rgba(255, 234, 0, 0.8)"
        });
      }

      setTimeout(() => {
        this.nextQuestion();
      }, 500);
    } else {
      SoundFX.playFail();
      this.score = Math.max(0, this.score - 40);
      document.getElementById('game-score').textContent = this.score;

      // Dust smoke particles
      for (let i = 0; i < 12; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 2 + 1;
        this.particles.push({
          x: this.miner.x,
          y: this.miner.y + 30,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 6 + 4,
          alpha: 0.8,
          color: "rgba(100, 80, 70, 0.5)"
        });
      }
      // Re-spawn gold so the correct option is still available
      this.spawnGold();
    }
  },

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw soil underground background
    this.ctx.fillStyle = "#3e2723";
    this.ctx.fillRect(0, 100, this.canvas.width, this.canvas.height - 100);

    // 1. Draw Gold nuggets
    this.goldNuggets.forEach(g => {
      this.drawGoldShape(g.x, g.y, g.radius, g.text, g.color);
    });

    // 2. Draw Grabbed item
    if (this.miner.grabbedItem) {
      const g = this.miner.grabbedItem;
      this.drawGoldShape(g.x, g.y, g.radius, g.text, g.color);
    }

    // 3. Draw particles
    this.particles.forEach(p => {
      this.ctx.save();
      this.ctx.globalAlpha = p.alpha;
      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    });

    // 4. Draw Hook Cable (Line from spool to hook point)
    let endX = this.miner.hookX;
    let endY = this.miner.hookY;
    if (this.miner.state === 'swinging') {
      endX = this.miner.x + Math.sin(this.miner.angle) * this.miner.hookLength;
      endY = this.miner.y + Math.cos(this.miner.angle) * this.miner.hookLength;
    }

    this.ctx.strokeStyle = "#d7ccc8";
    this.ctx.lineWidth = 2.5;
    this.ctx.beginPath();
    this.ctx.moveTo(this.miner.x, this.miner.y);
    this.ctx.lineTo(endX, endY);
    this.ctx.stroke();

    // 5. Draw Claw/Hook
    this.ctx.save();
    this.ctx.translate(endX, endY);
    this.ctx.rotate(-this.miner.angle);

    this.ctx.strokeStyle = "#757575";
    this.ctx.lineWidth = 3.5;
    this.ctx.beginPath();
    // Claw shape left
    this.ctx.moveTo(0, 0);
    this.ctx.bezierCurveTo(-10, 5, -12, 18, -4, 24);
    // Claw shape right
    this.ctx.moveTo(0, 0);
    this.ctx.bezierCurveTo(10, 5, 12, 18, 4, 24);
    this.ctx.stroke();

    this.ctx.restore();

    // 6. Draw Mining Spool (spins or sits at top)
    this.ctx.fillStyle = "#8d6e63";
    this.ctx.beginPath();
    this.ctx.arc(this.miner.x, this.miner.y, 16, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = "#5d4037";
    this.ctx.beginPath();
    this.ctx.arc(this.miner.x, this.miner.y, 8, 0, Math.PI * 2);
    this.ctx.fill();
  },

  drawGoldShape(x, y, r, label, color) {
    this.ctx.save();
    this.ctx.translate(x, y);

    // Jagged gold chunk shape
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.moveTo(0, -r);
    this.ctx.lineTo(r * 0.8, -r * 0.6);
    this.ctx.lineTo(r, r * 0.2);
    this.ctx.lineTo(r * 0.5, r);
    this.ctx.lineTo(-r * 0.6, r * 0.8);
    this.ctx.lineTo(-r, -r * 0.1);
    this.ctx.lineTo(-r * 0.7, -r * 0.7);
    this.ctx.closePath();
    this.ctx.fill();

    // Shine lines
    this.ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(-r * 0.3, -r * 0.3);
    this.ctx.lineTo(r * 0.4, -r * 0.2);
    this.ctx.stroke();

    // Label
    this.ctx.fillStyle = "#4e342e";
    this.ctx.font = "bold 0.8rem Outfit, sans-serif";
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText(label, 0, 0);

    this.ctx.restore();
  },

  endGame() {
    this.destroy();
    SoundFX.playWin();

    this.container.innerHTML = `
      <div class="game-win-overlay">
        <div class="win-title">⏰ 時間到！採礦結束</div>
        <p>你在歡樂黃金礦工挑戰中挖取了豐碩的學術寶藏！</p>
        <div class="win-score">SCORE: ${this.score}</div>
        <p style="color:var(--text-muted)">成功挖掘正確黃金: ${this.correctCount} 次</p>
        <button id="btn-win-exit" class="btn btn-neon-gold">退出並登錄成績</button>
      </div>
    `;

    document.getElementById('btn-win-exit').addEventListener('click', async () => {
      SoundFX.playClick();
      const exitBtn = document.getElementById('btn-win-exit');
      exitBtn.disabled = true;
      exitBtn.textContent = "上傳成績中...";

      await GAS_API.logScore("歡樂黃金礦工", this.score, this.correctCount, this.totalLaunches);

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
      this.canvas.removeEventListener('pointerdown', this.handleCanvasClick);
    }
  }
};

window.MinerGame = MinerGame;
