/* ==========================================
   CLASSROOM ARCADE - PAINT (paint.js)
   ========================================== */

const PaintGame = {
  container: null, score: 0, timeLeft: 120, timerInterval: null,
  grid: [], rows: 5, cols: 5, cellSize: 0,
  currentQuestion: null, correctCount: 0, totalPainted: 0,
  sessionQuestions: [], currentQuestionIndex: 0,
  colors: ['#e17055','#0984e3','#00b894','#fdcb6e','#6c5ce7','#fd79a8','#00cec9','#e17055'],
  colorIndex: 0, gameOver: false,

  init() {
    this.container = document.getElementById('game-body');
    this.score = 0; this.timeLeft = 120; this.correctCount = 0; this.totalPainted = 0;
    this.sessionQuestions = ArcadeState.getRandomQuestions(25);
    this.currentQuestionIndex = 0; this.gameOver = false; this.colorIndex = 0;
    this.rows = 5; this.cols = 5;
    this.grid = Array.from({length: this.rows}, () => Array.from({length: this.cols}, () => 0));
    document.getElementById('game-stage-title').textContent = "填色王";
    document.getElementById('game-score').textContent = "0";
    this.renderStage();
    this.startTimers();
    this.nextCell();
  },

  renderStage() {
    this.container.innerHTML = `<div style="width:100%;height:100%;background:#0f111a;border-radius:12px;overflow:hidden;display:flex;flex-direction:column;border:2px solid var(--neon-pink);">
      <div id="paint-grid" style="flex:1;display:grid;gap:8px;padding:20px;grid-template-columns:repeat(${this.cols},1fr);place-items:center;"></div>
      <div id="paint-question" style="padding:12px;background:rgba(255,0,127,0.1);border-top:1px solid rgba(255,0,127,0.3);text-align:center;color:#fff;font-size:0.9rem;font-weight:700;">點擊格子回答問題！</div>
    </div>`;
    this.renderGrid();
  },

  renderGrid() {
    const g = document.getElementById('paint-grid');
    g.innerHTML = '';
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const cell = document.createElement('div');
        cell.className = 'paint-cell';
        cell.dataset.r = r; cell.dataset.c = c;
        const filled = this.grid[r][c] !== 0;
        cell.style.cssText = `width:100%;aspect-ratio:1;border-radius:8px;background:${filled ? this.colors[(this.grid[r][c]-1) % this.colors.length] : '#1a1d2e'};border:2px solid ${filled ? 'transparent' : 'rgba(255,255,255,0.1)'};display:flex;align-items:center;justify-content:center;font-size:2rem;cursor:${this.grid[r][c] === 0 ? 'pointer' : 'default'};transition:all 0.3s ease;`;
        if (this.grid[r][c] === 0) {
          cell.addEventListener('click', () => { if (!PaintGame.gameOver) PaintGame.askQuestion(parseInt(cell.dataset.r), parseInt(cell.dataset.c)); });
        } else {
          cell.textContent = '✓';
          cell.style.color = '#fff';
        }
        g.appendChild(cell);
      }
    }
  },

  nextCell() {
    const cells = [];
    for (let r = 0; r < this.rows; r++)
      for (let c = 0; c < this.cols; c++)
        if (this.grid[r][c] === 0) cells.push({r,c});
    if (cells.length === 0) { this.endGame(); return; }
  },

  askQuestion(r, c) {
    if (this.currentQuestionIndex >= this.sessionQuestions.length) { this.endGame(); return; }
    const raw = this.sessionQuestions[this.currentQuestionIndex++];
    this.currentQuestion = ArcadeState.getMultipleChoiceQuestion(raw);
    document.getElementById('paint-question').textContent = `❓ ${this.currentQuestion.question}`;
    QuestionModal.show(this.currentQuestion, 15, (isCorrect) => {
      this.totalPainted++;
      if (isCorrect) {
        this.score += 100; this.correctCount++; SoundFX.playSuccess();
        this.grid[r][c] = (this.colorIndex % this.colors.length) + 1;
        this.colorIndex++;
      } else {
        this.score = Math.max(0, this.score - 20); SoundFX.playFail();
      }
      document.getElementById('game-score').textContent = this.score;
      this.renderGrid();
      this.nextCell();
      document.getElementById('paint-question').textContent = this.checkComplete() ? '🎉 全部填滿！' : '點擊下一個空白格子！';
    });
  },

  checkComplete() {
    for (let r = 0; r < this.rows; r++)
      for (let c = 0; c < this.cols; c++)
        if (this.grid[r][c] === 0) return false;
    return true;
  },

  startTimers() {
    this.timerInterval = setInterval(() => {
      this.timeLeft--; document.getElementById('game-timer').textContent = `${this.timeLeft}s`;
      if (this.timeLeft <= 0) this.endGame();
    }, 1000);
  },

  endGame() {
    this.gameOver = true; this.destroy(); SoundFX.playWin();
    this.container.innerHTML = `<div class="game-win-overlay"><div class="win-title">🏆 填色王完成！</div><div class="win-score">SCORE: ${this.score}</div><p style="color:var(--text-muted)">答對: ${this.correctCount} / 填色: ${this.totalPainted}</p><button id="btn-win-exit" class="btn btn-neon-pink">退出並登錄成績</button></div>`;
    document.getElementById('btn-win-exit').addEventListener('click', async () => {
      SoundFX.playClick(); const b = document.getElementById('btn-win-exit'); b.disabled = true; b.textContent = "上傳成績中...";
      await GAS_API.logScore("填色王", this.score, this.correctCount, this.totalPainted);
      document.getElementById('game-stage').classList.add('hidden'); document.getElementById('arcade-lobby').classList.remove('hidden'); ArcadeState.currentGame = null;
    });
  },

  destroy() { clearInterval(this.timerInterval); }
};
window.PaintGame = PaintGame;
