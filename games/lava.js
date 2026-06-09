/* ==========================================
   CLASSROOM ARCADE - LAVA ESCAPE (lava.js)
   ========================================== */

const LavaGame = {
  container: null,
  score: 0,
  timeLeft: 90,
  timerInterval: null,
  animationId: null,
  canvas: null,
  ctx: null,
  currentQuestion: null,
  correctCount: 0,
  totalAttempts: 0,
  sessionQuestions: [],
  currentQuestionIndex: 0,

  player: { x: 0, y: 0, vy: 0, onPlatform: null, jumping: false, width: 30, height: 30 },
  platforms: [],
  lavaY: 0,
  cameraY: 0,
  gameOver: false,
  scrollOffset: 0,
  phase: 'question', // 'question' | 'jumping'
  selectedPlatform: null,

  init() {
    this.container = document.getElementById('game-body');
    this.score = 0;
    this.sessionQuestions = ArcadeState.getRandomQuestions(20);
    this.currentQuestionIndex = 0;
    this.timeLeft = 90;
    this.correctCount = 0;
    this.totalAttempts = 0;
    this.gameOver = false;

    document.getElementById('game-stage-title').textContent = '火山岩漿逃生';
    document.getElementById('game-score').textContent = this.score;
    document.getElementById('game-timer').textContent = '90s | 0/20';

    this.renderLayout();
    this.initCanvas();
    this.startTimer();
    this.nextQuestion();
    this.loop();
  },

  renderLayout() {
    this.container.innerHTML = `
      <div style="position:relative; width:100%; background:#1a0a00; border-radius:12px; overflow:hidden; border:2px solid #ff4500; display:flex; flex-direction:column;">
        <div style="padding:10px 14px; background:rgba(255,69,0,0.1); border-bottom:1px solid rgba(255,69,0,0.3); text-align:center;">
          <p style="font-size:0.7rem; color:#ff6b35; margin:0 0 4px; text-transform:uppercase; font-weight:700; letter-spacing:1px;">🌋 點擊正確答案的平台往上逃！岩漿追上來了！</p>
          <h3 id="lava-question-text" style="font-size:1rem; color:#fff; margin:0; min-height:40px; display:flex; align-items:center; justify-content:center; line-height:1.3; text-align:center;"></h3>
        </div>
        <canvas id="lava-canvas" style="width:100%; display:block; cursor:pointer; touch-action:none;" height="460"></canvas>
      </div>
    `;
  },

  initCanvas() {
    this.canvas = document.getElementById('lava-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = this.canvas.clientWidth || 600;
    const h = this.canvas.height = 460;
    const w = this.canvas.width;

    // Starting setup
    this.lavaY = h;
    this.scrollOffset = 0;

    // Player starts at bottom platform
    this.player = { x: w / 2, y: h - 80, vy: 0, width: 28, height: 28, onPlatform: null, jumping: false };

    // Generate initial platforms
    this.platforms = [];
    this.generatePlatforms(h, 3);

    this.canvas.addEventListener('pointerdown', this.onCanvasClick);
  },

  onCanvasClick: (e) => {
    e.preventDefault();
    const game = LavaGame;
    if (game.gameOver) return;
    const rect = game.canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    // Find which platform was tapped
    for (const p of game.platforms) {
      const py = p.y - game.scrollOffset;
      if (mx >= p.x && mx <= p.x + p.width && my >= py - 10 && my <= py + p.height + 10) {
        if (p.answer !== undefined) {
          game.tryJumpTo(p);
        }
        return;
      }
    }
  },

  generatePlatforms(fromY, count) {
    const w = this.canvas.width;
    const correctIdx = this.currentQuestion ? this.currentQuestion.answer : 0;
    const opts = this.currentQuestion ? this.currentQuestion.options : ['A','B','C','D'];
    const platformW = Math.min(140, w * 0.38);

    for (let i = 0; i < count; i++) {
      const optIdx = i % opts.length;
      this.platforms.push({
        x: (i % 2 === 0) ? w * 0.08 : w - platformW - w * 0.08,
        y: fromY - 110 - i * 110,
        width: platformW,
        height: 36,
        answer: optIdx,
        isCorrect: optIdx === correctIdx,
        text: opts[optIdx] ? (opts[optIdx].length > 12 ? opts[optIdx].substring(0, 11) + '..' : opts[optIdx]) : '',
        fullText: opts[optIdx] || '',
        color: ['#1565c0','#1b5e20','#6a1b9a','#bf360c'][optIdx % 4],
        flash: 0
      });
    }
  },

  tryJumpTo(platform) {
    if (this.player.jumping) return;
    this.totalAttempts++;
    this.player.jumping = true;
    this.selectedPlatform = platform;

    // Animate jump
    const targetY = platform.y - this.scrollOffset - this.player.height;
    this.player.vy = -18;
  },

  nextQuestion() {
    if (this.currentQuestionIndex >= 20) { this.endGame(true); return; }
    const raw = this.sessionQuestions[this.currentQuestionIndex];
    this.currentQuestionIndex++;
    this.currentQuestion = ArcadeState.getMultipleChoiceQuestion(raw);
    document.getElementById('lava-question-text').textContent = this.currentQuestion.question;
    document.getElementById('game-timer').textContent = `${this.timeLeft}s | ${this.currentQuestionIndex}/20`;

    // Refresh platform labels and correctness
    const opts = this.currentQuestion.options;
    const correctIdx = this.currentQuestion.answer;
    this.platforms.forEach(p => {
      if (p.answer !== undefined) {
        p.isCorrect = p.answer === correctIdx;
        p.text = opts[p.answer] ? (opts[p.answer].length > 12 ? opts[p.answer].substring(0,11)+'..' : opts[p.answer]) : '';
        p.fullText = opts[p.answer] || '';
      }
    });
  },

  startTimer() {
    clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.timeLeft--;
      document.getElementById('game-timer').textContent = `${this.timeLeft}s | ${this.currentQuestionIndex}/20`;
      if (this.timeLeft <= 0) { clearInterval(this.timerInterval); this.endGame(false); }
    }, 1000);
  },

  loop() {
    if (!this.gameOver && this.timeLeft > 0) {
      this.update();
      this.draw();
      this.animationId = requestAnimationFrame(() => this.loop());
    }
  },

  update() {
    const w = this.canvas.width, h = this.canvas.height;

    // Lava rises slowly
    const lavaSpeed = 0.4 + this.correctCount * 0.15;
    this.lavaY -= lavaSpeed;

    // Player physics when jumping
    if (this.player.jumping) {
      this.player.vy += 0.8; // gravity
      this.player.y += this.player.vy;

      // Check if landed on selected platform
      if (this.selectedPlatform) {
        const py = this.selectedPlatform.y - this.scrollOffset;
        if (this.player.y + this.player.height >= py && this.player.vy > 0 &&
            this.player.x + this.player.width > this.selectedPlatform.x &&
            this.player.x < this.selectedPlatform.x + this.selectedPlatform.width) {
          this.player.y = py - this.player.height;
          this.player.vy = 0;
          this.player.jumping = false;

          if (this.selectedPlatform.isCorrect) {
            this.score += 100;
            this.correctCount++;
            SoundFX.playSuccess();
            document.getElementById('game-score').textContent = this.score;
            this.selectedPlatform.flash = 1;
            // Add new platforms above
            const topY = Math.min(...this.platforms.map(p => p.y));
            this.generatePlatforms(topY, 2);
            // Scroll camera up
            this.scrollOffset += 80;
            this.nextQuestion();
          } else {
            SoundFX.playFail();
            this.score = Math.max(0, this.score - 40);
            document.getElementById('game-score').textContent = this.score;
            this.selectedPlatform.flash = -1;
            // Player falls back
            this.player.vy = 5;
            this.player.jumping = true;
          }
          this.selectedPlatform = null;
        }
      }

      // Hit bottom - caught by lava?
      if (this.player.y + this.player.height > h) {
        this.endGame(false);
      }
    }

    // Check lava catches player
    if (this.lavaY <= this.player.y + this.player.height - this.scrollOffset) {
      this.endGame(false);
    }

    // Scroll platform labels
    this.platforms.forEach(p => {
      if (p.flash > 0) p.flash = Math.max(0, p.flash - 0.03);
      if (p.flash < 0) p.flash = Math.min(0, p.flash + 0.03);
    });

    // Remove platforms below lava
    this.platforms = this.platforms.filter(p => p.y - this.scrollOffset < this.canvas.height + 60);
  },

  draw() {
    const ctx = this.ctx, w = this.canvas.width, h = this.canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Background
    ctx.fillStyle = '#1a0500';
    ctx.fillRect(0, 0, w, h);

    // Platforms
    this.platforms.forEach(p => {
      const py = p.y - this.scrollOffset;
      if (py < -40 || py > h + 40) return;

      let col = p.color;
      if (p.flash > 0.1) col = '#00c853';
      else if (p.flash < -0.1) col = '#c62828';

      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.roundRect(p.x, py, p.width, p.height, 8);
      ctx.fill();

      // Shine
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.beginPath();
      ctx.roundRect(p.x + 2, py + 2, p.width - 4, 8, 4);
      ctx.fill();

      // Text
      ctx.fillStyle = '#fff';
      ctx.font = `bold ${p.width > 120 ? '0.78rem' : '0.68rem'} Outfit, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(p.text, p.x + p.width / 2, py + p.height / 2);
    });

    // Player
    const px = this.player.x - this.player.width / 2;
    const py = this.player.y;
    ctx.fillStyle = '#ffcc02';
    ctx.beginPath();
    ctx.roundRect(px, py, this.player.width, this.player.height, 6);
    ctx.fill();
    // Eyes
    ctx.fillStyle = '#333';
    ctx.beginPath(); ctx.arc(px + 9, py + 10, 3, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(px + 19, py + 10, 3, 0, Math.PI*2); ctx.fill();
    // Smile
    ctx.strokeStyle = '#333'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(px + 14, py + 14, 6, 0, Math.PI); ctx.stroke();

    // Lava
    const lavaScreenY = this.lavaY + this.scrollOffset;
    const lavaGrad = ctx.createLinearGradient(0, lavaScreenY - 20, 0, h);
    lavaGrad.addColorStop(0, '#ff6500');
    lavaGrad.addColorStop(0.3, '#ff3d00');
    lavaGrad.addColorStop(1, '#b71c1c');
    ctx.fillStyle = lavaGrad;
    ctx.beginPath();
    ctx.moveTo(0, lavaScreenY);
    for (let x = 0; x <= w; x += 10) {
      const waveY = lavaScreenY + Math.sin(x * 0.08 + Date.now() * 0.004) * 6;
      ctx.lineTo(x, waveY);
    }
    ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath();
    ctx.fill();

    // Lava glow
    ctx.fillStyle = 'rgba(255,100,0,0.15)';
    ctx.beginPath();
    for (let x = 0; x <= w; x += 10) {
      const waveY = lavaScreenY - 20 + Math.sin(x * 0.08 + Date.now() * 0.004) * 8;
      x === 0 ? ctx.moveTo(x, waveY) : ctx.lineTo(x, waveY);
    }
    ctx.lineTo(w, lavaScreenY); ctx.lineTo(0, lavaScreenY); ctx.closePath();
    ctx.fill();

    // Danger indicator
    const danger = Math.max(0, 1 - (this.lavaY - this.player.y - this.player.height + this.scrollOffset) / h);
    if (danger > 0.5) {
      ctx.strokeStyle = `rgba(255,50,0,${(danger - 0.5) * 0.8})`;
      ctx.lineWidth = 6;
      ctx.strokeRect(3, 3, w - 6, h - 6);
    }
  },

  endGame(isWin) {
    this.gameOver = true;
    this.destroy();
    SoundFX.playWin();
    const finalScore = this.score;
    this.container.innerHTML = `
      <div class="game-win-overlay">
        <div class="win-title">${isWin ? '🎉 成功逃脫！' : '🌋 被岩漿追上了！'}</div>
        <div class="win-score">SCORE: ${finalScore}</div>
        <p style="color:var(--text-muted)">答對逃跑: ${this.correctCount} 次 | 總嘗試: ${this.totalAttempts} 次</p>
        <button id="btn-win-exit" class="btn btn-neon-gold" style="padding:0.75rem 2rem; margin-top:1rem;">退出並登錄成績</button>
      </div>
    `;
    document.getElementById('btn-win-exit').addEventListener('pointerdown', async (e) => {
      e.preventDefault();
      SoundFX.playClick();
      const btn = document.getElementById('btn-win-exit');
      btn.disabled = true; btn.textContent = '上傳成績中...';
      await GAS_API.logScore('火山岩漿逃生', finalScore, this.correctCount, this.totalAttempts);
      document.getElementById('game-stage').classList.add('hidden');
      document.getElementById('arcade-lobby').classList.remove('hidden');
      ArcadeState.currentGame = null;
    });
  },

  destroy() {
    clearInterval(this.timerInterval);
    cancelAnimationFrame(this.animationId);
    if (this.canvas) this.canvas.removeEventListener('pointerdown', this.onCanvasClick);
  }
};

window.LavaGame = LavaGame;
