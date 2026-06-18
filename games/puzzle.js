/* ==========================================
   CLASSROOM ARCADE - PUZZLE BUILDER (puzzle.js)
   ========================================== */

const PuzzleGame = {
  container: null,
  score: 0,
  timeLeft: 90,
  timerInterval: null,

  currentQuestion: null,
  correctCount: 0,
  totalAttempts: 0,

  gridSize: 3, // 3x3 puzzle
  piecesCount: 9,
  unlockedPieces: [], // indices of unlocked pieces (0 to 8)
  canvas: null,
  ctx: null,

  init() {
    this.container = document.getElementById('game-body');
    this.score = 0;
    this.sessionQuestions = ArcadeState.getRandomQuestions(20);
    this.currentQuestionIndex = 0;
    this.timeLeft = 90;
    this.correctCount = 0;
    this.totalAttempts = 0;
    this.unlockedPieces = [];

    document.getElementById('game-stage-title').textContent = "拼圖大師";
    document.getElementById('game-score').textContent = this.score;
    document.getElementById('game-timer').textContent = "時限: 90s";

    this.renderStage();
    this.initCanvas();
    this.drawPuzzle();
    this.nextQuestion();
    this.startTimers();
  },

  renderStage() {
    this.container.innerHTML = `
      <div class="puzzle-wrapper" style="display:flex; flex-direction:column; align-items:center; gap:15px; width:100%; max-width:800px; margin:0 auto;">
        <p style="text-align:center; font-size:0.9rem; color:var(--text-muted); margin:0">💡 答對題目解鎖一片拼圖，完成九宮格拼圖即可過關！</p>
        
        <div class="puzzle-main" style="display:flex; flex-wrap:wrap; justify-content:center; align-items:center; gap:20px; width:100%;">
          
          <!-- Left side: Canvas display -->
          <div class="puzzle-canvas-area" style="position:relative; width:300px; height:300px; border-radius:10px; overflow:hidden; border:2px solid var(--neon-gold); box-shadow:0 0 15px rgba(255,176,0,0.3)">
            <canvas id="puzzle-canvas" width="300" height="300" style="display:block;"></canvas>
          </div>

          <!-- Right side: Questions area -->
          <div class="puzzle-q-area" style="flex:1; min-width:300px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.1); border-radius:12px; padding:20px; display:flex; flex-direction:column; gap:15px; box-sizing:border-box;">
            <div class="question-header">
              <span class="badge" style="background:rgba(255,176,0,0.2); color:var(--neon-gold); padding:4px 8px; border-radius:4px; font-size:0.75rem; font-weight:bold;">PUZZLE QUEST</span>
            </div>
            <h3 id="puzzle-question-text" style="font-size:1.15rem; line-height:1.4; color:#fff; margin:0;">載入題目中...</h3>
            
            <div id="puzzle-options-container" style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
              <!-- Options injected here -->
            </div>
          </div>

        </div>
      </div>
    `;
  },

  initCanvas() {
    this.canvas = document.getElementById('puzzle-canvas');
    this.ctx = this.canvas.getContext('2d');
  },

  startTimers() {
    clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.timeLeft--;
      document.getElementById('game-timer').textContent = `進度: ${this.currentQuestionIndex}/20 | 時間: ${this.timeLeft}s`;
      if (this.timeLeft <= 0) {
        clearInterval(this.timerInterval);
        this.endGame(false);
      }
    }, 1000);
  },

  nextQuestion() {
    // Check if puzzle is complete
    if (this.unlockedPieces.length >= this.piecesCount) {
      clearInterval(this.timerInterval);
      setTimeout(() => {
        this.endGame(true);
      }, 500);
      return;
    }

    if (this.currentQuestionIndex >= 20) {
      this.endGame();
      return;
    }
    const rawQuestion = this.sessionQuestions[this.currentQuestionIndex];
    this.currentQuestionIndex++;
    this.currentQuestion = ArcadeState.getMultipleChoiceQuestion(rawQuestion);

    document.getElementById('puzzle-question-text').textContent = this.currentQuestion.question;

    this.renderOptions();
  },

  renderOptions() {
    const container = document.getElementById('puzzle-options-container');
    container.innerHTML = '';

    this.currentQuestion.options.forEach((optText, index) => {
      const btn = document.createElement('button');
      btn.className = 'btn btn-sm btn-outline-primary';
      btn.style.textAlign = 'left';
      btn.style.padding = '10px';
      btn.style.fontSize = '0.85rem';
      btn.style.border = '1px solid rgba(255,255,255,0.2)';
      btn.style.background = 'rgba(255,255,255,0.02)';
      btn.style.color = '#fff';
      btn.style.borderRadius = '6px';
      btn.style.cursor = 'pointer';

      btn.innerHTML = `
        <span style="color:var(--neon-gold); font-weight:bold; margin-right:6px">${String.fromCharCode(65 + index)}.</span> ${optText}
      `;

      btn.addEventListener('click', () => this.handleAnswer(index));
      container.appendChild(btn);
    });
  },

  handleAnswer(choiceIdx) {
    this.totalAttempts++;
    const isCorrect = (choiceIdx === this.currentQuestion.answer);

    if (isCorrect) {
      SoundFX.playCoin();
      this.score += 100;
      this.correctCount++;
      document.getElementById('game-score').textContent = this.score;

      // Unlock a new random piece of the puzzle
      const lockedPieces = [];
      for (let i = 0; i < this.piecesCount; i++) {
        if (!this.unlockedPieces.includes(i)) {
          lockedPieces.push(i);
        }
      }

      if (lockedPieces.length > 0) {
        const randIdx = Math.floor(Math.random() * lockedPieces.length);
        this.unlockedPieces.push(lockedPieces[randIdx]);
        this.drawPuzzle();
      }

      // Flash green feedback
      const box = this.container.querySelector('.puzzle-q-area');
      box.style.borderColor = 'var(--neon-green)';
      setTimeout(() => {
        box.style.borderColor = 'rgba(255,255,255,0.1)';
        this.nextQuestion();
      }, 500);

    } else {
      SoundFX.playFail();
      this.score = Math.max(0, this.score - 20);
      document.getElementById('game-score').textContent = this.score;

      // Flash red feedback
      const box = this.container.querySelector('.puzzle-q-area');
      box.style.borderColor = 'var(--neon-pink)';
      setTimeout(() => {
        box.style.borderColor = 'rgba(255,255,255,0.1)';
      }, 500);
    }
  },

  drawPuzzle() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    const size = w / this.gridSize;

    this.ctx.clearRect(0, 0, w, h);

    // 1. Draw Target Image (gradient space landscape)
    this.ctx.save();
    
    // Draw background landscape
    const grad = this.ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#12002f');
    grad.addColorStop(0.5, '#4a0e4e');
    grad.addColorStop(1, '#9b111e');
    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, 0, w, h);

    // Draw a big neon sun in the center
    this.ctx.fillStyle = '#ffea00';
    this.ctx.shadowBlur = 40;
    this.ctx.shadowColor = '#ffea00';
    this.ctx.beginPath();
    this.ctx.arc(w / 2, h / 2 - 10, 45, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.shadowBlur = 0; // reset

    // Draw landscape mountains
    this.ctx.fillStyle = '#10001f';
    this.ctx.beginPath();
    this.ctx.moveTo(0, h);
    this.ctx.lineTo(w / 2 - 50, h - 80);
    this.ctx.lineTo(w / 2 + 60, h - 30);
    this.ctx.lineTo(w, h);
    this.ctx.closePath();
    this.ctx.fill();

    this.ctx.restore();

    // 2. Draw locked overlays (Grid pattern with question marks covering locked tiles)
    for (let r = 0; r < this.gridSize; r++) {
      for (let c = 0; c < this.gridSize; c++) {
        const idx = r * this.gridSize + c;
        if (!this.unlockedPieces.includes(idx)) {
          // This piece is locked, cover it
          const px = c * size;
          const py = r * size;

          this.ctx.fillStyle = '#222831';
          this.ctx.fillRect(px, py, size, size);

          // Grid border
          this.ctx.strokeStyle = '#393e46';
          this.ctx.lineWidth = 1;
          this.ctx.strokeRect(px, py, size, size);

          // Locked Lock icon/question mark
          this.ctx.fillStyle = 'rgba(255,255,255,0.05)';
          this.ctx.font = 'bold 3rem Outfit, sans-serif';
          this.ctx.textAlign = 'center';
          this.ctx.textBaseline = 'middle';
          this.ctx.fillText("🔒", px + size / 2, py + size / 2);
        } else {
          // This piece is unlocked. Draw grid border only
          const px = c * size;
          const py = r * size;
          this.ctx.strokeStyle = 'rgba(255,176,0,0.3)';
          this.ctx.lineWidth = 2;
          this.ctx.strokeRect(px, py, size, size);
        }
      }
    }
  },

  endGame(isWin) {
    this.destroy();
    SoundFX.playWin();

    this.container.innerHTML = `
      <div class="game-win-overlay">
        <div class="win-title">${isWin ? "🎉 恭喜拼圖完成！" : "⏰ 時間到！"}</div>
        <p>${isWin ? "你完美拼出了神秘拼圖，展現了高超的知識水準！" : "拼圖尚未完成，下次再加油！"}</p>
        <div class="win-score">SCORE: ${this.score}</div>
        <p style="color:var(--text-muted)">解鎖拼圖: ${this.unlockedPieces.length} / 9 片 | 總答題嘗試: ${this.totalAttempts} 次</p>
        <button id="btn-win-exit" class="btn btn-neon-gold">退出並登錄成績</button>
      </div>
    `;

    document.getElementById('btn-win-exit').addEventListener('click', async () => {
      SoundFX.playClick();
      const exitBtn = document.getElementById('btn-win-exit');
      exitBtn.disabled = true;
      exitBtn.textContent = "上傳成績中...";

      await GAS_API.logScore("拼圖大師", finalScore, this.correctCount, this.totalAttempts);

      // Go back to lobby
      document.getElementById('game-stage').classList.add('hidden');
      document.getElementById('arcade-lobby').classList.remove('hidden');
      ArcadeState.currentGame = null;
    });
  },

  destroy() {
    clearInterval(this.timerInterval);
  }
};

window.PuzzleGame = PuzzleGame;
