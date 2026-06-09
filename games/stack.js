/* ==========================================
   CLASSROOM ARCADE - STACK (stack.js)
   ========================================== */

const StackGame = {
  container: null, score: 0, timeLeft: 60, timerInterval: null,
  animationId: null, canvas: null, ctx: null,
  blocks: [], currentBlock: null, blockWidth: 0, blockX: 0, blockDir: 1,
  level: 0, correctCount: 0, totalLevels: 0,
  sessionQuestions: [], currentQuestionIndex: 0,
  stacking: true, gameOver: false,

  init() {
    this.container = document.getElementById('game-body');
    this.score = 0; this.timeLeft = 60; this.level = 0; this.correctCount = 0; this.totalLevels = 0;
    this.sessionQuestions = ArcadeState.getRandomQuestions(15);
    this.currentQuestionIndex = 0; this.blocks = []; this.gameOver = false; this.stacking = true;
    document.getElementById('game-stage-title').textContent = "疊疊樂";
    document.getElementById('game-score').textContent = "0";
    this.renderStage();
    this.canvas = document.getElementById('stack-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', this.resize);
    this.canvas.addEventListener('pointerdown', this.onTap);
    this.blockWidth = this.canvas.width * 0.7;
    this.blockX = 0;
    this.startTimers();
    this.startLevel();
    this.loop();
  },

  resize: () => { const g = StackGame; if (!g.canvas) return; g.canvas.width = g.canvas.clientWidth; g.canvas.height = g.canvas.clientHeight; },

  renderStage() {
    this.container.innerHTML = `<div style="width:100%;height:100%;background:#0f111a;border-radius:12px;overflow:hidden;position:relative;border:2px solid var(--neon-gold);">
      <div style="padding:8px 16px;background:rgba(255,200,0,0.1);border-bottom:1px solid rgba(255,200,0,0.3);text-align:center;">
        <span id="stack-status" style="color:#fff;font-size:0.9rem;font-weight:700;">👆 點擊放下方塊</span>
      </div>
      <canvas id="stack-canvas" style="width:100%;height:calc(100% - 42px);display:block;touch-action:none;"></canvas>
    </div>`;
  },

  onTap: () => { const g = StackGame; if (g.gameOver || !g.stacking) return; g.dropBlock(); },

  startLevel() {
    if (this.currentQuestionIndex >= this.sessionQuestions.length) { this.endGame(); return; }
    this.stacking = false;
    const raw = this.sessionQuestions[this.currentQuestionIndex++];
    const q = ArcadeState.getMultipleChoiceQuestion(raw);
    document.getElementById('stack-status').textContent = `❓ ${q.question}`;
    QuestionModal.show(q, 12, (isCorrect) => {
      if (isCorrect) { this.score += 100; this.correctCount++; SoundFX.playSuccess(); }
      else { this.score = Math.max(0, this.score - 30); SoundFX.playFail(); }
      document.getElementById('game-score').textContent = this.score;
      this.stacking = true;
      this.blockWidth = this.level > 0 ? this.blockWidth * 0.9 : this.canvas.width * 0.7;
      this.blockX = 0;
      document.getElementById('stack-status').textContent = `👆 點擊放下方塊 (第 ${this.level + 1} 層)`;
    });
  },

  dropBlock() {
    const y = this.canvas.height - 40 - this.level * 30;
    if (this.blocks.length > 0) {
      const prev = this.blocks[this.blocks.length - 1];
      const diff = Math.abs(this.blockX - prev.x);
      if (diff > prev.w) { this.endGame(); return; }
      if (diff > 5) {
        this.blockX = this.blockX > prev.x ? prev.x + prev.w : prev.x;
        this.blockWidth = prev.w - diff;
      } else {
        this.blockX = this.blockX > prev.x ? this.blockX : prev.x;
      }
    }
    const fudge = Math.min(Math.abs(this.blockWidth), Math.abs(this.blocks.length > 0 ? this.blocks[this.blocks.length-1].w - Math.abs(this.blockX - this.blocks[this.blocks.length-1].x) : this.blockWidth));
    const actualW = Math.max(10, this.blocks.length > 0 ? Math.min(this.blockWidth, this.blocks[this.blocks.length-1].w - Math.abs(this.blockX - this.blocks[this.blocks.length-1].x)) : this.blockWidth);
    this.blocks.push({ x: this.blockX, y, w: Math.max(10, actualW), h: 28 });
    this.level++;
    this.totalLevels++;
    this.score += 20;
    document.getElementById('game-score').textContent = this.score;
    if (this.level >= 15) { this.endGame(); return; }
    this.startLevel();
  },

  startTimers() {
    this.timerInterval = setInterval(() => {
      this.timeLeft--; document.getElementById('game-timer').textContent = `${this.timeLeft}s`;
      if (this.timeLeft <= 0) this.endGame();
    }, 1000);
  },

  loop() {
    this.update(); this.draw();
    this.animationId = requestAnimationFrame(() => this.loop());
  },

  update() {
    if (!this.stacking || this.gameOver) return;
    const speed = 4 + this.level * 0.3;
    this.blockX += speed * this.blockDir;
    if (this.blockX + this.blockWidth > this.canvas.width) this.blockDir = -1;
    if (this.blockX < 0) this.blockDir = 1;
  },

  draw() {
    const c = this.canvas, ctx = this.ctx, h = c.height;
    ctx.clearRect(0, 0, c.width, h);
    ctx.fillStyle = "#0f111a"; ctx.fillRect(0, 0, c.width, h);
    this.blocks.forEach((b, i) => {
      const hue = (i * 25 + 200) % 360;
      ctx.fillStyle = `hsl(${hue}, 70%, 55%)`;
      ctx.beginPath(); ctx.roundRect(b.x, b.y, b.w, b.h, 4); ctx.fill();
      ctx.strokeStyle = `hsl(${hue}, 70%, 70%)`; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(b.x, b.y, b.w, b.h, 4); ctx.stroke();
    });
    if (this.stacking && !this.gameOver) {
      const y = h - 40 - this.level * 30;
      ctx.fillStyle = "rgba(255,200,0,0.6)";
      ctx.beginPath(); ctx.roundRect(this.blockX, y, this.blockWidth, 28, 4); ctx.fill();
    }
    ctx.fillStyle = "rgba(255,255,255,0.1)";
    ctx.fillRect(0, h - 12, c.width, 12);
  },

  endGame() {
    this.gameOver = true; this.destroy(); SoundFX.playWin();
    this.container.innerHTML = `<div class="game-win-overlay"><div class="win-title">🏆 疊疊樂結束！</div><div class="win-score">SCORE: ${this.score}</div><p style="color:var(--text-muted)">答對: ${this.correctCount} / 層數: ${this.level}</p><button id="btn-win-exit" class="btn btn-neon-gold">退出並登錄成績</button></div>`;
    document.getElementById('btn-win-exit').addEventListener('click', async () => {
      SoundFX.playClick(); const b = document.getElementById('btn-win-exit'); b.disabled = true; b.textContent = "上傳成績中...";
      await GAS_API.logScore("疊疊樂", this.score, this.correctCount, this.totalLevels);
      document.getElementById('game-stage').classList.add('hidden'); document.getElementById('arcade-lobby').classList.remove('hidden'); ArcadeState.currentGame = null;
    });
  },

  destroy() {
    clearInterval(this.timerInterval); cancelAnimationFrame(this.animationId);
    if (this.canvas) { this.canvas.removeEventListener('pointerdown', this.onTap); }
    window.removeEventListener('resize', this.resize);
  }
};
window.StackGame = StackGame;
