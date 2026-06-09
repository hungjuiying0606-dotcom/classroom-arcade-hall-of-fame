/* ==========================================
   CLASSROOM ARCADE - CATCH (catch.js)
   ========================================== */

const CatchGame = {
  container: null, score: 0, timeLeft: 60, timerInterval: null,
  animationId: null, canvas: null, ctx: null,
  currentQuestion: null, correctCount: 0, totalAttempts: 0,
  basket: { x: 0, w: 120 }, items: [], sessionQuestions: [], currentQuestionIndex: 0,
  itemTimer: 0, questionActive: false, options: [],

  init() {
    this.container = document.getElementById('game-body');
    this.score = 0; this.timeLeft = 60; this.correctCount = 0; this.totalAttempts = 0;
    this.sessionQuestions = ArcadeState.getRandomQuestions(15);
    this.currentQuestionIndex = 0; this.items = []; this.itemTimer = 0; this.questionActive = false;
    document.getElementById('game-stage-title').textContent = "接接樂";
    document.getElementById('game-score').textContent = "0";
    this.renderStage();
    this.canvas = document.getElementById('catch-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', this.resize);
    this.canvas.addEventListener('pointermove', this.onPointerMove);
    this.basket.x = this.canvas.width / 2 - this.basket.w / 2;
    this.loadQuestion();
    this.startTimers();
    this.loop();
  },

  resize: () => { const g = CatchGame; if (!g.canvas) return; g.canvas.width = g.canvas.clientWidth; g.canvas.height = g.canvas.clientHeight; },

  renderStage() {
    this.container.innerHTML = `<div style="width:100%;height:100%;background:#0f111a;border-radius:12px;overflow:hidden;position:relative;border:2px solid var(--neon-blue);">
      <div style="padding:8px 16px;background:rgba(0,127,255,0.1);border-bottom:1px solid rgba(0,127,255,0.3);text-align:center;z-index:5;">
        <span id="catch-question" style="color:#fff;font-size:0.9rem;font-weight:700;">載入中...</span>
      </div>
      <canvas id="catch-canvas" style="width:100%;height:calc(100% - 42px);display:block;touch-action:none;"></canvas>
    </div>`;
  },

  onPointerMove: (e) => {
    const g = CatchGame; if (!g.canvas) return;
    const r = g.canvas.getBoundingClientRect();
    g.basket.x = Math.max(0, Math.min(g.canvas.width - g.basket.w, e.clientX - r.left - g.basket.w / 2));
  },

  loadQuestion() {
    if (this.currentQuestionIndex >= this.sessionQuestions.length) { this.endGame(); return; }
    this.questionActive = false;
    const raw = this.sessionQuestions[this.currentQuestionIndex++];
    this.currentQuestion = ArcadeState.getMultipleChoiceQuestion(raw);
    this.options = this.currentQuestion.options;
    this.items = [];
    const opts = this.options.map((t, i) => ({ text: t, isCorrect: i === this.currentQuestion.answer }));
    this.items = opts.map(o => ({
      text: o.text, isCorrect: o.isCorrect,
      x: Math.random() * (this.canvas.width - 80), y: -40,
      w: Math.min(160, this.ctx ? this.ctx.measureText(o.text).width + 24 : 120), h: 36,
      speed: 1 + Math.random() * 1.5
    }));
    this.questionActive = true;
    document.getElementById('catch-question').textContent = this.currentQuestion.question;
  },

  startTimers() {
    this.timerInterval = setInterval(() => {
      this.timeLeft--;
      document.getElementById('game-timer').textContent = `${this.timeLeft}s`;
      if (this.timeLeft <= 0) this.endGame();
    }, 1000);
  },

  loop() {
    this.update();
    this.draw();
    this.animationId = requestAnimationFrame(() => this.loop());
  },

  update() {
    if (!this.questionActive) return;
    const h = this.canvas.height;
    for (let i = this.items.length - 1; i >= 0; i--) {
      const it = this.items[i];
      it.y += it.speed;
      if (it.y + it.h >= h - 60 && it.x + it.w > this.basket.x && it.x < this.basket.x + this.basket.w) {
        this.totalAttempts++;
        if (it.isCorrect) { this.score += 100; this.correctCount++; SoundFX.playSuccess(); }
        else { this.score = Math.max(0, this.score - 30); SoundFX.playFail(); }
        document.getElementById('game-score').textContent = this.score;
        this.items.splice(i, 1);
      } else if (it.y > h) {
        if (it.isCorrect) { this.score = Math.max(0, this.score - 20); SoundFX.playFail(); }
        this.items.splice(i, 1);
      }
    }
    if (this.items.length === 0 && this.questionActive) {
      setTimeout(() => this.loadQuestion(), 500);
    }
  },

  draw() {
    const c = this.canvas, ctx = this.ctx;
    ctx.clearRect(0, 0, c.width, c.height);
    const h = c.height;
    ctx.fillStyle = "#1a1d2e"; ctx.fillRect(0, 0, c.width, h);
    ctx.fillStyle = "rgba(0,127,255,0.15)"; ctx.fillRect(0, h - 55, c.width, 55);
    ctx.strokeStyle = "rgba(0,127,255,0.3)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, h - 55); ctx.lineTo(c.width, h - 55); ctx.stroke();
    this.items.forEach(it => {
      const grad = ctx.createLinearGradient(it.x, it.y, it.x, it.y + it.h);
      if (it.isCorrect) { grad.addColorStop(0, '#00b894'); grad.addColorStop(1, '#00a381'); }
      else { grad.addColorStop(0, '#e17055'); grad.addColorStop(1, '#d63031'); }
      ctx.fillStyle = grad; ctx.beginPath(); ctx.roundRect(it.x, it.y, it.w, it.h, 8); ctx.fill();
      ctx.fillStyle = "#fff"; ctx.font = "bold 14px Outfit,sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(it.text, it.x + it.w / 2, it.y + it.h / 2);
    });
    const bx = this.basket.x;
    ctx.fillStyle = "#0984e3"; ctx.beginPath(); ctx.moveTo(bx + 10, h - 55); ctx.lineTo(bx + this.basket.w - 10, h - 55); ctx.lineTo(bx + this.basket.w, h - 10); ctx.lineTo(bx, h - 10); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#74b9ff"; ctx.font = "18px sans-serif"; ctx.textAlign = "center";
    ctx.fillText("🧺", bx + this.basket.w / 2, h - 35);
  },

  endGame() {
    this.destroy(); SoundFX.playWin();
    this.container.innerHTML = `<div class="game-win-overlay"><div class="win-title">🏆 接接樂挑戰結束！</div><div class="win-score">SCORE: ${this.score}</div><p style="color:var(--text-muted)">答對: ${this.correctCount} / 總接取: ${this.totalAttempts}</p><button id="btn-win-exit" class="btn btn-neon-blue">退出並登錄成績</button></div>`;
    document.getElementById('btn-win-exit').addEventListener('click', async () => {
      SoundFX.playClick(); const b = document.getElementById('btn-win-exit'); b.disabled = true; b.textContent = "上傳成績中...";
      await GAS_API.logScore("接接樂", this.score, this.correctCount, this.totalAttempts);
      document.getElementById('game-stage').classList.add('hidden'); document.getElementById('arcade-lobby').classList.remove('hidden'); ArcadeState.currentGame = null;
    });
  },

  destroy() {
    clearInterval(this.timerInterval); cancelAnimationFrame(this.animationId);
    if (this.canvas) { this.canvas.removeEventListener('pointermove', this.onPointerMove); }
    window.removeEventListener('resize', this.resize);
  }
};
window.CatchGame = CatchGame;
