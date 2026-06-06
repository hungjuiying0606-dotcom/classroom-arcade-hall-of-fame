/* ==========================================
   CLASSROOM ARCADE - SPACE SHOOTER (shooter.js)
   ========================================== */

const ShooterGame = {
  container: null,
  score: 0,
  health: 10,
  timeLeft: 60,
  timerInterval: null,
  animationId: null,
  canvas: null,
  ctx: null,

  currentQuestion: null,
  correctCount: 0,
  totalShots: 0,

  ship: { x: 0, y: 0, width: 50, height: 50, speed: 8 },
  lasers: [],
  enemies: [],
  stars: [],
  keys: {},

  init() {
    this.container = document.getElementById('game-body');
    this.score = 0;
    this.sessionQuestions = ArcadeState.getRandomQuestions(20);
    this.currentQuestionIndex = 0;
    this.health = 10;
    this.timeLeft = 60;
    this.correctCount = 0;
    this.totalShots = 0;
    this.lasers = [];
    this.enemies = [];
    this.stars = [];
    this.keys = {};

    document.getElementById('game-stage-title').textContent = "太空開拓者";
    document.getElementById('game-score').textContent = this.score;
    this.updateStatsUI();

    this.renderStage();
    this.initCanvas();
    this.nextQuestion();
    this.startTimers();
    this.loop();
  },

  updateStatsUI() {
    let shields = "";
    for (let i = 0; i < 10; i++) {
      shields += i < this.health ? "🛡️" : "💥";
    }
    document.getElementById('game-timer').textContent = `護盾: ${shields} | 進度: ${this.currentQuestionIndex}/20 | 時間: ${this.timeLeft}s`;
  },

  renderStage() {
    this.container.innerHTML = `
      <div class="shooter-wrapper" style="position:relative; width:100%; height:550px; background:#050510; border-radius:12px; overflow:hidden; border:2px solid var(--neon-pink); display:flex; flex-direction:column;">
        <div class="shooter-question-box" style="padding:10px; background:rgba(255, 0, 127, 0.1); border-bottom:1px solid rgba(255,0,127,0.3); text-align:center; z-index:5;">
          <p style="font-size:0.75rem; color:var(--neon-pink); text-transform:uppercase; font-weight:700; margin:0 0 4px 0">目標任務：射擊正確答案敵機！(← → 移動，空白鍵/點擊發射)</p>
          <h3 id="shooter-question-text" style="font-size:1.1rem; line-height:1.3; margin:0; color:#fff">載入問題中...</h3>
        </div>
        <canvas id="shooter-canvas" style="flex:1; width:100%; display:block; cursor:none;"></canvas>
      </div>
    `;
  },

  initCanvas() {
    this.canvas = document.getElementById('shooter-canvas');
    this.ctx = this.canvas.getContext('2d');
    
    // Fit canvas to parent element size
    this.canvas.width = this.canvas.clientWidth;
    this.canvas.height = this.canvas.clientHeight;

    this.ship.x = this.canvas.width / 2 - this.ship.width / 2;
    this.ship.y = this.canvas.height - 70;

    // Generate starfield background
    for (let i = 0; i < 60; i++) {
      this.stars.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        speed: Math.random() * 2 + 1,
        size: Math.random() * 1.5 + 0.5
      });
    }

    // Keyboard bindings
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    
    // Mouse/Touch controls
    this.canvas.addEventListener('mousemove', this.handleMouseMove);
    this.canvas.addEventListener('click', this.handleMouseClick);
  },

  handleKeyDown: (e) => {
    ShooterGame.keys[e.code] = true;
    if (e.code === 'Space') {
      e.preventDefault();
      ShooterGame.fireLaser();
    }
  },
  handleKeyUp: (e) => {
    ShooterGame.keys[e.code] = false;
  },
  handleMouseMove: (e) => {
    const rect = ShooterGame.canvas.getBoundingClientRect();
    const relativeX = e.clientX - rect.left;
    ShooterGame.ship.x = Math.max(0, Math.min(ShooterGame.canvas.width - ShooterGame.ship.width, relativeX - ShooterGame.ship.width / 2));
  },
  handleMouseClick: (e) => {
    ShooterGame.fireLaser();
  },

  fireLaser() {
    if (this.timeLeft <= 0 || this.health <= 0) return;
    this.lasers.push({
      x: this.ship.x + this.ship.width / 2 - 2,
      y: this.ship.y - 10,
      width: 4,
      height: 15,
      speed: 10
    });
    this.totalShots++;
    SoundFX.playClick();
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
    
    document.getElementById('shooter-question-text').textContent = this.currentQuestion.question;
    
    this.spawnEnemies();
  },

  spawnEnemies() {
    this.enemies = [];
    const options = this.currentQuestion.options;
    const count = options.length;
    const colWidth = this.canvas.width / count;

    options.forEach((opt, idx) => {
      this.enemies.push({
        x: colWidth * idx + colWidth / 2 - 40,
        y: -60,
        width: 85,
        height: 45,
        text: opt.length > 8 ? opt.substring(0, 7) + ".." : opt,
        fullText: opt,
        isCorrect: idx === this.currentQuestion.answer,
        speed: 1 + Math.random() * 0.5,
        pulse: 0
      });
    });
  },

  loop() {
    this.updatePhysics();
    this.draw();
    if (this.health > 0 && this.timeLeft > 0) {
      this.animationId = requestAnimationFrame(() => this.loop());
    }
  },

  updatePhysics() {
    // 1. Move Stars
    this.stars.forEach(s => {
      s.y += s.speed;
      if (s.y > this.canvas.height) {
        s.y = 0;
        s.x = Math.random() * this.canvas.width;
      }
    });

    // 2. Move Ship with keyboard
    if (this.keys['ArrowLeft'] || this.keys['KeyA']) {
      this.ship.x = Math.max(0, this.ship.x - this.ship.speed);
    }
    if (this.keys['ArrowRight'] || this.keys['KeyD']) {
      this.ship.x = Math.min(this.canvas.width - this.ship.width, this.ship.x + this.ship.speed);
    }

    // 3. Move Lasers
    this.lasers.forEach((l, lIdx) => {
      l.y -= l.speed;
      if (l.y < 0) {
        this.lasers.splice(lIdx, 1);
      }
    });

    // 4. Move Enemies & Check collisions
    this.enemies.forEach((e, eIdx) => {
      e.y += e.speed;
      e.pulse += 0.05;

      // Check laser collision
      this.lasers.forEach((l, lIdx) => {
        if (l.x > e.x && l.x < e.x + e.width && l.y > e.y && l.y < e.y + e.height) {
          // Hit!
          this.lasers.splice(lIdx, 1);
          this.handleEnemyHit(e);
        }
      });

      // Enemy goes off screen -> respawn at top
      if (e.y > this.canvas.height) {
        e.y = -60;
        e.speed = 1 + Math.random() * 0.5;
      }

      // Enemy collides with ship
      if (e.x < this.ship.x + this.ship.width && e.x + e.width > this.ship.x && e.y < this.ship.y + this.ship.height && e.y + e.height > this.ship.y) {
        this.health--;
        this.updateStatsUI();
        SoundFX.playFail();
        e.y = -60; // reset
        if (this.health <= 0) {
          this.endGame();
        }
      }
    });
  },

  handleEnemyHit(enemy) {
    if (enemy.isCorrect) {
      // Correct!
      SoundFX.playCoin();
      this.score += 100;
      this.correctCount++;
      document.getElementById('game-score').textContent = this.score;
      
      // Explosion flash
      this.ctx.fillStyle = "rgba(0, 255, 127, 0.4)";
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      setTimeout(() => {
        this.nextQuestion();
      }, 300);
    } else {
      // Incorrect!
      SoundFX.playFail();
      this.score = Math.max(0, this.score - 40);
      document.getElementById('game-score').textContent = this.score;
      
      enemy.y = -60; // reset this enemy
      
      // Screen shake/flash
      this.ctx.fillStyle = "rgba(255, 0, 127, 0.4)";
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
  },

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 1. Draw Starfield
    this.ctx.fillStyle = "#fff";
    this.stars.forEach(s => {
      this.ctx.beginPath();
      this.ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      this.ctx.fill();
    });

    // 2. Draw Ship (Vibrant space fighter shape)
    this.ctx.save();
    this.ctx.translate(this.ship.x, this.ship.y);
    
    // Engine flame
    if (Math.random() > 0.3) {
      this.ctx.fillStyle = "rgba(255, 0, 127, 0.8)";
      this.ctx.beginPath();
      this.ctx.moveTo(this.ship.width / 2 - 8, this.ship.height);
      this.ctx.lineTo(this.ship.width / 2 + 8, this.ship.height);
      this.ctx.lineTo(this.ship.width / 2, this.ship.height + 15 + Math.random() * 10);
      this.ctx.closePath();
      this.ctx.fill();
    }

    // Ship Body
    const grad = this.ctx.createLinearGradient(0, 0, 0, this.ship.height);
    grad.addColorStop(0, '#00d9ff');
    grad.addColorStop(1, '#ff007f');
    this.ctx.fillStyle = grad;
    this.ctx.beginPath();
    this.ctx.moveTo(this.ship.width / 2, 0); // nose
    this.ctx.lineTo(this.ship.width, this.ship.height); // right wing
    this.ctx.lineTo(this.ship.width / 2 + 10, this.ship.height - 10);
    this.ctx.lineTo(this.ship.width / 2 - 10, this.ship.height - 10);
    this.ctx.lineTo(0, this.ship.height); // left wing
    this.ctx.closePath();
    this.ctx.fill();

    // Shield bubble if high health
    this.ctx.strokeStyle = "rgba(0, 217, 255, 0.2)";
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(this.ship.width / 2, this.ship.height / 2, 35, 0, Math.PI * 2);
    this.ctx.stroke();

    this.ctx.restore();

    // 3. Draw Lasers
    this.ctx.fillStyle = "#ff007f";
    this.ctx.shadowBlur = 10;
    this.ctx.shadowColor = "#ff007f";
    this.lasers.forEach(l => {
      this.ctx.fillRect(l.x, l.y, l.width, l.height);
    });
    this.ctx.shadowBlur = 0; // reset

    // 4. Draw Enemies
    this.enemies.forEach(e => {
      this.ctx.save();
      this.ctx.translate(e.x, e.y);

      // Enemy Pod shape (retro invader)
      const pulseVal = Math.sin(e.pulse) * 4;
      this.ctx.fillStyle = e.isCorrect ? "rgba(0, 217, 255, 0.2)" : "rgba(255, 255, 255, 0.1)";
      this.ctx.strokeStyle = e.isCorrect ? "var(--neon-blue)" : "rgba(255, 255, 255, 0.4)";
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.roundRect(0, 0, e.width, e.height, 8);
      this.ctx.fill();
      this.ctx.stroke();

      // Enemy details (glow engine)
      this.ctx.fillStyle = e.isCorrect ? "var(--neon-blue)" : "rgba(255, 255, 255, 0.3)";
      this.ctx.beginPath();
      this.ctx.arc(e.width / 2, e.height - 6, 8 + pulseVal / 2, 0, Math.PI * 2);
      this.ctx.fill();

      // Choice Text
      this.ctx.fillStyle = "#ffffff";
      this.ctx.font = "bold 0.85rem Outfit, sans-serif";
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";
      this.ctx.fillText(e.text, e.width / 2, e.height / 2 - 2);

      this.ctx.restore();
    });
  },

  endGame() {
    this.destroy();
    SoundFX.playWin();

    this.container.innerHTML = `
      <div class="game-win-overlay">
        <div class="win-title">${this.health <= 0 ? "💥 船體被毀！遊戲結束" : "🏆 挑戰完成！"}</div>
        <p>你在太空防禦與答題任務中表現出色！</p>
        <div class="win-score">SCORE: ${this.score}</div>
        <p style="color:var(--text-muted)">擊中正確目標: ${this.correctCount} 次 / 發射子彈: ${this.totalShots} 發</p>
        <button id="btn-win-exit" class="btn btn-neon-pink">退出並登錄成績</button>
      </div>
    `;

    document.getElementById('btn-win-exit').addEventListener('click', async () => {
      SoundFX.playClick();
      const exitBtn = document.getElementById('btn-win-exit');
      exitBtn.disabled = true;
      exitBtn.textContent = "上傳成績中...";

      await GAS_API.logScore("太空開拓者", this.score, this.correctCount, this.totalShots);

      // Go back to lobby
      document.getElementById('game-stage').classList.add('hidden');
      document.getElementById('arcade-lobby').classList.remove('hidden');
      ArcadeState.currentGame = null;
    });
  },

  destroy() {
    clearInterval(this.timerInterval);
    cancelAnimationFrame(this.animationId);
    
    // Remove listeners
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    if (this.canvas) {
      this.canvas.removeEventListener('mousemove', this.handleMouseMove);
      this.canvas.removeEventListener('click', this.handleMouseClick);
    }
  }
};

window.ShooterGame = ShooterGame;
