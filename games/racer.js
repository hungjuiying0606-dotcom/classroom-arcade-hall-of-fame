/* ==========================================
   CLASSROOM ARCADE - SPEED RACER (racer.js)
   ========================================== */

const RacerGame = {
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
  totalGates: 0,

  playerLane: 1, // 0, 1, 2, 3
  lanesCount: 4,
  carSpeed: 1.2, // Set to 1.2 so that the gates fall from -150 to carY in exactly 7.5 seconds
  trackOffset: 0,
  gates: [],
  particles: [],

  init() {
    this.container = document.getElementById('game-body');
    this.score = 0;
    this.sessionQuestions = ArcadeState.getRandomQuestions(20);
    this.currentQuestionIndex = 0;
    this.lives = 10;
    this.timeLeft = 90; // Increased to 90s to ensure players can complete all 10 questions
    this.correctCount = 0;
    this.totalGates = 0;
    this.playerLane = 1;
    this.gates = [];
    this.particles = [];
    this.trackOffset = 0;

    document.getElementById('game-stage-title').textContent = "極速賽車手";
    document.getElementById('game-score').textContent = this.score;
    this.updateStatsUI();

    this.renderStage();
    this.initCanvas();
    this.nextQuestion();
    this.startTimers();
    this.loop();
  },

  updateStatsUI() {
    let cars = "";
    for (let i = 0; i < 10; i++) {
      cars += i < this.lives ? "🏎️" : "💥";
    }
    document.getElementById('game-timer').textContent = `賽車: ${cars} | 進度: ${Math.min(20, this.currentQuestionIndex)}/20 | 時間: ${this.timeLeft}s`;
  },

  renderStage() {
    this.container.innerHTML = `
      <div class="racer-wrapper" style="position:relative; width:100%; height:550px; background:#101520; border-radius:12px; overflow:hidden; border:2px solid var(--neon-blue); display:flex; flex-direction:column;">
        <div class="racer-question-box" style="padding:10px; background:rgba(0, 217, 255, 0.1); border-bottom:1px solid rgba(0,217,255,0.3); text-align:center; z-index:5;">
          <p style="font-size:0.75rem; color:var(--neon-blue); text-transform:uppercase; font-weight:700; margin:0 0 4px 0">駕駛任務：將賽車開進標示「正確答案」的車道！(← → 鍵或點擊車道)</p>
          <h3 id="racer-question-text" style="font-size:1.1rem; line-height:1.3; margin:0; color:#fff">載入問題中...</h3>
        </div>
        <canvas id="racer-canvas" style="flex:1; width:100%; display:block;"></canvas>
      </div>
    `;
  },

  initCanvas() {
    this.canvas = document.getElementById('racer-canvas');
    this.ctx = this.canvas.getContext('2d');
    
    this.canvas.width = this.canvas.clientWidth;
    this.canvas.height = this.canvas.clientHeight;

    this.carY = this.canvas.height - 90;

    // Controls
    window.addEventListener('keydown', this.handleKeyDown);
    this.canvas.addEventListener('click', this.handleCanvasClick);
  },

  handleKeyDown: (e) => {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
      RacerGame.moveLane(-1);
    }
    if (e.code === 'ArrowRight' || e.code === 'KeyD') {
      RacerGame.moveLane(1);
    }
  },
  handleCanvasClick: (e) => {
    const rect = RacerGame.canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const colWidth = RacerGame.canvas.width / RacerGame.lanesCount;
    const lane = Math.floor(clickX / colWidth);
    RacerGame.setLane(lane);
  },

  moveLane(dir) {
    this.setLane(this.playerLane + dir);
  },
  setLane(lane) {
    if (lane >= 0 && lane < this.lanesCount) {
      this.playerLane = lane;
      SoundFX.playClick();
    }
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
    
    document.getElementById('racer-question-text').textContent = this.currentQuestion.question;
    
    this.spawnGates();
  },

  spawnGates() {
    this.gates = [];
    const options = this.currentQuestion.options;
    // We only take up to 3 options to match 3 lanes
    const count = Math.min(options.length, this.lanesCount);
    const colWidth = this.canvas.width / this.lanesCount;

    for (let i = 0; i < count; i++) {
      const opt = options[i];
      this.gates.push({
        lane: i,
        y: -150, // Spawn higher up to give more reading/reaction time
        width: colWidth - 40,
        height: 40,
        text: opt.length > 10 ? opt.substring(0, 9) + ".." : opt,
        fullText: opt,
        isCorrect: i === this.currentQuestion.answer,
        triggered: false
      });
    }
    this.totalGates++;
    this.updateStatsUI();
  },

  loop() {
    this.updatePhysics();
    this.draw();
    if (this.lives > 0 && this.timeLeft > 0) {
      this.animationId = requestAnimationFrame(() => this.loop());
    }
  },

  updatePhysics() {
    // 1. Move track lines (speed illusion)
    this.trackOffset = (this.trackOffset + this.carSpeed) % 80;

    // 2. Move Gates
    this.gates.forEach(g => {
      g.y += this.carSpeed;

      // Check collision when gate reaches car position
      if (!g.triggered && g.y + g.height >= this.carY && g.y <= this.carY + 60) {
        if (g.lane === this.playerLane) {
          g.triggered = true;
          this.handleGatePassed(g);
        }
      }
    });

    // If all gates go off-screen and we haven't answered, force next question
    if (this.gates.length > 0 && this.gates[0].y > this.canvas.height) {
      // User missed the gates!
      if (this.currentQuestionIndex >= 20) {
        this.endGame();
      } else {
        this.nextQuestion();
      }
    }

    // 3. Update speed particles
    this.particles.forEach((p, index) => {
      p.y += p.speed;
      if (p.y > this.canvas.height) {
        this.particles.splice(index, 1);
      }
    });
  },

  handleGatePassed(gate) {
    if (gate.isCorrect) {
      // Correct!
      SoundFX.playCoin();
      this.score += 100;
      this.correctCount++;
      document.getElementById('game-score').textContent = this.score;

      // Spark particles
      for (let i = 0; i < 15; i++) {
        this.particles.push({
          x: this.canvas.width / this.lanesCount * this.playerLane + this.canvas.width / this.lanesCount / 2 + (Math.random() - 0.5) * 50,
          y: this.carY,
          speed: Math.random() * 4 + 2,
          size: Math.random() * 3 + 1,
          color: "rgba(0, 217, 255, 0.8)"
        });
      }

      setTimeout(() => {
        if (this.currentQuestionIndex >= 20) {
          this.endGame();
        } else {
          this.nextQuestion();
        }
      }, 500);
    } else {
      // Wrong!
      SoundFX.playFail();
      this.lives--;
      this.score = Math.max(0, this.score - 20);
      document.getElementById('game-score').textContent = this.score;
      this.updateStatsUI();

      // Smoke particles (crash)
      for (let i = 0; i < 20; i++) {
        this.particles.push({
          x: this.canvas.width / this.lanesCount * this.playerLane + this.canvas.width / this.lanesCount / 2 + (Math.random() - 0.5) * 40,
          y: this.carY + 20,
          speed: -Math.random() * 3 - 1,
          size: Math.random() * 8 + 4,
          color: "rgba(100, 100, 100, 0.5)"
        });
      }

      if (this.lives <= 0) {
        this.endGame();
      } else {
        setTimeout(() => {
          if (this.currentQuestionIndex >= 20) {
            this.endGame();
          } else {
            this.nextQuestion();
          }
        }, 500);
      }
    }
  },

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const colWidth = this.canvas.width / this.lanesCount;

    // 1. Draw Highway Road lanes
    this.ctx.fillStyle = "#1b2030";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw Lane lines
    this.ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    this.ctx.lineWidth = 4;
    for (let i = 1; i < this.lanesCount; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(i * colWidth, 0);
      this.ctx.lineTo(i * colWidth, this.canvas.height);
      this.ctx.stroke();
    }

    // Draw scrolling dashed stripes on lanes
    this.ctx.strokeStyle = "#ffb000";
    this.ctx.lineWidth = 6;
    this.ctx.setLineDash([30, 50]);
    this.ctx.lineDashOffset = -this.trackOffset;
    for (let i = 1; i < this.lanesCount; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(i * colWidth, 0);
      this.ctx.lineTo(i * colWidth, this.canvas.height);
      this.ctx.stroke();
    }
    this.ctx.setLineDash([]); // reset

    // 2. Draw Gates / Archways containing answer texts
    this.gates.forEach(g => {
      this.ctx.save();
      
      const xStart = g.lane * colWidth + 15;
      const xEnd = (g.lane + 1) * colWidth - 15;

      // Drawing horizontal banner
      const grad = this.ctx.createLinearGradient(xStart, g.y, xEnd, g.y);
      if (g.triggered) {
        grad.addColorStop(0, g.isCorrect ? '#00ff7f' : '#ff0055');
        grad.addColorStop(1, g.isCorrect ? '#00bfa5' : '#d50000');
      } else {
        grad.addColorStop(0, '#00d9ff');
        grad.addColorStop(1, '#0055ff');
      }
      
      this.ctx.fillStyle = grad;
      this.ctx.beginPath();
      this.ctx.roundRect(xStart, g.y, colWidth - 30, g.height, 6);
      this.ctx.fill();

      // Draw text
      this.ctx.fillStyle = "#ffffff";
      this.ctx.font = "bold 0.85rem Outfit, sans-serif";
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";
      this.ctx.fillText(g.text, xStart + (colWidth - 30) / 2, g.y + g.height / 2);

      this.ctx.restore();
    });

    // 3. Draw Speed / Crash Particles
    this.particles.forEach(p => {
      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
    });

    // 4. Draw Player Car (Sleek sports racer from back view)
    const carWidth = 50;
    const carHeight = 65;
    const carX = this.playerLane * colWidth + colWidth / 2 - carWidth / 2;

    this.ctx.save();
    this.ctx.translate(carX, this.carY);

    // Wheels
    this.ctx.fillStyle = "#111";
    this.ctx.fillRect(-4, 10, 8, 16);
    this.ctx.fillRect(carWidth - 4, 10, 8, 16);
    this.ctx.fillRect(-4, carHeight - 20, 8, 16);
    this.ctx.fillRect(carWidth - 4, carHeight - 20, 8, 16);

    // Car Body Gradient
    const carGrad = this.ctx.createLinearGradient(0, 0, 0, carHeight);
    carGrad.addColorStop(0, '#ff007f');
    carGrad.addColorStop(1, '#99004d');
    
    this.ctx.fillStyle = carGrad;
    this.ctx.beginPath();
    this.ctx.roundRect(0, 0, carWidth, carHeight, 10);
    this.ctx.fill();

    // Windshield
    this.ctx.fillStyle = "#00d9ff";
    this.ctx.fillRect(8, 15, carWidth - 16, 12);

    // Tail lights
    this.ctx.fillStyle = "#ff0000";
    this.ctx.shadowBlur = 10;
    this.ctx.shadowColor = "#ff0000";
    this.ctx.fillRect(4, carHeight - 6, 8, 4);
    this.ctx.fillRect(carWidth - 12, carHeight - 6, 8, 4);

    this.ctx.restore();
  },

  endGame() {
    this.destroy();
    SoundFX.playWin();

    this.container.innerHTML = `
      <div class="game-win-overlay">
        <div class="win-title">${this.lives <= 0 ? "💥 車體嚴重毀損！" : (this.currentQuestionIndex >= 20 ? "🏁 恭喜抵達終點！" : "🏆 挑戰完成！")}</div>
        <p>你在極速賽車與學術道路上的表現極佳！</p>
        <div class="win-score">SCORE: ${this.score}</div>
        <p style="color:var(--text-muted)">成功通過閘門: ${this.correctCount} 次</p>
        <button id="btn-win-exit" class="btn btn-neon-blue">退出並登錄成績</button>
      </div>
    `;

    document.getElementById('btn-win-exit').addEventListener('click', async () => {
      SoundFX.playClick();
      const exitBtn = document.getElementById('btn-win-exit');
      exitBtn.disabled = true;
      exitBtn.textContent = "上傳成績中...";

      await GAS_API.logScore("極速賽車手", this.score, this.correctCount, this.totalGates);

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
  }
};

window.RacerGame = RacerGame;
