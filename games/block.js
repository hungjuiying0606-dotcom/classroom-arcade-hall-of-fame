/* ==========================================
   CLASSROOM ARCADE - BLOCK DROP (block.js)
   ========================================== */

const BlockGame = {
  container: null, score: 0, timeLeft: 90, timerInterval: null,
  animationId: null, canvas: null, ctx: null,
  grid: [], cols: 8, rows: 12, cellSize: 0, gridOffsetX: 0, gridOffsetY: 0,
  currentPiece: null, gameOver: false,
  correctCount: 0, totalCleared: 0,
  sessionQuestions: [], currentQuestionIndex: 0,
  dropInterval: null, pendingQuestion: false,

  init() {
    this.container = document.getElementById('game-body');
    this.score = 0; this.timeLeft = 90; this.correctCount = 0; this.totalCleared = 0;
    this.sessionQuestions = ArcadeState.getRandomQuestions(20);
    this.currentQuestionIndex = 0; this.gameOver = false; this.pendingQuestion = false;
    this.cols = 8; this.rows = 12;
    this.grid = Array.from({length: this.rows}, () => Array(this.cols).fill(0));
    document.getElementById('game-stage-title').textContent = "方塊消除";
    document.getElementById('game-score').textContent = "0";
    this.renderStage();
    this.canvas = document.getElementById('block-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', this.resize);
    this.canvas.addEventListener('pointerdown', this.onTap);
    this._onKeyDown = (e) => {
      if (this.gameOver || this.pendingQuestion) return;
      switch (e.key) { case 'ArrowLeft': this.movePiece(-1, 0); break; case 'ArrowRight': this.movePiece(1, 0); break; case 'ArrowDown': this.movePiece(0, 1); break; case 'ArrowUp': this.rotatePiece(); break; }
    };
    window.addEventListener('keydown', this._onKeyDown);
    document.getElementById('btn-block-left').addEventListener('pointerdown', (e) => { e.preventDefault(); if (!this.gameOver && !this.pendingQuestion) this.movePiece(-1, 0); });
    document.getElementById('btn-block-rotate').addEventListener('pointerdown', (e) => { e.preventDefault(); if (!this.gameOver && !this.pendingQuestion) this.rotatePiece(); });
    document.getElementById('btn-block-down').addEventListener('pointerdown', (e) => { e.preventDefault(); if (!this.gameOver && !this.pendingQuestion) this.movePiece(0, 1); });
    document.getElementById('btn-block-right').addEventListener('pointerdown', (e) => { e.preventDefault(); if (!this.gameOver && !this.pendingQuestion) this.movePiece(1, 0); });
    this.spawnPiece();
    this.startTimers();
    this.loop();
  },

  resize: () => { const g = BlockGame; if (!g.canvas) return; g.canvas.width = g.canvas.clientWidth; g.canvas.height = g.canvas.clientHeight; const aw = g.canvas.width * 0.85, ah = g.canvas.height * 0.85; g.cellSize = Math.floor(Math.min(aw / g.cols, ah / g.rows)); g.gridOffsetX = Math.floor((g.canvas.width - g.cellSize * g.cols) / 2); g.gridOffsetY = Math.floor((g.canvas.height - g.cellSize * g.rows) / 2); },

  renderStage() {
    this.container.innerHTML = `<div style="width:100%;height:100%;background:#0f111a;border-radius:12px;overflow:hidden;display:flex;flex-direction:column;border:2px solid var(--neon-purple);">
      <div id="block-status" style="padding:8px 16px;background:rgba(200,0,255,0.1);border-bottom:1px solid rgba(200,0,255,0.3);text-align:center;color:#fff;font-size:0.9rem;font-weight:700;">🟦 用下方按鈕或鍵盤方向鍵操控方塊，消除滿列得分！</div>
      <canvas id="block-canvas" style="flex:1;width:100%;display:block;touch-action:none;"></canvas>
      <div id="block-buttons" style="display:flex;justify-content:center;gap:12px;padding:10px 16px;background:rgba(200,0,255,0.08);border-top:1px solid rgba(200,0,255,0.2);">
        <button id="btn-block-left" style="width:56px;height:56px;border-radius:12px;border:2px solid rgba(200,0,255,0.4);background:rgba(200,0,255,0.15);color:#fff;font-size:1.5rem;cursor:pointer;touch-action:none;display:flex;align-items:center;justify-content:center;">◀</button>
        <button id="btn-block-rotate" style="width:56px;height:56px;border-radius:12px;border:2px solid rgba(200,0,255,0.4);background:rgba(200,0,255,0.15);color:#fff;font-size:1.5rem;cursor:pointer;touch-action:none;display:flex;align-items:center;justify-content:center;">🔄</button>
        <button id="btn-block-down" style="width:56px;height:56px;border-radius:12px;border:2px solid rgba(200,0,255,0.4);background:rgba(200,0,255,0.15);color:#fff;font-size:1.5rem;cursor:pointer;touch-action:none;display:flex;align-items:center;justify-content:center;">▼</button>
        <button id="btn-block-right" style="width:56px;height:56px;border-radius:12px;border:2px solid rgba(200,0,255,0.4);background:rgba(200,0,255,0.15);color:#fff;font-size:1.5rem;cursor:pointer;touch-action:none;display:flex;align-items:center;justify-content:center;">▶</button>
      </div>
    </div>`;
  },

  onTap: (e) => {
    const g = BlockGame; if (g.gameOver || g.pendingQuestion || !g.currentPiece) return;
    const r = g.canvas.getBoundingClientRect();
    const x = e.clientX - r.left;
    const relX = x - g.gridOffsetX;
    if (relX < 0 || relX > g.cellSize * g.cols) return;
    if (relX < g.cellSize * g.cols / 3) g.movePiece(-1, 0);
    else if (relX > g.cellSize * g.cols * 2 / 3) g.movePiece(1, 0);
    else g.rotatePiece();
  },

  spawnPiece() {
    const shapes = [
      [[1,1,1,1]], [[1,1],[1,1]], [[1,0],[1,1],[0,1]],
      [[0,1],[1,1],[1,0]], [[1,1,0],[0,1,1]], [[0,1,1],[1,1,0]]
    ];
    const colors = ['#e17055','#0984e3','#00b894','#fdcb6e','#6c5ce7','#fd79a8'];
    this.currentPiece = {
      shape: shapes[Math.floor(Math.random() * shapes.length)],
      color: colors[Math.floor(Math.random() * colors.length)],
      x: Math.floor((this.cols - shapes[0][0].length) / 2), y: 0
    };
  },

  movePiece(dx, dy) {
    if (!this.currentPiece) return;
    const p = this.currentPiece;
    const testX = p.x + dx, testY = p.y + dy;
    if (this.validPosition(p.shape, testX, testY)) { p.x = testX; p.y = testY; return true; }
    if (dy > 0) { this.lockPiece(); return false; }
    return false;
  },

  rotatePiece() {
    if (!this.currentPiece) return;
    const s = this.currentPiece.shape;
    const rotated = s[0].map((_, i) => s.map(r => r[i]).reverse());
    if (this.validPosition(rotated, this.currentPiece.x, this.currentPiece.y)) {
      this.currentPiece.shape = rotated;
    }
  },

  validPosition(shape, offX, offY) {
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (!shape[r][c]) continue;
        const gx = offX + c, gy = offY + r;
        if (gx < 0 || gx >= this.cols || gy >= this.rows) return false;
        if (gy >= 0 && this.grid[gy][gx] !== 0) return false;
      }
    }
    return true;
  },

  lockPiece() {
    if (!this.currentPiece) return;
    const p = this.currentPiece;
    for (let r = 0; r < p.shape.length; r++) {
      for (let c = 0; c < p.shape[r].length; c++) {
        if (!p.shape[r][c]) continue;
        const gy = p.y + r;
        if (gy < 0) { this.endGame(); return; }
        this.grid[gy][p.x + c] = p.color;
      }
    }
    this.clearLines();
    if (this.currentQuestionIndex < this.sessionQuestions.length) {
      this.askQuestion();
    } else {
      this.spawnPiece();
    }
  },

  clearLines() {
    let cleared = 0;
    for (let r = this.rows - 1; r >= 0; r--) {
      if (this.grid[r].every(c => c !== 0)) {
        this.grid.splice(r, 1); this.grid.unshift(Array(this.cols).fill(0));
        cleared++; r++;
      }
    }
    if (cleared > 0) {
      this.totalCleared += cleared;
      this.score += cleared * 150; this.correctCount++;
      SoundFX.playSuccess();
      document.getElementById('game-score').textContent = this.score;
    }
  },

  askQuestion() {
    if (this.currentQuestionIndex >= this.sessionQuestions.length) { this.spawnPiece(); return; }
    this.pendingQuestion = true;
    const raw = this.sessionQuestions[this.currentQuestionIndex++];
    const q = ArcadeState.getMultipleChoiceQuestion(raw);
    document.getElementById('block-status').textContent = `❓ ${q.question}`;
    QuestionModal.show(q, 12, (isCorrect) => {
      this.pendingQuestion = false;
      if (isCorrect) { this.score += 100; SoundFX.playSuccess(); }
      else { this.score = Math.max(0, this.score - 20); SoundFX.playFail(); }
      document.getElementById('game-score').textContent = this.score;
      this.spawnPiece();
    });
  },

  startTimers() {
    this.timerInterval = setInterval(() => {
      this.timeLeft--; document.getElementById('game-timer').textContent = `${this.timeLeft}s`;
      if (this.timeLeft <= 0) this.endGame();
    }, 1000);
    this.dropInterval = setInterval(() => {
      if (!this.gameOver && !this.pendingQuestion) this.movePiece(0, 1);
    }, 500);
  },

  loop() { this.draw(); this.animationId = requestAnimationFrame(() => this.loop()); },

  draw() {
    const c = this.canvas, ctx = this.ctx, cs = this.cellSize, ox = this.gridOffsetX, oy = this.gridOffsetY;
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.fillStyle = "#0f111a"; ctx.fillRect(0, 0, c.width, c.height);
    ctx.save();
    ctx.beginPath(); ctx.rect(ox, oy, cs * this.cols, cs * this.rows); ctx.clip();
    for (let r = 0; r < this.rows; r++) for (let col = 0; col < this.cols; col++) {
      if (this.grid[r][col] !== 0) {
        ctx.fillStyle = this.grid[r][col]; ctx.beginPath();
        ctx.roundRect(ox + col * cs + 1, oy + r * cs + 1, cs - 2, cs - 2, 3); ctx.fill();
      } else {
        ctx.fillStyle = (r + col) % 2 === 0 ? "#131626" : "#0f111a";
        ctx.fillRect(ox + col * cs, oy + r * cs, cs, cs);
      }
    }
    if (this.currentPiece && !this.pendingQuestion) {
      const p = this.currentPiece;
      for (let r = 0; r < p.shape.length; r++) for (let col = 0; col < p.shape[r].length; col++) {
        if (p.shape[r][col]) {
          ctx.fillStyle = p.color; ctx.globalAlpha = 0.8;
          ctx.beginPath(); ctx.roundRect(ox + (p.x + col) * cs + 1, oy + (p.y + r) * cs + 1, cs - 2, cs - 2, 3); ctx.fill();
          ctx.globalAlpha = 1;
        }
      }
    }
    ctx.restore();
    ctx.strokeStyle = "rgba(200,0,255,0.15)"; ctx.lineWidth = 2;
    ctx.strokeRect(ox, oy, cs * this.cols, cs * this.rows);
  },

  endGame() {
    this.gameOver = true; this.destroy(); SoundFX.playWin();
    this.container.innerHTML = `<div class="game-win-overlay"><div class="win-title">🏆 方塊消除結束！</div><div class="win-score">SCORE: ${this.score}</div><p style="color:var(--text-muted)">消除列數: ${this.totalCleared}</p><button id="btn-win-exit" class="btn btn-neon-purple">退出並登錄成績</button></div>`;
    document.getElementById('btn-win-exit').addEventListener('click', async () => {
      SoundFX.playClick(); const b = document.getElementById('btn-win-exit'); b.disabled = true; b.textContent = "上傳成績中...";
      await GAS_API.logScore("方塊消除", this.score, this.correctCount, this.totalCleared);
      document.getElementById('game-stage').classList.add('hidden'); document.getElementById('arcade-lobby').classList.remove('hidden'); ArcadeState.currentGame = null;
    });
  },

  destroy() {
    clearInterval(this.timerInterval); clearInterval(this.dropInterval);
    cancelAnimationFrame(this.animationId);
    if (this.canvas) { this.canvas.removeEventListener('pointerdown', this.onTap); }
    window.removeEventListener('resize', this.resize);
    window.removeEventListener('keydown', this._onKeyDown);
  }
};
window.BlockGame = BlockGame;
