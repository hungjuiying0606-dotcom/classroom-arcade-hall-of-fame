/* ==========================================
   CLASSROOM ARCADE - SPIN THE WHEEL (spin.js)
   ========================================== */

const SpinGame = {
  container: null, score: 0, timeLeft: 90, timerInterval: null,
  canvas: null, ctx: null,
  spinning: false, angle: 0, spinSpeed: 0, segments: 8,
  correctCount: 0, totalSpins: 0,
  sessionQuestions: [], currentQuestionIndex: 0, currentQuestion: null,

  init() {
    this.container = document.getElementById('game-body');
    this.score = 0; this.timeLeft = 90; this.correctCount = 0; this.totalSpins = 0;
    this.sessionQuestions = ArcadeState.getRandomQuestions(12);
    this.currentQuestionIndex = 0; this.spinning = false; this.angle = 0; this.spinSpeed = 0;
    document.getElementById('game-stage-title').textContent = "轉轉樂";
    document.getElementById('game-score').textContent = "0";
    this.renderStage();
    this.canvas = document.getElementById('spin-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', this.resize);
    this.canvas.addEventListener('pointerdown', this.onSpin);
    this.draw();
    this.startTimers();
  },

  resize: () => { const g = SpinGame; if (!g.canvas) return; g.canvas.width = g.canvas.clientWidth; g.canvas.height = g.canvas.clientHeight; },

  renderStage() {
    this.container.innerHTML = `<div style="width:100%;height:100%;background:#0f111a;border-radius:12px;overflow:hidden;position:relative;border:2px solid var(--neon-purple);display:flex;flex-direction:column;">
      <div style="padding:8px 16px;background:rgba(200,0,255,0.1);border-bottom:1px solid rgba(200,0,255,0.3);text-align:center;">
        <span id="spin-status" style="color:#fff;font-size:0.9rem;font-weight:700;">👆 點擊轉盤開始旋轉！</span>
      </div>
      <canvas id="spin-canvas" style="flex:1;width:100%;display:block;touch-action:none;"></canvas>
    </div>`;
  },

  onSpin: () => {
    const g = SpinGame; if (g.spinning || g.currentQuestionIndex >= g.sessionQuestions.length) return;
    g.spinning = true; g.spinSpeed = 20 + Math.random() * 30;
    g.totalSpins++;
    document.getElementById('spin-status').textContent = "🌀 旋轉中...";
  },

  startTimers() {
    this.timerInterval = setInterval(() => {
      this.timeLeft--; document.getElementById('game-timer').textContent = `${this.timeLeft}s`;
      if (this.timeLeft <= 0) this.endGame();
    }, 1000);
    this.spinLoop();
  },

  spinLoop() {
    if (this.spinSpeed > 0.5) {
      this.angle += this.spinSpeed;
      this.spinSpeed *= 0.97;
      this.draw();
      requestAnimationFrame(() => this.spinLoop());
    } else if (this.spinning) {
      this.spinning = false;
      this.draw();
      this.askQuestion();
    }
  },

  askQuestion() {
    if (this.currentQuestionIndex >= this.sessionQuestions.length) { this.endGame(); return; }
    const raw = this.sessionQuestions[this.currentQuestionIndex++];
    this.currentQuestion = ArcadeState.getMultipleChoiceQuestion(raw);
    const seg = Math.floor(((this.angle % 360) / 360) * this.segments);
    const colors = ['紅', '藍', '綠', '金', '紫', '粉', '青', '橙'];
    document.getElementById('spin-status').textContent = `🎯 停在 ${colors[seg]} 色區域！回答問題！`;
    QuestionModal.show(this.currentQuestion, 15, (isCorrect) => {
      if (isCorrect) { this.score += 100 + seg * 20; this.correctCount++; SoundFX.playSuccess(); }
      else { this.score = Math.max(0, this.score - 20); SoundFX.playFail(); }
      document.getElementById('game-score').textContent = this.score;
      document.getElementById('spin-status').textContent = "👆 點擊轉盤繼續！";
    });
  },

  draw() {
    const c = this.canvas, ctx = this.ctx;
    ctx.clearRect(0, 0, c.width, c.height);
    const cx = c.width / 2, cy = c.height / 2, r = Math.min(cx, cy) - 20;
    const segAngle = (Math.PI * 2) / this.segments;
    const colors = ['#e17055', '#0984e3', '#00b894', '#fdcb6e', '#6c5ce7', '#fd79a8', '#00cec9', '#e17055'];
    for (let i = 0; i < this.segments; i++) {
      const start = this.angle * Math.PI / 180 + i * segAngle;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r, start, start + segAngle); ctx.closePath();
      ctx.fillStyle = colors[i % colors.length]; ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.2)"; ctx.lineWidth = 1; ctx.stroke();
      const labelAngle = start + segAngle / 2;
      ctx.fillStyle = "#fff"; ctx.font = "bold 16px Outfit,sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(["✦","●","■","★","◆","▲","♥","♦"][i], cx + Math.cos(labelAngle) * r * 0.65, cy + Math.sin(labelAngle) * r * 0.65);
    }
    ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(cx, cy, 18, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#333"; ctx.beginPath(); ctx.arc(cx, cy, 14, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.font = "bold 14px Outfit,sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("SPIN", cx, cy);
    ctx.fillStyle = "#ff0"; ctx.beginPath();
    ctx.moveTo(cx + r + 15, cy); ctx.lineTo(cx + r, cy - 10); ctx.lineTo(cx + r, cy + 10); ctx.closePath(); ctx.fill();
  },

  endGame() {
    this.destroy(); SoundFX.playWin();
    this.container.innerHTML = `<div class="game-win-overlay"><div class="win-title">🏆 轉轉樂結束！</div><div class="win-score">SCORE: ${this.score}</div><p style="color:var(--text-muted)">答對: ${this.correctCount} / 旋轉: ${this.totalSpins}</p><button id="btn-win-exit" class="btn btn-neon-purple">退出並登錄成績</button></div>`;
    document.getElementById('btn-win-exit').addEventListener('click', async () => {
      SoundFX.playClick(); const b = document.getElementById('btn-win-exit'); b.disabled = true; b.textContent = "上傳成績中...";
      await GAS_API.logScore("轉轉樂", this.score, this.correctCount, this.totalSpins);
      document.getElementById('game-stage').classList.add('hidden'); document.getElementById('arcade-lobby').classList.remove('hidden'); ArcadeState.currentGame = null;
    });
  },

  destroy() {
    clearInterval(this.timerInterval);
    if (this.canvas) { this.canvas.removeEventListener('pointerdown', this.onSpin); }
    window.removeEventListener('resize', this.resize);
  }
};
window.SpinGame = SpinGame;
