/* ==========================================
   CLASSROOM ARCADE - TARGET ARCHERY (archery.js)
   ========================================== */

const ArcheryGame = {
  container: null,
  score: 0,
  timeLeft: 60,
  timerInterval: null,
  animationId: null,
  canvas: null,
  ctx: null,

  currentQuestion: null,
  correctCount: 0,
  totalShots: 0,

  targets: [],
  arrows: [],
  bow: { x: 0, y: 0, angle: 0, isAiming: false },
  mousePos: { x: 0, y: 0 },
  particles: [],

  init() {
    this.container = document.getElementById('game-body');
    this.score = 0;
    this.sessionQuestions = ArcadeState.getRandomQuestions(20);
    this.currentQuestionIndex = 0;
    this.timeLeft = 60;
    this.correctCount = 0;
    this.totalShots = 0;
    this.targets = [];
    this.arrows = [];
    this.particles = [];

    document.getElementById('game-stage-title').textContent = "神射手打靶";
    document.getElementById('game-score').textContent = this.score;
    this.updateStatsUI();

    this.renderStage();
    this.initCanvas();
    this.nextQuestion();
    this.startTimers();
    this.loop();
  },

  updateStatsUI() {
    document.getElementById('game-timer').textContent = `進度: ${this.currentQuestionIndex}/20 | 時間: ${this.timeLeft}s`;
  },

  renderStage() {
    this.container.innerHTML = `
      <div class="archery-wrapper" style="position:relative; width:100%; height:550px; background:#0c1a10; border-radius:12px; overflow:hidden; border:2px solid var(--neon-green); display:flex; flex-direction:column;">
        <div class="archery-question-box" style="padding:10px; background:rgba(0, 255, 127, 0.1); border-bottom:1px solid rgba(0,255,127,0.3); text-align:center; z-index:5;">
          <p style="font-size:0.75rem; color:var(--neon-green); text-transform:uppercase; font-weight:700; margin:0 0 4px 0">射擊任務：滑鼠瞄準並點擊發射，射中正確答案的標靶！</p>
          <h3 id="archery-question-text" style="font-size:1.1rem; line-height:1.3; margin:0; color:#fff">載入問題中...</h3>
        </div>
        <canvas id="archery-canvas" style="flex:1; width:100%; display:block; cursor:crosshair;"></canvas>
      </div>
    `;
  },

  initCanvas() {
    this.canvas = document.getElementById('archery-canvas');
    this.ctx = this.canvas.getContext('2d');
    
    this.canvas.width = this.canvas.clientWidth;
    this.canvas.height = this.canvas.clientHeight;

    this.bow.x = this.canvas.width / 2;
    this.bow.y = this.canvas.height - 20;

    // Controls
    this.canvas.addEventListener('mousemove', this.handleMouseMove);
    this.canvas.addEventListener('mousedown', this.handleMouseDown);
    this.canvas.addEventListener('mouseup', this.handleMouseUp);
  },

  handleMouseMove: (e) => {
    const rect = ArcheryGame.canvas.getBoundingClientRect();
    ArcheryGame.mousePos.x = e.clientX - rect.left;
    ArcheryGame.mousePos.y = e.clientY - rect.top;

    // Calculate bow angle pointing to mouse
    const dx = ArcheryGame.mousePos.x - ArcheryGame.bow.x;
    const dy = ArcheryGame.mousePos.y - ArcheryGame.bow.y;
    ArcheryGame.bow.angle = Math.atan2(dy, dx);
  },
  handleMouseDown: (e) => {
    ArcheryGame.bow.isAiming = true;
  },
  handleMouseUp: (e) => {
    if (!ArcheryGame.bow.isAiming) return;
    ArcheryGame.bow.isAiming = false;
    ArcheryGame.shootArrow();
  },

  shootArrow() {
    if (this.timeLeft <= 0) return;
    
    const dx = this.mousePos.x - this.bow.x;
    const dy = this.mousePos.y - this.bow.y;
    const dist = Math.sqrt(dx*dx + dy*dy);
    const speed = 12;

    this.arrows.push({
      x: this.bow.x,
      y: this.bow.y,
      vx: (dx / dist) * speed,
      vy: (dy / dist) * speed,
      angle: this.bow.angle,
      size: 15,
      active: true
    });
    this.totalShots++;
    SoundFX.playClick();
  },

  startTimers() {
    clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.timeLeft--;
      this.updateStatsUI();
      if (this.timeLeft <= 0) {
        this.endGame();
      }
    }, 1000);
  },

  nextQuestion() {
    if (this.currentQuestionIndex >= 20) {
      this.endGame();
      return;
    }
    const rawQuestion = this.sessionQuestions[this.currentQuestionIndex];
    this.currentQuestionIndex++;
    this.currentQuestion = ArcadeState.getMultipleChoiceQuestion(rawQuestion);
    
    document.getElementById('archery-question-text').textContent = this.currentQuestion.question;
    
    this.spawnTargets();
  },

  spawnTargets() {
    this.targets = [];
    const options = this.currentQuestion.options;
    const count = options.length;

    options.forEach((opt, idx) => {
      this.targets.push({
        x: (this.canvas.width / count) * idx + (this.canvas.width / count) / 2,
        y: 100 + Math.random() * 80,
        radius: 40,
        vx: (Math.random() > 0.5 ? 1 : -1) * (0.8 + Math.random() * 0.8),
        text: opt.length > 8 ? opt.substring(0, 7) + ".." : opt,
        fullText: opt,
        isCorrect: idx === this.currentQuestion.answer
      });
    });
  },

  loop() {
    this.updatePhysics();
    this.draw();
    if (this.timeLeft > 0) {
      this.animationId = requestAnimationFrame(() => this.loop());
    }
  },

  updatePhysics() {
    const colWidth = this.canvas.width / this.currentQuestion.options.length;

    // 1. Move targets and bound inside their columns
    this.targets.forEach((t, idx) => {
      t.x += t.vx;

      const minX = colWidth * idx + t.radius;
      const maxX = colWidth * (idx + 1) - t.radius;
      if (t.x < minX || t.x > maxX) {
        t.vx *= -1;
      }
    });

    // 2. Move arrows & check collision
    this.arrows.forEach((arr, arrIdx) => {
      if (!arr.active) return;
      arr.x += arr.vx;
      arr.y += arr.vy;

      // Check off screen
      if (arr.x < 0 || arr.x > this.canvas.width || arr.y < 0 || arr.y > this.canvas.height) {
        this.arrows.splice(arrIdx, 1);
        return;
      }

      // Check collision with targets
      this.targets.forEach(t => {
        const dx = arr.x - t.x;
        const dy = arr.y - t.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < t.radius) {
          arr.active = false;
          this.arrows.splice(arrIdx, 1);
          this.handleTargetHit(t);
        }
      });
    });

    // 3. Update particles
    this.particles.forEach((p, index) => {
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.02;
      if (p.alpha <= 0) {
        this.particles.splice(index, 1);
      }
    });
  },

  handleTargetHit(target) {
    if (target.isCorrect) {
      // Correct target hit
      SoundFX.playCoin();
      this.score += 100;
      this.correctCount++;
      document.getElementById('game-score').textContent = this.score;

      // Spawn fireworks particles
      for (let i = 0; i < 30; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 4 + 2;
        this.particles.push({
          x: target.x,
          y: target.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 3 + 2,
          alpha: 1,
          color: `hsl(${Math.random() * 360}, 100%, 60%)`
        });
      }

      setTimeout(() => {
        this.nextQuestion();
      }, 500);
    } else {
      // Wrong target hit
      SoundFX.playFail();
      this.score = Math.max(0, this.score - 20);
      document.getElementById('game-score').textContent = this.score;

      // Gray smoke particles
      for (let i = 0; i < 15; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 2 + 1;
        this.particles.push({
          x: target.x,
          y: target.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 5 + 3,
          alpha: 0.8,
          color: "rgba(120, 120, 120, 0.5)"
        });
      }
    }
  },

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 1. Draw Target Column Background guidelines
    const count = this.currentQuestion.options.length;
    const colWidth = this.canvas.width / count;
    this.ctx.strokeStyle = "rgba(0, 255, 127, 0.05)";
    this.ctx.lineWidth = 1;
    for (let i = 1; i < count; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(i * colWidth, 0);
      this.ctx.lineTo(i * colWidth, this.canvas.height);
      this.ctx.stroke();
    }

    // 2. Draw Targets (Traditional Archery look: yellow center, red, blue, black rings)
    this.targets.forEach(t => {
      this.ctx.save();
      this.ctx.translate(t.x, t.y);

      // White ring
      this.ctx.fillStyle = "#ffffff";
      this.ctx.beginPath();
      this.ctx.arc(0, 0, t.radius, 0, Math.PI * 2);
      this.ctx.fill();

      // Blue ring
      this.ctx.fillStyle = "#2196f3";
      this.ctx.beginPath();
      this.ctx.arc(0, 0, t.radius * 0.75, 0, Math.PI * 2);
      this.ctx.fill();

      // Red ring
      this.ctx.fillStyle = "#f44336";
      this.ctx.beginPath();
      this.ctx.arc(0, 0, t.radius * 0.5, 0, Math.PI * 2);
      this.ctx.fill();

      // Yellow bullseye
      this.ctx.fillStyle = "#ffeb3b";
      this.ctx.beginPath();
      this.ctx.arc(0, 0, t.radius * 0.25, 0, Math.PI * 2);
      this.ctx.fill();

      // Border glow
      this.ctx.strokeStyle = t.isCorrect ? "var(--neon-green)" : "rgba(255, 255, 255, 0.2)";
      this.ctx.lineWidth = t.isCorrect ? 3 : 1;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, t.radius, 0, Math.PI * 2);
      this.ctx.stroke();

      // Text Board
      this.ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
      this.ctx.fillRect(-t.radius - 10, t.radius + 5, t.radius * 2 + 20, 24);
      this.ctx.strokeStyle = "rgba(255,255,255,0.2)";
      this.ctx.strokeRect(-t.radius - 10, t.radius + 5, t.radius * 2 + 20, 24);

      this.ctx.fillStyle = "#ffffff";
      this.ctx.font = "bold 0.75rem Outfit, sans-serif";
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";
      this.ctx.fillText(t.text, 0, t.radius + 17);

      this.ctx.restore();
    });

    // 3. Draw Particles
    this.particles.forEach(p => {
      this.ctx.save();
      this.ctx.globalAlpha = p.alpha;
      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    });

    // 4. Draw Arrows
    this.ctx.strokeStyle = "#e0e0e0";
    this.ctx.lineWidth = 3;
    this.arrows.forEach(arr => {
      this.ctx.save();
      this.ctx.translate(arr.x, arr.y);
      this.ctx.rotate(arr.angle);

      // Shaft
      this.ctx.beginPath();
      this.ctx.moveTo(-15, 0);
      this.ctx.lineTo(15, 0);
      this.ctx.stroke();

      // Feathers (Fletching)
      this.ctx.fillStyle = "#ff0055";
      this.ctx.beginPath();
      this.ctx.moveTo(-15, 0);
      this.ctx.lineTo(-20, -5);
      this.ctx.lineTo(-12, -5);
      this.ctx.lineTo(-7, 0);
      this.ctx.fill();

      this.ctx.beginPath();
      this.ctx.moveTo(-15, 0);
      this.ctx.lineTo(-20, 5);
      this.ctx.lineTo(-12, 5);
      this.ctx.lineTo(-7, 0);
      this.ctx.fill();

      this.ctx.restore();
    });

    // 5. Draw Bow (At the bottom center, rotating towards mouse)
    this.ctx.save();
    this.ctx.translate(this.bow.x, this.bow.y);
    this.ctx.rotate(this.bow.angle);

    // Draw bow string and arc
    this.ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(0, -30);
    this.ctx.lineTo(-10, 0);
    this.ctx.lineTo(0, 30);
    this.ctx.stroke();

    // Wood Arc
    this.ctx.strokeStyle = "#8d6e63";
    this.ctx.lineWidth = 4;
    this.ctx.beginPath();
    this.ctx.arc(10, 0, 32, -Math.PI / 2, Math.PI / 2);
    this.ctx.stroke();

    this.ctx.restore();
  },

  endGame() {
    this.destroy();
    SoundFX.playWin();

    this.container.innerHTML = `
      <div class="game-win-overlay">
        <div class="win-title">🏆 挑戰完成！</div>
        <p>你在射箭打靶挑戰中展現了百步穿楊的箭法！</p>
        <div class="win-score">SCORE: ${this.score}</div>
        <p style="color:var(--text-muted)">命中正確靶心: ${this.correctCount} 次 / 總發射箭數: ${this.totalShots} 支</p>
        <button id="btn-win-exit" class="btn btn-neon-green">退出並登錄成績</button>
      </div>
    `;

    document.getElementById('btn-win-exit').addEventListener('click', async () => {
      SoundFX.playClick();
      const exitBtn = document.getElementById('btn-win-exit');
      exitBtn.disabled = true;
      exitBtn.textContent = "上傳成績中...";

      await GAS_API.logScore("神射手打靶", this.score, this.correctCount, this.totalShots);

      // Go back to lobby
      document.getElementById('game-stage').classList.add('hidden');
      document.getElementById('arcade-lobby').classList.remove('hidden');
      ArcadeState.currentGame = null;
    });
  },

  destroy() {
    clearInterval(this.timerInterval);
    cancelAnimationFrame(this.animationId);
    
    // Remove listeners
    if (this.canvas) {
      this.canvas.removeEventListener('mousemove', this.handleMouseMove);
      this.canvas.removeEventListener('mousedown', this.handleMouseDown);
      this.canvas.removeEventListener('mouseup', this.handleMouseUp);
    }
  }
};

window.ArcheryGame = ArcheryGame;
