/* ==========================================
   CLASSROOM ARCADE - TARGET (target.js)
   ========================================== */

const TargetGame = {
  container: null, score: 0, timeLeft: 60, timerInterval: null,
  animationId: null, canvas: null, ctx: null,
  targets: [], lives: 5, gameOver: false,
  correctCount: 0, totalShots: 0,
  sessionQuestions: [], currentQuestionIndex: 0, currentTargets: [],
  round: 0, spawnTimer: 0,

  init() {
    this.container = document.getElementById('game-body');
    this.score = 0; this.timeLeft = 60; this.correctCount = 0; this.totalShots = 0;
    this.lives = 5; this.round = 0; this.spawnTimer = 0; this.gameOver = false;
    this.sessionQuestions = ArcadeState.getRandomQuestions(20);
    this.currentQuestionIndex = 0; this.targets = [];
    document.getElementById('game-stage-title').textContent = "瞄準高手";
    document.getElementById('game-score').textContent = "0";
    this.renderStage();
    this.canvas = document.getElementById('target-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', this.resize);
    this.canvas.addEventListener('pointerdown', this.onShoot);
    this.nextRound();
    this.startTimers();
    this.loop();
  },

  resize: () => { const g = TargetGame; if (!g.canvas) return; g.canvas.width = g.canvas.clientWidth; g.canvas.height = g.canvas.clientHeight; },

  renderStage() {
    this.container.innerHTML = `<div style="width:100%;height:100%;background:#0f111a;border-radius:12px;overflow:hidden;display:flex;flex-direction:column;border:2px solid var(--neon-green);">
      <div style="padding:8px 16px;background:rgba(0,255,127,0.1);border-bottom:1px solid rgba(0,255,127,0.3);text-align:center;">
        <span id="target-status" style="color:#fff;font-size:0.9rem;font-weight:700;">🎯 點擊標靶射中正確答案！</span>
      </div>
      <div style="flex:1;position:relative;">
        <canvas id="target-canvas" style="position:absolute;top:0;left:0;width:100%;height:100%;display:block;touch-action:none;"></canvas>
      </div>
    </div>`;
  },

  nextRound() {
    if (this.currentQuestionIndex >= this.sessionQuestions.length) { this.endGame(); return; }
    if (this.lives <= 0) { this.endGame(); return; }
    this.currentTargets = []; this.spawnTimer = 0;
    const raw = this.sessionQuestions[this.currentQuestionIndex++];
    if (!raw) { this.endGame(); return; }
    const q = ArcadeState.getMultipleChoiceQuestion(raw);
    this.currentQ = q;
    document.getElementById('target-status').textContent = `🎯 找出正確答案：${q.question.substring(0,50)}`;
    const shuffled = ArcadeState.shuffleArray([...Array(4).keys()]);
    for (let i = 0; i < 4; i++) {
      const optIdx = shuffled[i];
      this.currentTargets.push({
        optIdx, isCorrect: optIdx === q.answer,
        text: q.options[optIdx],
        x: 80 + (i % 2) * (this.canvas.width * 0.45),
        y: 60 + Math.floor(i / 2) * (this.canvas.height * 0.4),
        r: 50 + Math.random() * 20,
        angle: 0, alive: true, opacity: 1
      });
    }
  },

  onShoot: (e) => {
    const g = TargetGame; if (g.gameOver) return;
    const r = g.canvas.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    for (const t of g.currentTargets) {
      if (!t.alive) continue;
      const dx = x - (t.x + t.r), dy = y - (t.y + t.r);
      if (dx * dx + dy * dy < t.r * t.r) {
        t.alive = false; g.totalShots++;
        if (t.isCorrect) {
          g.score += 200; g.correctCount++; SoundFX.playSuccess();
          document.getElementById('target-status').textContent = '✅ 正中目標！';
          setTimeout(() => { if (!g.gameOver) g.nextRound(); }, 800);
        } else {
          g.lives--; g.score = Math.max(0, g.score - 30); SoundFX.playFail();
          document.getElementById('target-status').textContent = `❌ 錯了！剩餘生命: ${'❤️'.repeat(g.lives)}`;
          if (g.lives <= 0) { g.endGame(); return; }
          setTimeout(() => { if (!g.gameOver) g.nextRound(); }, 800);
        }
        document.getElementById('game-score').textContent = g.score;
        break;
      }
    }
  },

  startTimers() {
    this.timerInterval = setInterval(() => {
      this.timeLeft--; document.getElementById('game-timer').textContent = `${this.timeLeft}s | ❤️ ${this.lives}`;
      if (this.timeLeft <= 0) this.endGame();
    }, 1000);
  },

  loop() {
    this.update();
    this.draw();
    this.animationId = requestAnimationFrame(() => this.loop());
  },

  update() {
    for (const t of this.currentTargets) {
      if (t.alive) t.angle += 0.02;
    }
  },

  draw() {
    const c = this.canvas, ctx = this.ctx;
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.fillStyle = "#0f111a"; ctx.fillRect(0, 0, c.width, c.height);
    for (const t of this.currentTargets) {
      if (!t.alive) continue;
      const cx = t.x + t.r, cy = t.y + t.r;
      ctx.save(); ctx.translate(cx, cy);
      ctx.fillStyle = t.isCorrect ? 'rgba(0,184,148,0.15)' : 'rgba(225,112,85,0.15)';
      ctx.beginPath(); ctx.arc(0, 0, t.r + 8, 0, Math.PI * 2); ctx.fill();
      for (let i = 3; i >= 0; i--) {
        const ringR = t.r * (i + 1) / 4;
        ctx.fillStyle = i % 2 === 0 ? (t.isCorrect ? '#00b894' : '#e17055') : '#fff';
        ctx.beginPath(); ctx.arc(0, 0, ringR, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.2)'; ctx.lineWidth = 1; ctx.stroke();
      }
      ctx.restore();
      ctx.fillStyle = "#1a1a2e"; ctx.font = "bold 14px Outfit,sans-serif";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      const label = t.text.length > 12 ? t.text.substring(0,11) + '…' : t.text;
      ctx.fillText(label, cx, cy);
    }
  },

  endGame() {
    this.gameOver = true; this.destroy(); SoundFX.playWin();
    this.container.innerHTML = `<div class="game-win-overlay"><div class="win-title">🏆 瞄準高手結束！</div><div class="win-score">SCORE: ${this.score}</div><p style="color:var(--text-muted)">答對: ${this.correctCount} / 射擊: ${this.totalShots}</p><button id="btn-win-exit" class="btn btn-neon-green">退出並登錄成績</button></div>`;
    document.getElementById('btn-win-exit').addEventListener('click', async () => {
      SoundFX.playClick(); const b = document.getElementById('btn-win-exit'); b.disabled = true; b.textContent = "上傳成績中...";
      await GAS_API.logScore("瞄準高手", this.score, this.correctCount, this.totalShots);
      document.getElementById('game-stage').classList.add('hidden'); document.getElementById('arcade-lobby').classList.remove('hidden'); ArcadeState.currentGame = null;
    });
  },

  destroy() {
    clearInterval(this.timerInterval); cancelAnimationFrame(this.animationId);
    if (this.canvas) { this.canvas.removeEventListener('pointerdown', this.onShoot); }
    window.removeEventListener('resize', this.resize);
  }
};
window.TargetGame = TargetGame;
