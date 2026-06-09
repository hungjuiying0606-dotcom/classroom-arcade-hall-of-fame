/* ==========================================
   CLASSROOM ARCADE - DODGE (dodge.js)
   ========================================== */

const DodgeGame = {
  container: null, score: 0, timeLeft: 45, timerInterval: null,
  animationId: null, canvas: null, ctx: null,
  player: { x: 0, y: 0, w: 50, h: 50 }, obstacles: [],
  correctCount: 0, totalDodged: 0,
  sessionQuestions: [], currentQuestionIndex: 0, currentQuestion: null,
  questionCooldown: 0, spawnTimer: 0, gameOver: false,

  init() {
    this.container = document.getElementById('game-body');
    this.score = 0; this.timeLeft = 45; this.correctCount = 0; this.totalDodged = 0;
    this.sessionQuestions = ArcadeState.getRandomQuestions(20);
    this.currentQuestionIndex = 0; this.obstacles = []; this.spawnTimer = 0;
    this.questionCooldown = 0; this.gameOver = false;
    document.getElementById('game-stage-title').textContent = "閃避王";
    document.getElementById('game-score').textContent = "0";
    this.renderStage();
    this.canvas = document.getElementById('dodge-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', this.resize);
    this.canvas.addEventListener('pointerdown', this.onTap);
    this.player.x = this.canvas.width / 2 - 25;
    this.player.y = this.canvas.height - 80;
    this.startTimers();
    this.loop();
  },

  resize: () => { const g = DodgeGame; if (!g.canvas) return; g.canvas.width = g.canvas.clientWidth; g.canvas.height = g.canvas.clientHeight; },

  renderStage() {
    this.container.innerHTML = `<div style="width:100%;height:100%;background:#0f111a;border-radius:12px;overflow:hidden;position:relative;border:2px solid var(--neon-green);">
      <div style="padding:8px 16px;background:rgba(0,255,127,0.1);border-bottom:1px solid rgba(0,255,127,0.3);text-align:center;">
        <span id="dodge-status" style="color:#fff;font-size:0.9rem;font-weight:700;">👈 點擊左側/右側閃避 👉</span>
      </div>
      <canvas id="dodge-canvas" style="width:100%;height:calc(100% - 42px);display:block;touch-action:none;"></canvas>
    </div>`;
  },

  onTap: (e) => {
    const g = DodgeGame; if (g.gameOver) return;
    const r = g.canvas.getBoundingClientRect();
    const x = e.clientX - r.left;
    if (x < g.canvas.width / 2) g.player.x = Math.max(10, g.player.x - 80);
    else g.player.x = Math.min(g.canvas.width - g.player.w - 10, g.player.x + 80);
  },

  spawnObstacle() {
    const size = 20 + Math.random() * 30;
    const x = Math.random() * (this.canvas.width - size);
    const types = ['⬜', '🔴', '🟡', '🟢', '🟣'];
    this.obstacles.push({ x, y: -size, w: size, h: size, speed: 2 + Math.random() * 3, label: types[Math.floor(Math.random() * types.length)] });
  },

  startTimers() {
    this.timerInterval = setInterval(() => {
      if (this.gameOver) return;
      this.timeLeft--; document.getElementById('game-timer').textContent = `${this.timeLeft}s`;
      if (this.timeLeft <= 0) this.endGame();
    }, 1000);
  },

  loop() {
    this.update(); this.draw();
    this.animationId = requestAnimationFrame(() => this.loop());
  },

  update() {
    if (this.gameOver) return;
    this.spawnTimer++;
    if (this.spawnTimer > 20) { this.spawnObstacle(); this.spawnTimer = 0; }
    const h = this.canvas.height; const p = this.player;
    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const o = this.obstacles[i]; o.y += o.speed;
      if (o.y + o.h > h) { this.obstacles.splice(i, 1); this.totalDodged++; this.score++; continue; }
      if (o.x + o.w > p.x && o.x < p.x + p.w && o.y + o.h > p.y && o.y < p.y + p.h) {
        this.score = Math.max(0, this.score - 5); SoundFX.playFail();
        this.obstacles.splice(i, 1); continue;
      }
    }
    this.questionCooldown++;
    if (this.questionCooldown > 120 && this.currentQuestionIndex < this.sessionQuestions.length) {
      this.questionCooldown = 0; this.showQuestion();
    }
    document.getElementById('game-score').textContent = this.score;
  },

  showQuestion() {
    const raw = this.sessionQuestions[this.currentQuestionIndex++];
    if (!raw) return;
    this.currentQuestion = ArcadeState.getMultipleChoiceQuestion(raw);
    QuestionModal.show(this.currentQuestion, 12, (isCorrect) => {
      if (isCorrect) { this.score += 50; this.correctCount++; SoundFX.playSuccess(); }
      else { this.score = Math.max(0, this.score - 20); SoundFX.playFail(); }
      document.getElementById('game-score').textContent = this.score;
    });
  },

  draw() {
    const c = this.canvas, ctx = this.ctx, h = c.height;
    ctx.clearRect(0, 0, c.width, h);
    for (let y = 0; y < h; y += 40) {
      ctx.fillStyle = (y / 40) % 2 === 0 ? '#0f111a' : '#131626';
      ctx.fillRect(0, y, c.width, 40);
    }
    this.obstacles.forEach(o => {
      ctx.font = `${o.w}px sans-serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(o.label, o.x + o.w / 2, o.y + o.h / 2);
    });
    ctx.fillStyle = "#00b894"; ctx.beginPath(); ctx.roundRect(this.player.x, this.player.y, this.player.w, this.player.h, 10); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.font = "28px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("🧑", this.player.x + this.player.w / 2, this.player.y + this.player.h / 2);
  },

  endGame() {
    this.gameOver = true; this.destroy(); SoundFX.playWin();
    this.container.innerHTML = `<div class="game-win-overlay"><div class="win-title">🏆 閃避王挑戰結束！</div><div class="win-score">SCORE: ${this.score}</div><p style="color:var(--text-muted)">答對: ${this.correctCount} / 閃避: ${this.totalDodged}</p><button id="btn-win-exit" class="btn btn-neon-green">退出並登錄成績</button></div>`;
    document.getElementById('btn-win-exit').addEventListener('click', async () => {
      SoundFX.playClick(); const b = document.getElementById('btn-win-exit'); b.disabled = true; b.textContent = "上傳成績中...";
      await GAS_API.logScore("閃避王", this.score, this.correctCount, this.totalDodged);
      document.getElementById('game-stage').classList.add('hidden'); document.getElementById('arcade-lobby').classList.remove('hidden'); ArcadeState.currentGame = null;
    });
  },

  destroy() {
    clearInterval(this.timerInterval); cancelAnimationFrame(this.animationId);
    if (this.canvas) { this.canvas.removeEventListener('pointerdown', this.onTap); }
    window.removeEventListener('resize', this.resize);
  }
};
window.DodgeGame = DodgeGame;
