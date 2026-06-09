/* ==========================================
   CLASSROOM ARCADE - DEEP SEA FISHING (fisher.js)
   ========================================== */

const FisherGame = {
  container: null,
  score: 0,
  timeLeft: 90,
  timerInterval: null,
  animationId: null,
  canvas: null,
  ctx: null,
  currentQuestion: null,
  correctCount: 0,
  totalCasts: 0,
  sessionQuestions: [],
  currentQuestionIndex: 0,

  rod: { x: 0, y: 30 },
  hook: { x: 0, y: 30, vx: 0, vy: 0, state: 'swinging', angle: 0, swingDir: 1, swingSpeed: 0.025 },
  fish: [],
  particles: [],
  caughtFish: null,

  init() {
    this.container = document.getElementById('game-body');
    this.score = 0;
    this.sessionQuestions = ArcadeState.getRandomQuestions(20);
    this.currentQuestionIndex = 0;
    this.timeLeft = 90;
    this.correctCount = 0;
    this.totalCasts = 0;
    this.fish = [];
    this.particles = [];
    this.caughtFish = null;

    document.getElementById('game-stage-title').textContent = '深海撈答案';
    document.getElementById('game-score').textContent = this.score;
    document.getElementById('game-timer').textContent = '90s | 0/20';

    this.renderLayout();
    this.initCanvas();
    this.nextQuestion();
    this.startTimer();
    this.loop();
  },

  renderLayout() {
    this.container.innerHTML = `
      <div style="position:relative; width:100%; background:linear-gradient(180deg,#001a33 0%,#003366 50%,#001a4d 100%); border-radius:12px; overflow:hidden; border:2px solid #00d4ff; display:flex; flex-direction:column;" id="fisher-wrapper">
        <div style="padding:10px 14px; background:rgba(0,212,255,0.1); border-bottom:1px solid rgba(0,212,255,0.3); text-align:center;">
          <p style="font-size:0.7rem; color:#00d4ff; text-transform:uppercase; font-weight:700; margin:0 0 4px; letter-spacing:1px;">🎣 點擊畫面投下釣線！釣起寫有正確答案的魚！</p>
          <h3 id="fisher-question-text" style="font-size:1.05rem; margin:0; color:#fff; line-height:1.3; min-height:42px; display:flex; align-items:center; justify-content:center;">載入中...</h3>
        </div>
        <canvas id="fisher-canvas" style="flex:1; width:100%; display:block; cursor:pointer; touch-action:none; min-height:400px;"></canvas>
      </div>
    `;
  },

  initCanvas() {
    this.canvas = document.getElementById('fisher-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = this.canvas.clientWidth || 600;
    this.canvas.height = this.canvas.clientHeight || 400;

    this.rod.x = this.canvas.width / 2;
    this.rod.y = 25;
    this.hook.x = this.rod.x;
    this.hook.y = this.rod.y + 30;
    this.hook.state = 'swinging';
    this.hook.angle = 0;

    this.canvas.addEventListener('pointerdown', this.onCanvasClick);
  },

  onCanvasClick: (e) => {
    e.preventDefault();
    if (FisherGame.hook.state === 'swinging') {
      FisherGame.cast();
    }
  },

  cast() {
    if (this.timeLeft <= 0) return;
    this.hook.state = 'casting';
    this.hook.vx = Math.sin(this.hook.angle) * 8;
    this.hook.vy = Math.cos(this.hook.angle) * 12;
    this.hook.x = this.rod.x + Math.sin(this.hook.angle) * 30;
    this.hook.y = this.rod.y + Math.cos(this.hook.angle) * 30;
    this.totalCasts++;
    SoundFX.playClick();
  },

  startTimer() {
    clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.timeLeft--;
      document.getElementById('game-timer').textContent = `${this.timeLeft}s | ${this.currentQuestionIndex}/20`;
      if (this.timeLeft <= 0) {
        clearInterval(this.timerInterval);
        this.endGame();
      }
    }, 1000);
  },

  nextQuestion() {
    if (this.currentQuestionIndex >= 20) { this.endGame(); return; }
    const raw = this.sessionQuestions[this.currentQuestionIndex];
    this.currentQuestionIndex++;
    this.currentQuestion = ArcadeState.getMultipleChoiceQuestion(raw);
    document.getElementById('fisher-question-text').textContent = this.currentQuestion.question;

    this.hook.state = 'swinging';
    this.hook.angle = 0;
    this.caughtFish = null;
    this.spawnFish();
  },

  spawnFish() {
    this.fish = [];
    const opts = this.currentQuestion.options;
    const w = this.canvas.width;
    const h = this.canvas.height;

    const fishColors = ['#1565c0','#00838f','#558b2f','#6a1b9a'];

    opts.forEach((opt, idx) => {
      const depth = 0.3 + (idx * 0.17);
      this.fish.push({
        x: (w * 0.15) + (idx % 2) * w * 0.5 + Math.random() * 80,
        y: h * depth,
        vx: (Math.random() > 0.5 ? 1 : -1) * (1.2 + Math.random()),
        radius: 42,
        text: opt.length > 10 ? opt.substring(0, 9) + '..' : opt,
        fullText: opt,
        isCorrect: idx === this.currentQuestion.answer,
        color: fishColors[idx],
        wobble: 0,
        wobbleDir: 1,
        caught: false
      });
    });
  },

  loop() {
    if (this.timeLeft > 0) {
      this.update();
      this.draw();
      this.animationId = requestAnimationFrame(() => this.loop());
    }
  },

  update() {
    // Swing hook
    if (this.hook.state === 'swinging') {
      this.hook.angle += this.hook.swingSpeed * this.hook.swingDir;
      if (Math.abs(this.hook.angle) > Math.PI / 2.2) this.hook.swingDir *= -1;
    }

    // Cast hook
    if (this.hook.state === 'casting') {
      this.hook.x += this.hook.vx;
      this.hook.y += this.hook.vy;
      this.hook.vy += 0.3; // gravity

      // Boundary
      if (this.hook.y > this.canvas.height - 10 || this.hook.x < 0 || this.hook.x > this.canvas.width) {
        this.hook.state = 'reeling';
      }

      // Check fish collision
      this.fish.forEach(f => {
        if (f.caught) return;
        const dx = this.hook.x - f.x, dy = this.hook.y - f.y;
        if (Math.sqrt(dx*dx + dy*dy) < f.radius) {
          f.caught = true;
          this.caughtFish = f;
          this.hook.state = 'reeling';
        }
      });
    }

    // Reel in
    if (this.hook.state === 'reeling') {
      const tx = this.rod.x, ty = this.rod.y + 25;
      const dx = tx - this.hook.x, dy = ty - this.hook.y;
      const dist = Math.sqrt(dx*dx + dy*dy);
      const speed = 10;
      if (dist > speed) {
        this.hook.x += (dx/dist) * speed;
        this.hook.y += (dy/dist) * speed;
        if (this.caughtFish) { this.caughtFish.x = this.hook.x; this.caughtFish.y = this.hook.y + 30; }
      } else {
        if (this.caughtFish) {
          this.handleCatch(this.caughtFish);
        }
        this.hook.state = 'swinging';
        this.hook.angle = 0;
        this.caughtFish = null;
      }
    }

    // Move fish
    this.fish.forEach(f => {
      if (f.caught) return;
      f.x += f.vx;
      f.wobble += 0.1 * f.wobbleDir;
      if (Math.abs(f.wobble) > 0.3) f.wobbleDir *= -1;
      if (f.x > this.canvas.width + 50) f.x = -50;
      if (f.x < -50) f.x = this.canvas.width + 50;
    });

    // Particles
    this.particles = this.particles.filter(p => { p.x += p.vx; p.y += p.vy; p.alpha -= 0.03; return p.alpha > 0; });
  },

  handleCatch(f) {
    if (f.isCorrect) {
      this.score += 120;
      this.correctCount++;
      SoundFX.playCoin();
      document.getElementById('game-score').textContent = this.score;
      for (let i = 0; i < 18; i++) {
        const a = Math.random() * Math.PI * 2, s = Math.random() * 4 + 1;
        this.particles.push({ x: this.rod.x, y: this.rod.y, vx: Math.cos(a)*s, vy: Math.sin(a)*s, alpha: 1, color: '#ffd740' });
      }
      setTimeout(() => this.nextQuestion(), 700);
    } else {
      this.score = Math.max(0, this.score - 30);
      SoundFX.playFail();
      document.getElementById('game-score').textContent = this.score;
      this.spawnFish();
    }
  },

  draw() {
    const ctx = this.ctx, w = this.canvas.width, h = this.canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Water layers
    ctx.fillStyle = 'rgba(0,30,80,0.5)';
    ctx.fillRect(0, 60, w, h - 60);

    // Bubbles (decorative)
    ctx.fillStyle = 'rgba(100,200,255,0.15)';
    for (let i = 0; i < 6; i++) {
      const bx = (w * 0.1 * i + Date.now() * 0.02) % w;
      const by = h - (Date.now() * 0.05 * (i+1)) % (h - 60);
      ctx.beginPath();
      ctx.arc(bx, by, 4 + i, 0, Math.PI*2);
      ctx.fill();
    }

    // Fish
    this.fish.forEach(f => {
      if (f.caught) return;
      ctx.save();
      ctx.translate(f.x, f.y);
      ctx.rotate(f.wobble);
      // Body
      ctx.fillStyle = f.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, f.radius, f.radius * 0.55, 0, 0, Math.PI*2);
      ctx.fill();
      // Tail
      ctx.beginPath();
      ctx.moveTo(-f.radius, 0);
      ctx.lineTo(-f.radius - 18, -14);
      ctx.lineTo(-f.radius - 18, 14);
      ctx.closePath();
      ctx.fill();
      // Eye
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(f.radius * 0.45, -f.radius * 0.15, 5, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#000';
      ctx.beginPath(); ctx.arc(f.radius * 0.47, -f.radius * 0.15, 2.5, 0, Math.PI*2); ctx.fill();
      // Label
      ctx.fillStyle = '#fff';
      ctx.font = `bold ${f.radius > 40 ? '0.75rem' : '0.65rem'} Outfit, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(f.text, -6, 2);
      ctx.restore();
    });

    // Caught fish (being reeled)
    if (this.caughtFish) {
      const f = this.caughtFish;
      ctx.save();
      ctx.translate(f.x, f.y);
      ctx.fillStyle = f.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, f.radius, f.radius * 0.55, 0, 0, Math.PI*2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 0.75rem Outfit, sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(f.text, 0, 0);
      ctx.restore();
    }

    // Fishing line
    const hookX = this.hook.state === 'swinging'
      ? this.rod.x + Math.sin(this.hook.angle) * 35
      : this.hook.x;
    const hookY = this.hook.state === 'swinging'
      ? this.rod.y + Math.cos(this.hook.angle) * 35
      : this.hook.y;
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(this.rod.x, this.rod.y); ctx.lineTo(hookX, hookY); ctx.stroke();

    // Hook
    ctx.strokeStyle = '#aaa'; ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(hookX, hookY + 8, 6, Math.PI * 0.2, Math.PI * 0.95);
    ctx.stroke();

    // Rod
    ctx.strokeStyle = '#8d6e63'; ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(this.rod.x - 40, this.rod.y - 10);
    ctx.lineTo(this.rod.x, this.rod.y);
    ctx.stroke();

    // Particles
    this.particles.forEach(p => {
      ctx.save(); ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, 4, 0, Math.PI*2); ctx.fill();
      ctx.restore();
    });

    // Surface water line
    ctx.strokeStyle = 'rgba(0,200,255,0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = 0; x < w; x += 4) {
      const y = 62 + Math.sin(x * 0.04 + Date.now() * 0.002) * 3;
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  },

  endGame() {
    this.destroy();
    SoundFX.playWin();
    const finalScore = this.score;
    this.container.innerHTML = `
      <div class="game-win-overlay">
        <div class="win-title">🐠 深海釣魚結束！</div>
        <div class="win-score">SCORE: ${finalScore}</div>
        <p style="color:var(--text-muted)">成功釣到正確答案: ${this.correctCount} 次 | 總投線: ${this.totalCasts} 次</p>
        <button id="btn-win-exit" class="btn btn-neon-blue" style="padding:0.75rem 2rem; margin-top:1rem;">退出並登錄成績</button>
      </div>
    `;
    document.getElementById('btn-win-exit').addEventListener('pointerdown', async (e) => {
      e.preventDefault();
      SoundFX.playClick();
      const btn = document.getElementById('btn-win-exit');
      btn.disabled = true; btn.textContent = '上傳成績中...';
      await GAS_API.logScore('深海撈答案', finalScore, this.correctCount, this.totalCasts);
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

window.FisherGame = FisherGame;
