/* ==========================================
   CLASSROOM ARCADE - PLATFORM JUMPER (jumper.js)
   ========================================== */

const JumperGame = {
  container: null,
  score: 0,
  lives: 10,
  timeLeft: 60,
  timerInterval: null,
  animationId: null,
  canvas: null,
  ctx: null,

  currentQuestion: null,
  correctCount: 0,
  totalJumps: 0,

  player: { x: 0, y: 0, vx: 0, vy: 0, size: 24, speed: 6 },
  platforms: [],
  keys: {},
  scrollOffset: 0,
  bounceForce: -12,
  gravity: 0.4,

  init() {
    this.container = document.getElementById('game-body');
    this.score = 0;
    this.sessionQuestions = ArcadeState.getRandomQuestions(20);
    this.currentQuestionIndex = 0;
    this.lives = 10;
    this.timeLeft = 60;
    this.correctCount = 0;
    this.totalJumps = 0;
    this.platforms = [];
    this.keys = {};
    this.scrollOffset = 0;
    this.leftPressed = false;
    this.rightPressed = false;

    document.getElementById('game-stage-title').textContent = "彈跳小英雄";
    document.getElementById('game-score').textContent = this.score;
    this.updateStatsUI();

    this.renderStage();
    this.initCanvas();
    this.nextQuestion();
    this.startTimers();
    this.loop();
  },

  updateStatsUI() {
    let hearts = "";
    for (let i = 0; i < 10; i++) {
      hearts += i < this.lives ? "❤️" : "🖤";
    }
    document.getElementById('game-timer').textContent = `生命: ${hearts} | 時間: ${this.timeLeft}s`;
  },

  renderStage() {
    this.container.innerHTML = `
      <div class="jumper-wrapper" style="position:relative; width:100%; height:550px; background:#0b1d28; border-radius:12px; overflow:hidden; border:2px solid var(--neon-gold); display:flex; flex-direction:column;">
        <div class="jumper-question-box" style="padding:10px; background:rgba(255, 176, 0, 0.1); border-bottom:1px solid rgba(255,176,0,0.3); text-align:center; z-index:5;">
          <p style="font-size:0.75rem; color:var(--neon-gold); text-transform:uppercase; font-weight:700; margin:0 0 4px 0">彈跳任務：左右移動踩上「正確答案」的浮動平台！(← → 或 A/D 鍵移動)</p>
          <h3 id="jumper-question-text" style="font-size:1.1rem; line-height:1.3; margin:0; color:#fff">載入問題中...</h3>
        </div>
        <canvas id="jumper-canvas" style="flex:1; width:100%; display:block; touch-action:none;"></canvas>
        <div class="jumper-touch-controls" style="position:absolute; bottom:20px; left:0; width:100%; display:flex; justify-content:space-between; padding:0 20px; box-sizing:border-box; z-index:10; pointer-events:none;">
          <button id="jumper-btn-left" style="width:75px; height:75px; border-radius:50%; background:rgba(255, 176, 0, 0.25); border:2px solid var(--neon-gold); color:#fff; font-size:1.8rem; pointer-events:auto; display:flex; align-items:center; justify-content:center; user-select:none; -webkit-user-select:none; outline:none; cursor:pointer; box-shadow:0 0 10px rgba(255,176,0,0.3); transition:background 0.1s ease;">◀</button>
          <button id="jumper-btn-right" style="width:75px; height:75px; border-radius:50%; background:rgba(255, 176, 0, 0.25); border:2px solid var(--neon-gold); color:#fff; font-size:1.8rem; pointer-events:auto; display:flex; align-items:center; justify-content:center; user-select:none; -webkit-user-select:none; outline:none; cursor:pointer; box-shadow:0 0 10px rgba(255,176,0,0.3); transition:background 0.1s ease;">▶</button>
        </div>
      </div>
    `;
  },

  initCanvas() {
    this.canvas = document.getElementById('jumper-canvas');
    this.ctx = this.canvas.getContext('2d');
    
    this.canvas.width = this.canvas.clientWidth;
    this.canvas.height = this.canvas.clientHeight;

    this.player.x = this.canvas.width / 2;
    this.player.y = this.canvas.height - 120;
    this.player.vx = 0;
    this.player.vy = 0;

    // Add ground platform initially
    this.platforms.push({
      x: 0,
      y: this.canvas.height - 30,
      width: this.canvas.width,
      height: 15,
      isGround: true,
      text: "開始起跑平台"
    });

    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);

    // Setup touch controls
    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    const touchControls = this.container.querySelector('.jumper-touch-controls');
    if (touchControls) {
      touchControls.style.display = isTouch ? 'flex' : 'none';
    }

    const btnLeft = document.getElementById('jumper-btn-left');
    const btnRight = document.getElementById('jumper-btn-right');

    if (btnLeft && btnRight) {
      this.touchHandlers = {
        leftDown: (e) => {
          e.preventDefault();
          this.leftPressed = true;
          btnLeft.style.background = 'rgba(255, 176, 0, 0.6)';
        },
        leftUp: (e) => {
          e.preventDefault();
          this.leftPressed = false;
          btnLeft.style.background = 'rgba(255, 176, 0, 0.25)';
        },
        rightDown: (e) => {
          e.preventDefault();
          this.rightPressed = true;
          btnRight.style.background = 'rgba(255, 176, 0, 0.6)';
        },
        rightUp: (e) => {
          e.preventDefault();
          this.rightPressed = false;
          btnRight.style.background = 'rgba(255, 176, 0, 0.25)';
        }
      };

      btnLeft.addEventListener('pointerdown', this.touchHandlers.leftDown);
      btnLeft.addEventListener('pointerup', this.touchHandlers.leftUp);
      btnLeft.addEventListener('pointercancel', this.touchHandlers.leftUp);
      btnLeft.addEventListener('pointerleave', this.touchHandlers.leftUp);

      btnRight.addEventListener('pointerdown', this.touchHandlers.rightDown);
      btnRight.addEventListener('pointerup', this.touchHandlers.rightUp);
      btnRight.addEventListener('pointercancel', this.touchHandlers.rightUp);
      btnRight.addEventListener('pointerleave', this.touchHandlers.rightUp);
    }
  },

  handleKeyDown: (e) => {
    JumperGame.keys[e.code] = true;
  },
  handleKeyUp: (e) => {
    JumperGame.keys[e.code] = false;
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
    
    document.getElementById('jumper-question-text').textContent = this.currentQuestion.question;
    
    this.spawnPlatforms();
  },

  spawnPlatforms() {
    // Position platforms relative to canvas height so they are reachable
    const startY = this.canvas.height - 170;
    const spacing = 100;
    const options = this.currentQuestion.options;
    
    // Clear old floating platforms, keep only ground if character is on it
    this.platforms = this.platforms.filter(p => p.isGround);

    options.forEach((opt, idx) => {
      this.platforms.push({
        x: (this.canvas.width / options.length) * idx + 10,
        y: startY + Math.random() * 40,
        width: this.canvas.width / options.length - 20,
        height: 15,
        text: opt.length > 8 ? opt.substring(0, 7) + ".." : opt,
        fullText: opt,
        isCorrect: idx === this.currentQuestion.answer,
        broken: false,
        pulse: Math.random() * Math.PI
      });
    });
  },

  loop() {
    this.updatePhysics();
    this.draw();
    if (this.lives > 0 && this.timeLeft > 0) {
      this.animationId = requestAnimationFrame(() => this.loop());
    }
  },

  updatePhysics() {
    // Move left/right
    if (this.keys['ArrowLeft'] || this.keys['KeyA'] || this.leftPressed) {
      this.player.vx = -this.player.speed;
    } else if (this.keys['ArrowRight'] || this.keys['KeyD'] || this.rightPressed) {
      this.player.vx = this.player.speed;
    } else {
      this.player.vx = 0;
    }

    this.player.x += this.player.vx;

    // Screen wrapping
    if (this.player.x < -this.player.size) {
      this.player.x = this.canvas.width;
    } else if (this.player.x > this.canvas.width) {
      this.player.x = -this.player.size;
    }

    // Apply gravity
    this.player.vy += this.gravity;
    this.player.y += this.player.vy;

    // Collide with platforms (only when falling down)
    if (this.player.vy > 0) {
      this.platforms.forEach(p => {
        if (!p.broken &&
            this.player.x + this.player.size > p.x &&
            this.player.x < p.x + p.width &&
            this.player.y + this.player.size >= p.y &&
            this.player.y + this.player.size <= p.y + p.height + 6) {
          
          this.handlePlatformLanding(p);
        }
      });
    }

    // Fall below screen limit -> lose life & respawn on ground
    if (this.player.y > this.canvas.height) {
      this.lives--;
      this.score = Math.max(0, this.score - 20);
      document.getElementById('game-score').textContent = this.score;
      this.updateStatsUI();
      SoundFX.playFail();

      if (this.lives <= 0) {
        this.endGame();
        return;
      }

      // Respawn
      this.player.x = this.canvas.width / 2;
      this.player.y = this.canvas.height - 150;
      this.player.vy = 0;

      // Recreate ground platform if it was removed
      if (!this.platforms.some(p => p.isGround)) {
        this.platforms.push({
          x: 0,
          y: this.canvas.height - 30,
          width: this.canvas.width,
          height: 15,
          isGround: true,
          text: "安全降落平台"
        });
      }
    }
  },

  handlePlatformLanding(platform) {
    if (platform.isGround) {
      // Bounce off ground with full force to ensure we reach the platforms
      this.player.vy = this.bounceForce;
      SoundFX.playClick();
    } else {
      this.totalJumps++;
      if (platform.isCorrect) {
        // Jump high! Correct!
        SoundFX.playCoin();
        this.player.vy = this.bounceForce; // high bounce
        this.score += 100;
        this.correctCount++;
        document.getElementById('game-score').textContent = this.score;
        
        // Remove ground to make player look like they are ascending
        this.platforms = this.platforms.filter(p => !p.isGround);

        setTimeout(() => {
          this.nextQuestion();
        }, 300);
      } else {
        // Wrong platform! Breaks apart, player falls
        SoundFX.playFail();
        platform.broken = true;
        this.score = Math.max(0, this.score - 20);
        document.getElementById('game-score').textContent = this.score;
      }
    }
  },

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw background grid lines (cyber style)
    this.ctx.strokeStyle = "rgba(255, 176, 0, 0.05)";
    this.ctx.lineWidth = 1;
    for (let x = 0; x < this.canvas.width; x += 40) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
      this.ctx.stroke();
    }
    for (let y = 0; y < this.canvas.height; y += 40) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas.width, y);
      this.ctx.stroke();
    }

    // 1. Draw Platforms
    this.platforms.forEach(p => {
      if (p.broken) return;

      this.ctx.save();
      
      const grad = this.ctx.createLinearGradient(p.x, p.y, p.x + p.width, p.y);
      if (p.isGround) {
        grad.addColorStop(0, '#555');
        grad.addColorStop(1, '#888');
      } else if (p.isCorrect) {
        grad.addColorStop(0, '#ffb000');
        grad.addColorStop(1, '#ffea00');
      } else {
        grad.addColorStop(0, '#00d9ff');
        grad.addColorStop(1, '#0055ff');
      }

      this.ctx.fillStyle = grad;
      this.ctx.beginPath();
      this.ctx.roundRect(p.x, p.y, p.width, p.height, 4);
      this.ctx.fill();

      // Platform text
      if (!p.isGround) {
        this.ctx.fillStyle = "#101d28";
        this.ctx.font = "bold 0.75rem Outfit, sans-serif";
        this.ctx.textAlign = "center";
        this.ctx.fillText(p.text, p.x + p.width / 2, p.y + p.height - 3);
      }

      this.ctx.restore();
    });

    // 2. Draw Player (Cute jumping slime shape)
    this.ctx.save();
    this.ctx.translate(this.player.x + this.player.size / 2, this.player.y + this.player.size / 2);
    
    // Stretch slime based on velocity
    let scaleX = 1;
    let scaleY = 1;
    if (this.player.vy < 0) {
      scaleY = 1.25;
      scaleX = 0.8;
    } else if (this.player.vy > 1) {
      scaleY = 0.9;
      scaleX = 1.1;
    }
    this.ctx.scale(scaleX, scaleY);

    const charGrad = this.ctx.createRadialGradient(0, -3, 2, 0, 0, this.player.size / 2);
    charGrad.addColorStop(0, '#ffeb3b');
    charGrad.addColorStop(1, '#ff9800');
    this.ctx.fillStyle = charGrad;

    this.ctx.beginPath();
    this.ctx.arc(0, 0, this.player.size / 2, 0, Math.PI * 2);
    this.ctx.fill();

    // Cute eyes
    this.ctx.fillStyle = "#000";
    this.ctx.beginPath();
    this.ctx.arc(-5, -3, 2.5, 0, Math.PI * 2);
    this.ctx.arc(5, -3, 2.5, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();
  },

  endGame() {
    this.destroy();
    SoundFX.playWin();

    this.container.innerHTML = `
      <div class="game-win-overlay">
        <div class="win-title">${this.lives <= 0 ? "💀 掉落深淵！挑戰結束" : "🏆 挑戰完成！"}</div>
        <p>你在平台彈跳跳躍任務中取得了優異成績！</p>
        <div class="win-score">SCORE: ${this.score}</div>
        <p style="color:var(--text-muted)">成功彈跳次數: ${this.correctCount} 次</p>
        <button id="btn-win-exit" class="btn btn-neon-gold">退出並登錄成績</button>
      </div>
    `;

    document.getElementById('btn-win-exit').addEventListener('click', async () => {
      SoundFX.playClick();
      const exitBtn = document.getElementById('btn-win-exit');
      exitBtn.disabled = true;
      exitBtn.textContent = "上傳成績中...";

      await GAS_API.logScore("彈跳小英雄", this.score, this.correctCount, this.totalJumps);

      // Go back to lobby
      document.getElementById('game-stage').classList.add('hidden');
      document.getElementById('arcade-lobby').classList.remove('hidden');
      ArcadeState.currentGame = null;
    });
  },

  destroy() {
    clearInterval(this.timerInterval);
    cancelAnimationFrame(this.animationId);
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);

    // Clean up touch handlers
    const btnLeft = document.getElementById('jumper-btn-left');
    const btnRight = document.getElementById('jumper-btn-right');
    if (btnLeft && btnRight && this.touchHandlers) {
      btnLeft.removeEventListener('pointerdown', this.touchHandlers.leftDown);
      btnLeft.removeEventListener('pointerup', this.touchHandlers.leftUp);
      btnLeft.removeEventListener('pointercancel', this.touchHandlers.leftUp);
      btnLeft.removeEventListener('pointerleave', this.touchHandlers.leftUp);

      btnRight.removeEventListener('pointerdown', this.touchHandlers.rightDown);
      btnRight.removeEventListener('pointerup', this.touchHandlers.rightUp);
      btnRight.removeEventListener('pointercancel', this.touchHandlers.rightUp);
      btnRight.removeEventListener('pointerleave', this.touchHandlers.rightUp);
    }
    this.leftPressed = false;
    this.rightPressed = false;
  }
};

window.JumperGame = JumperGame;
