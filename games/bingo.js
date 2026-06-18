/* ==========================================
   CLASSROOM ARCADE - BINGO (bingo.js)
   ========================================== */

const BingoGame = {
  container: null, score: 0, timeLeft: 120, timerInterval: null,
  grid: [], size: 5, marked: [], bingoCount: 0,
  correctCount: 0, totalAnswered: 0, gameOver: false,
  sessionQuestions: [], currentQuestionIndex: 0,

  init() {
    this.container = document.getElementById('game-body');
    this.score = 0; this.timeLeft = 120; this.correctCount = 0; this.totalAnswered = 0;
    this.bingoCount = 0; this.gameOver = false;
    this.sessionQuestions = ArcadeState.getRandomQuestions(25);
    this.currentQuestionIndex = 0;
    this.marked = Array.from({length: this.size}, () => Array(this.size).fill(false));
    document.getElementById('game-stage-title').textContent = "知識賓果";
    document.getElementById('game-score').textContent = "0";
    this.buildGrid();
    this.renderStage();
    this.startTimers();
  },

  buildGrid() {
    this.grid = [];
    const indices = ArcadeState.shuffleArray([...Array(25).keys()]).slice(0, 25);
    for (let r = 0; r < this.size; r++) {
      this.grid[r] = [];
      for (let c = 0; c < this.size; c++) {
        const idx = r * this.size + c;
        if (idx < this.sessionQuestions.length) {
          const q = ArcadeState.getMultipleChoiceQuestion(this.sessionQuestions[idx]);
          this.grid[r][c] = { q, label: (idx + 1).toString() };
        } else {
          this.grid[r][c] = { q: null, label: "★" };
        }
      }
    }
  },

  renderStage() {
    this.container.innerHTML = `<div style="width:100%;height:100%;background:#0f111a;border-radius:12px;overflow:hidden;display:flex;flex-direction:column;border:2px solid var(--neon-gold);">
      <div id="bingo-status" style="padding:8px 16px;background:rgba(255,200,0,0.1);border-bottom:1px solid rgba(255,200,0,0.3);text-align:center;color:#fff;font-size:0.9rem;font-weight:700;">🎯 點擊格子回答問題，連線得 BINGO！</div>
      <div style="flex:1;display:flex;align-items:center;justify-content:center;padding:12px;">
        <div id="bingo-grid" style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;max-width:550px;width:100%;aspect-ratio:1;"></div>
      </div>
      <div style="padding:8px;text-align:center;"><span id="bingo-count" style="color:var(--neon-gold);font-weight:700;font-size:1.1rem;">BINGO: 0 條線</span></div>
    </div>`;
    this.renderGrid();
  },

  renderGrid() {
    const g = document.getElementById('bingo-grid');
    g.innerHTML = '';
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        const cell = document.createElement('div');
        const m = this.marked[r][c];
        cell.style.cssText = `background:${m ? 'var(--neon-gold)' : '#1a1d2e'};border:2px solid ${m ? 'var(--neon-gold)' : 'rgba(255,255,255,0.1)'};border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:1.3rem;font-weight:700;color:${m ? '#1a1a1a' : '#fff'};aspect-ratio:1;cursor:${m || this.gameOver ? 'default' : 'pointer'};transition:all 0.3s;`;
        cell.textContent = m ? '⭐' : (r * this.size + c + 1);
        if (!m && !this.gameOver) {
          cell.addEventListener('click', () => BingoGame.onCell(r, c));
        }
        g.appendChild(cell);
      }
    }
  },

  onCell(r, c) {
    if (this.marked[r][c] || this.gameOver) return;
    if (this.currentQuestionIndex >= this.sessionQuestions.length) { this.endGame(); return; }
    const cellData = this.grid[r][c];
    if (!cellData.q) return;
    document.getElementById('bingo-status').textContent = `❓ ${cellData.q.question}`;
    QuestionModal.show(cellData.q, 15, (isCorrect) => {
      this.totalAnswered++;
      if (isCorrect) {
        this.score += 100; this.correctCount++; SoundFX.playSuccess();
        this.marked[r][c] = true;
        this.checkBingo();
      } else {
        this.score = Math.max(0, this.score - 20); SoundFX.playFail();
      }
      document.getElementById('game-score').textContent = this.score;
      this.renderGrid();
      document.getElementById('bingo-status').textContent = '🎯 點擊下一個格子！';
      if (this.bingoCount >= 3) this.endGame();
    });
  },

  checkBingo() {
    let newBingo = false;
    for (let i = 0; i < this.size; i++) {
      if (this.marked[i].every(c => c)) newBingo = true;
      if (this.marked.map(r => r[i]).every(c => c)) newBingo = true;
    }
    if (this.marked.map((r, i) => r[i]).every(c => c)) newBingo = true;
    if (this.marked.map((r, i) => r[this.size - 1 - i]).every(c => c)) newBingo = true;
    if (newBingo) { this.bingoCount++; SoundFX.playCoin(); }
    document.getElementById('bingo-count').textContent = `BINGO: ${this.bingoCount} 條線`;
  },

  startTimers() {
    this.timerInterval = setInterval(() => {
      this.timeLeft--; document.getElementById('game-timer').textContent = `${this.timeLeft}s`;
      if (this.timeLeft <= 0) this.endGame();
    }, 1000);
  },

  endGame() {
    this.gameOver = true; this.destroy(); SoundFX.playWin();
    this.container.innerHTML = `<div class="game-win-overlay"><div class="win-title">🏆 知識賓果結束！</div><div class="win-score">SCORE: ${this.score}</div><p style="color:var(--text-muted)">答對: ${this.correctCount} / BINGO: ${this.bingoCount} 條線</p><button id="btn-win-exit" class="btn btn-neon-gold">退出並登錄成績</button></div>`;
    document.getElementById('btn-win-exit').addEventListener('click', async () => {
      SoundFX.playClick(); const b = document.getElementById('btn-win-exit'); b.disabled = true; b.textContent = "上傳成績中...";
      await GAS_API.logScore("知識賓果", this.score, this.correctCount, this.totalAnswered);
      document.getElementById('game-stage').classList.add('hidden'); document.getElementById('arcade-lobby').classList.remove('hidden'); ArcadeState.currentGame = null;
    });
  },

  destroy() { clearInterval(this.timerInterval); }
};
window.BingoGame = BingoGame;
