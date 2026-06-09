/* ==========================================
   CLASSROOM ARCADE - TOWER (tower.js)
   ========================================== */

const TowerGame = {
  container: null, score: 0, timeLeft: 90, timerInterval: null,
  floor: 1, maxFloor: 20, correctCount: 0, totalFloors: 0,
  sessionQuestions: [], currentQuestionIndex: 0, gameOver: false,

  init() {
    this.container = document.getElementById('game-body');
    this.score = 0; this.timeLeft = 90; this.floor = 1; this.correctCount = 0; this.totalFloors = 0;
    this.sessionQuestions = ArcadeState.getRandomQuestions(20);
    this.currentQuestionIndex = 0; this.gameOver = false;
    document.getElementById('game-stage-title').textContent = "高塔勇士";
    document.getElementById('game-score').textContent = "0";
    this.renderStage();
    this.startTimers();
    this.nextFloor();
  },

  renderStage() {
    this.container.innerHTML = `<div style="width:100%;height:100%;background:#0f111a;border-radius:12px;overflow:hidden;display:flex;flex-direction:column;border:2px solid var(--neon-gold);position:relative;">
      <div id="tower-visual" style="flex:1;display:flex;align-items:flex-end;justify-content:center;padding:20px;gap:4px;position:relative;">
        <div style="position:absolute;top:20px;left:20px;background:rgba(255,200,0,0.15);padding:8px 16px;border-radius:8px;border:1px solid rgba(255,200,0,0.3);">
          <span id="tower-floor" style="color:var(--neon-gold);font-weight:700;font-size:1.2rem;">樓層: 1/${this.maxFloor}</span>
        </div>
        <div id="tower-blocks" style="display:flex;align-items:flex-end;gap:2px;height:80%;"></div>
      </div>
      <div id="tower-status" style="padding:12px;background:rgba(255,200,0,0.1);border-top:1px solid rgba(255,200,0,0.3);text-align:center;color:#fff;font-size:0.9rem;">🏰 爬塔挑戰開始！回答正確往上爬！</div>
    </div>`;
    this.renderTower();
  },

  renderTower() {
    const tb = document.getElementById('tower-blocks');
    tb.innerHTML = '';
    for (let i = 1; i <= this.floor; i++) {
      const b = document.createElement('div');
      const w = Math.max(20, 100 - i * 3);
      const hue = (i * 25 + 200) % 360;
      b.style.cssText = `width:${w}px;height:30px;background:hsl(${hue},65%,50%);border-radius:4px;border:1px solid hsl(${hue},65%,65%);transition:all 0.3s;`;
      if (i === this.floor) b.style.background = `hsl(${hue},80%,60%)`;
      tb.appendChild(b);
    }
    document.getElementById('tower-floor').textContent = `樓層: ${this.floor}/${this.maxFloor}`;
  },

  nextFloor() {
    if (this.floor > this.maxFloor) { this.endGame(); return; }
    if (this.currentQuestionIndex >= this.sessionQuestions.length) { this.endGame(); return; }
    if (this.gameOver) return;
    const raw = this.sessionQuestions[this.currentQuestionIndex++];
    const q = ArcadeState.getMultipleChoiceQuestion(raw);
    document.getElementById('tower-status').textContent = `❓ 第 ${this.floor} 層：${q.question}`;
    QuestionModal.show(q, 15, (isCorrect) => {
      if (!this.gameOver) {
        this.totalFloors++;
        if (isCorrect) {
          this.score += 100 + this.floor * 10; this.correctCount++; SoundFX.playSuccess();
          this.floor++;
          this.renderTower();
          document.getElementById('tower-status').textContent = `⬆️ 爬到第 ${this.floor} 層！`;
          this.nextFloor();
        } else {
          this.score = Math.max(0, this.score - 30);
          if (this.floor > 1) this.floor--;
          SoundFX.playFail();
          this.renderTower();
          document.getElementById('tower-status').textContent = `⬇️ 掉到第 ${this.floor} 層！`;
          this.nextFloor();
        }
        document.getElementById('game-score').textContent = this.score;
      }
    });
  },

  startTimers() {
    this.timerInterval = setInterval(() => {
      this.timeLeft--; document.getElementById('game-timer').textContent = `${this.timeLeft}s`;
      if (this.timeLeft <= 0) this.endGame();
    }, 1000);
  },

  endGame() {
    if (this.gameOver) return;
    this.gameOver = true; this.destroy(); SoundFX.playWin();
    this.container.innerHTML = `<div class="game-win-overlay"><div class="win-title">🏆 高塔勇士抵達！</div><div class="win-score">SCORE: ${this.score}</div><p style="color:var(--text-muted)">答對: ${this.correctCount} / 樓層: ${this.floor}</p><button id="btn-win-exit" class="btn btn-neon-gold">退出並登錄成績</button></div>`;
    document.getElementById('btn-win-exit').addEventListener('click', async () => {
      SoundFX.playClick(); const b = document.getElementById('btn-win-exit'); b.disabled = true; b.textContent = "上傳成績中...";
      await GAS_API.logScore("高塔勇士", this.score, this.correctCount, this.totalFloors);
      document.getElementById('game-stage').classList.add('hidden'); document.getElementById('arcade-lobby').classList.remove('hidden'); ArcadeState.currentGame = null;
    });
  },

  destroy() { clearInterval(this.timerInterval); }
};
window.TowerGame = TowerGame;
