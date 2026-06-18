/* ==========================================
   CLASSROOM ARCADE - PONG (pong.js)
   ========================================== */

const PongGame = {
  container: null, score: 0, timeLeft: 90, timerInterval: null,
  animationId: null, canvas: null, ctx: null,
  paddle: {x:0,w:120,h:14,y:0}, ball: {x:0,y:0,vx:0,vy:0,r:10},
  bricks: [], cols: 6, rows: 3, gameOver: false,
  correctCount: 0, totalHits: 0, lives: 3,
  sessionQuestions: [], currentQuestionIndex: 0,

  init() {
    this.container = document.getElementById('game-body');
    this.score = 0; this.timeLeft = 90; this.correctCount = 0; this.totalHits = 0; this.lives = 3;
    this.sessionQuestions = ArcadeState.getRandomQuestions(18);
    this.currentQuestionIndex = 0; this.gameOver = false;
    document.getElementById('game-stage-title').textContent = "彈球王";
    document.getElementById('game-score').textContent = "0";
    this.renderStage();
    this.canvas = document.getElementById('pong-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', this.resize);
    this.canvas.addEventListener('pointermove', this.onMove);
    this.canvas.addEventListener('pointerdown', () => { if (PongGame.ball.vx===0&&PongGame.ball.vy===0) PongGame.launchBall(); });
    this.resetBall();
    this.buildBricks();
    this.startTimers();
    this.loop();
  },

  resize: () => { const g = PongGame; if (!g.canvas) return; g.canvas.width = g.canvas.clientWidth; g.canvas.height = g.canvas.clientHeight; g.paddle.y = g.canvas.height - 30; },

  renderStage() {
    this.container.innerHTML = `<div style="width:100%;height:100%;background:#0f111a;border-radius:12px;overflow:hidden;display:flex;flex-direction:column;border:2px solid var(--neon-blue);">
      <div style="padding:8px 16px;background:rgba(0,127,255,0.1);border-bottom:1px solid rgba(0,127,255,0.3);text-align:center;">
        <span id="pong-status" style="color:#fff;font-size:0.9rem;font-weight:700;">👆 點擊發球 / 移動滑鼠控制板子 ❤️3</span>
      </div>
      <canvas id="pong-canvas" style="flex:1;width:100%;display:block;touch-action:none;"></canvas>
    </div>`;
  },

  onMove: (e) => {
    const g = PongGame; if (!g.canvas) return;
    const r = g.canvas.getBoundingClientRect();
    g.paddle.x = Math.max(0, Math.min(g.canvas.width - g.paddle.w, e.clientX - r.left - g.paddle.w / 2));
  },

  buildBricks() {
    this.bricks = [];
    const bw = this.canvas ? Math.floor((this.canvas.width - 40) / this.cols) : 100;
    const bh = 28;
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const idx = r * this.cols + c;
        if (idx < this.sessionQuestions.length) {
          const q = ArcadeState.getMultipleChoiceQuestion(this.sessionQuestions[idx]);
          this.bricks.push({ x: 20 + c * bw, y: 30 + r * (bh + 8), w: bw - 6, h: bh, alive: true, question: q, label: q.options[q.answer].substring(0,6) });
        }
      }
    }
  },

  resetBall() {
    if (!this.canvas) return;
    this.ball.x = this.canvas.width / 2; this.ball.y = this.canvas.height - 60;
    this.ball.vx = 0; this.ball.vy = 0;
  },

  launchBall() {
    this.ball.vx = (Math.random() > 0.5 ? 1 : -1) * (3 + Math.random() * 2);
    this.ball.vy = -5;
  },

  startTimers() {
    this.timerInterval = setInterval(() => {
      this.timeLeft--; document.getElementById('game-timer').textContent = `${this.timeLeft}s | ❤️ ${this.lives}`;
      document.getElementById('pong-status').textContent = `👆 點擊發球 / 移動滑鼠控制板子 ❤️${this.lives}`;
      if (this.timeLeft <= 0) this.endGame();
    }, 1000);
  },

  loop() { this.update(); this.draw(); this.animationId = requestAnimationFrame(() => this.loop()); },

  update() {
    if (this.gameOver) return;
    this.ball.x += this.ball.vx; this.ball.y += this.ball.vy;
    if (this.ball.x - this.ball.r < 0 || this.ball.x + this.ball.r > this.canvas.width) this.ball.vx *= -1;
    if (this.ball.y - this.ball.r < 0) this.ball.vy *= -1;
    if (this.ball.y + this.ball.r > this.canvas.height) {
      this.lives--;
      if (this.lives <= 0) { this.endGame(); return; }
      this.resetBall();
      return;
    }
    if (this.ball.vy > 0 && this.ball.y + this.ball.r > this.paddle.y &&
        this.ball.x > this.paddle.x && this.ball.x < this.paddle.x + this.paddle.w) {
      this.ball.vy = -Math.abs(this.ball.vy);
      this.ball.vx += (this.ball.x - (this.paddle.x + this.paddle.w / 2)) * 0.03;
    }
    for (const b of this.bricks) {
      if (!b.alive) continue;
      if (this.ball.x + this.ball.r > b.x && this.ball.x - this.ball.r < b.x + b.w &&
          this.ball.y + this.ball.r > b.y && this.ball.y - this.ball.r < b.y + b.h) {
        b.alive = false; this.totalHits++;
        this.ball.vy *= -1;
        QuestionModal.show(b.question, 10, (isCorrect) => {
          if (isCorrect) { this.score += 100; this.correctCount++; SoundFX.playSuccess(); }
          else { this.score = Math.max(0, this.score - 20); SoundFX.playFail(); }
          document.getElementById('game-score').textContent = this.score;
        });
        break;
      }
    }
    if (this.bricks.every(b => !b.alive)) { this.endGame(); return; }
  },

  draw() {
    const c = this.canvas, ctx = this.ctx;
    ctx.clearRect(0, 0, c.width, c.height); ctx.fillStyle = "#0f111a"; ctx.fillRect(0, 0, c.width, c.height);
    this.bricks.forEach(b => {
      if (!b.alive) return;
      const grad = ctx.createLinearGradient(b.x, b.y, b.x, b.y + b.h);
      grad.addColorStop(0, '#0984e3'); grad.addColorStop(1, '#074b8c');
      ctx.fillStyle = grad; ctx.beginPath(); ctx.roundRect(b.x, b.y, b.w, b.h, 4); ctx.fill();
      ctx.fillStyle = "#fff"; ctx.font = "bold 11px Outfit,sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(b.label, b.x + b.w / 2, b.y + b.h / 2);
    });
    ctx.fillStyle = "#74b9ff"; ctx.beginPath(); ctx.roundRect(this.paddle.x, this.paddle.y, this.paddle.w, this.paddle.h, 6); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(this.ball.x, this.ball.y, this.ball.r, 0, Math.PI * 2); ctx.fill();
  },

  endGame() {
    this.gameOver = true; this.destroy(); SoundFX.playWin();
    this.container.innerHTML = `<div class="game-win-overlay"><div class="win-title">🏆 彈球王結束！</div><div class="win-score">SCORE: ${this.score}</div><p style="color:var(--text-muted)">答對: ${this.correctCount} / 磚塊: ${this.totalHits}</p><button id="btn-win-exit" class="btn btn-neon-blue">退出並登錄成績</button></div>`;
    document.getElementById('btn-win-exit').addEventListener('click', async () => {
      SoundFX.playClick(); const b = document.getElementById('btn-win-exit'); b.disabled = true; b.textContent = "上傳成績中...";
      await GAS_API.logScore("彈球王", this.score, this.correctCount, this.totalHits);
      document.getElementById('game-stage').classList.add('hidden'); document.getElementById('arcade-lobby').classList.remove('hidden'); ArcadeState.currentGame = null;
    });
  },

  destroy() {
    clearInterval(this.timerInterval); cancelAnimationFrame(this.animationId);
    if (this.canvas) { this.canvas.removeEventListener('pointermove', this.onMove); }
    window.removeEventListener('resize', this.resize);
  }
};
window.PongGame = PongGame;
