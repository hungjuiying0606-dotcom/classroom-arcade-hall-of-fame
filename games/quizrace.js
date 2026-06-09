/* ==========================================
   CLASSROOM ARCADE - QUIZ RACE (quizrace.js)
   ========================================== */

const QuizRaceGame = {
  container: null, score: 0, timeLeft: 90, timerInterval: null,
  canvas: null, ctx: null,
  player: {x:0,y:0,progress:0}, obstacles: [],
  raceLength: 800, gameOver: false,
  correctCount: 0, totalAnswered: 0,
  sessionQuestions: [], currentQuestionIndex: 0, currentQuestion: null,
  laneY: 0,

  init() {
    this.container = document.getElementById('game-body');
    this.score = 0; this.timeLeft = 90; this.correctCount = 0; this.totalAnswered = 0;
    this.sessionQuestions = ArcadeState.getRandomQuestions(20);
    this.currentQuestionIndex = 0; this.gameOver = false;
    this.player = {x:50,progress:0}; this.obstacles = [];
    document.getElementById('game-stage-title').textContent = "答題賽跑";
    document.getElementById('game-score').textContent = "0";
    this.renderStage();
    this.canvas = document.getElementById('race-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', this.resize);
    this.canvas.addEventListener('pointerdown', this.onTap);
    this.laneY = this.canvas.height / 2;
    this.player.y = this.laneY;
    this.startTimers();
    this.askQuestion();
    this.loop();
  },

  resize: () => { const g = QuizRaceGame; if (!g.canvas) return; g.canvas.width = g.canvas.clientWidth; g.canvas.height = g.canvas.clientHeight; g.laneY = g.canvas.height / 2; },

  renderStage() {
    this.container.innerHTML = `<div style="width:100%;height:100%;background:#0f111a;border-radius:12px;overflow:hidden;display:flex;flex-direction:column;border:2px solid var(--neon-purple);">
      <div style="padding:8px 16px;background:rgba(200,0,255,0.1);border-bottom:1px solid rgba(200,0,255,0.3);text-align:center;">
        <span id="race-status" style="color:#fff;font-size:0.9rem;font-weight:700;">🏃 答對往前衝！點擊畫面回答問題</span>
      </div>
      <canvas id="race-canvas" style="flex:1;width:100%;display:block;touch-action:none;"></canvas>
    </div>`;
  },

  onTap: () => {
    const g = QuizRaceGame; if (g.gameOver || g.currentQuestionIndex >= g.sessionQuestions.length) return;
    if (!g.currentQuestion) return;
    g.showQuestion();
  },

  showQuestion() {
    QuestionModal.show(this.currentQuestion, 15, (isCorrect) => {
      this.totalAnswered++;
      if (isCorrect) {
        this.player.progress += 60 + Math.random() * 40;
        this.score += 100; this.correctCount++; SoundFX.playSuccess();
      } else {
        this.player.progress = Math.max(0, this.player.progress - 20);
        this.score = Math.max(0, this.score - 30); SoundFX.playFail();
      }
      document.getElementById('game-score').textContent = this.score;
      document.getElementById('race-status').textContent = `🏃 ${Math.floor(this.player.progress / this.raceLength * 100)}% 完成`;
      if (this.player.progress >= this.raceLength) { this.endGame(); return; }
      this.askQuestion();
    });
  },

  askQuestion() {
    if (this.currentQuestionIndex >= this.sessionQuestions.length) { this.endGame(); return; }
    const raw = this.sessionQuestions[this.currentQuestionIndex++];
    this.currentQuestion = ArcadeState.getMultipleChoiceQuestion(raw);
    document.getElementById('race-status').textContent = `❓ 點擊回答：${this.currentQuestion.question.substring(0,40)}...`;
  },

  startTimers() {
    this.timerInterval = setInterval(() => {
      this.timeLeft--; document.getElementById('game-timer').textContent = `${this.timeLeft}s`;
      if (this.timeLeft <= 0) this.endGame();
    }, 1000);
  },

  loop() { this.draw(); this.animationId = requestAnimationFrame(() => this.loop()); },

  draw() {
    const c = this.canvas, ctx = this.ctx;
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.fillStyle = "#0f111a"; ctx.fillRect(0, 0, c.width, c.height);

    const laneH = 60;
    ctx.fillStyle = "rgba(255,255,255,0.05)"; ctx.fillRect(0, this.laneY - laneH/2, c.width, laneH);
    ctx.strokeStyle = "rgba(255,255,255,0.1)"; ctx.setLineDash([10,10]);
    ctx.beginPath(); ctx.moveTo(0, this.laneY - laneH/2); ctx.lineTo(c.width, this.laneY - laneH/2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, this.laneY + laneH/2); ctx.lineTo(c.width, this.laneY + laneH/2); ctx.stroke();
    ctx.setLineDash([]);

    for (let p = 0; p <= 100; p += 10) {
      const x = p / 100 * (c.width - 80) + 40;
      ctx.fillStyle = "rgba(255,255,255,0.15)"; ctx.font = "10px Outfit,sans-serif"; ctx.textAlign = "center";
      ctx.fillText(`${p}%`, x, this.laneY - laneH/2 - 8);
      ctx.fillRect(x - 1, this.laneY - laneH/2, 2, laneH);
    }

    const px = this.player.progress / this.raceLength * (c.width - 80) + 40;
    ctx.font = "36px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("🏃", px, this.laneY);

    ctx.fillStyle = "#00b894";
    ctx.font = "bold 14px Outfit,sans-serif"; ctx.textAlign = "left";
    ctx.fillText(`進度: ${Math.floor(this.player.progress / this.raceLength * 100)}%`, 20, 30);

    if (this.player.progress < this.raceLength) {
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.font = "18px Outfit,sans-serif"; ctx.textAlign = "center";
      ctx.fillText("👆 點擊回答問題", c.width / 2, c.height - 30);
    }
  },

  endGame() {
    this.gameOver = true; this.destroy();
    const won = this.player.progress >= this.raceLength;
    if (won) SoundFX.playWin(); else SoundFX.playFail();
    const title = won ? "🏆 抵達終點！" : "⏰ 時間到！";
    this.container.innerHTML = `<div class="game-win-overlay"><div class="win-title">${title}</div><div class="win-score">SCORE: ${this.score}</div><p style="color:var(--text-muted)">答對: ${this.correctCount} / 進度: ${Math.floor(this.player.progress/this.raceLength*100)}%</p><button id="btn-win-exit" class="btn btn-neon-purple">退出並登錄成績</button></div>`;
    document.getElementById('btn-win-exit').addEventListener('click', async () => {
      SoundFX.playClick(); const b = document.getElementById('btn-win-exit'); b.disabled = true; b.textContent = "上傳成績中...";
      await GAS_API.logScore("答題賽跑", this.score, this.correctCount, this.totalAnswered);
      document.getElementById('game-stage').classList.add('hidden'); document.getElementById('arcade-lobby').classList.remove('hidden'); ArcadeState.currentGame = null;
    });
  },

  destroy() {
    clearInterval(this.timerInterval); cancelAnimationFrame(this.animationId);
    if (this.canvas) { this.canvas.removeEventListener('pointerdown', this.onTap); }
    window.removeEventListener('resize', this.resize);
  }
};
window.QuizRaceGame = QuizRaceGame;
