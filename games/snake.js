/* ==========================================
   CLASSROOM ARCADE - SNAKE (snake.js)
   ========================================== */

const SnakeGame = {
  container: null, score: 0, timeLeft: 90, timerInterval: null,
  animationId: null, canvas: null, ctx: null,
  snake: [], dir: {x:1,y:0}, nextDir: {x:1,y:0}, food: null,
  gridSize: 20, cols: 0, rows: 0, gameOver: false,
  currentQuestion: null, correctCount: 0, totalEaten: 0, lives: 3,
  sessionQuestions: [], currentQuestionIndex: 0,
  questionPending: false, speed: 150,

  init() {
    this.container = document.getElementById('game-body');
    this.score = 0; this.timeLeft = 90; this.correctCount = 0; this.totalEaten = 0; this.lives = 3;
    this.sessionQuestions = ArcadeState.getRandomQuestions(15);
    this.currentQuestionIndex = 0; this.gameOver = false; this.questionPending = false;
    document.getElementById('game-stage-title').textContent = "知識蛇";
    document.getElementById('game-score').textContent = "0";
    this.renderStage();
    this.canvas = document.getElementById('snake-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', this.resize);
    this.cols = Math.floor(this.canvas.width / this.gridSize);
    this.rows = Math.floor(this.canvas.height / this.gridSize);
    this.snake = [{x:Math.floor(this.cols/2),y:Math.floor(this.rows/2)}];
    this.dir = {x:1,y:0}; this.nextDir = {x:1,y:0};
    this.spawnFood();
    this.startTimers();
    this.setupInput();
    this.gameLoop();
  },

  resize: () => { const g = SnakeGame; if (!g.canvas) return; g.canvas.width = g.canvas.clientWidth; g.canvas.height = g.canvas.clientHeight; },

  renderStage() {
    this.container.innerHTML = `<div style="width:100%;height:100%;background:#0f111a;border-radius:12px;overflow:hidden;display:flex;flex-direction:column;border:2px solid var(--neon-green);">
      <div style="padding:8px 16px;background:rgba(0,255,127,0.1);border-bottom:1px solid rgba(0,255,127,0.3);text-align:center;z-index:5;">
        <span id="snake-status" style="color:#fff;font-size:0.9rem;font-weight:700;">🔄 吃正確答案！方向鍵或滑動控制</span>
      </div>
      <canvas id="snake-canvas" style="flex:1;width:100%;display:block;touch-action:none;"></canvas>
    </div>`;
  },

  setupInput() {
    document.addEventListener('keydown', this.onKey);
    let sx=0,sy=0;
    this.canvas.addEventListener('touchstart', (e) => { const t=e.touches[0]; sx=t.clientX; sy=t.clientY; });
    this.canvas.addEventListener('touchend', (e) => {
      const t=e.changedTouches[0]; const dx=t.clientX-sx; const dy=t.clientY-sy;
      if (Math.abs(dx)>Math.abs(dy)) SnakeGame.setDir(dx>0?{x:1,y:0}:{x:-1,y:0});
      else SnakeGame.setDir(dy>0?{x:0,y:1}:{x:0,y:-1});
    });
    this.canvas.addEventListener('pointerdown', (e) => { sx=e.clientX; sy=e.clientY; });
    this.canvas.addEventListener('pointerup', (e) => {
      const dx=e.clientX-sx; const dy=e.clientY-sy;
      if (Math.abs(dx)>20||Math.abs(dy)>20) {
        if (Math.abs(dx)>Math.abs(dy)) SnakeGame.setDir(dx>0?{x:1,y:0}:{x:-1,y:0});
        else SnakeGame.setDir(dy>0?{x:0,y:1}:{x:0,y:-1});
      }
    });
  },

  onKey: (e) => {
    const m={ArrowUp:{x:0,y:-1},ArrowDown:{x:0,y:1},ArrowLeft:{x:-1,y:0},ArrowRight:{x:1,y:0}};
    if (m[e.key]) SnakeGame.setDir(m[e.key]);
  },

  setDir(d) {
    const g = SnakeGame;
    if (g.dir.x + d.x !== 0 || g.dir.y + d.y !== 0) g.nextDir = d;
  },

  spawnFood() {
    if (this.currentQuestionIndex >= this.sessionQuestions.length) { this.endGame(); return; }
    const raw = this.sessionQuestions[this.currentQuestionIndex];
    const q = ArcadeState.getMultipleChoiceQuestion(raw);
    this.currentQuestion = q;
    let pos, empty = false;
    for (let attempt = 0; attempt < 100; attempt++) {
      pos = {x: Math.floor(Math.random() * this.cols), y: Math.floor(Math.random() * this.rows)};
      if (!this.snake.some(s => s.x === pos.x && s.y === pos.y)) { empty = true; break; }
    }
    if (!empty) return;
    this.food = { ...pos, isCorrect: true, text: q.options[q.answer].substring(0,8) };
    document.getElementById('snake-status').textContent = `🍎 吃掉正確答案：${q.question.substring(0,30)}...`;
  },

  startTimers() {
    this.timerInterval = setInterval(() => {
      this.timeLeft--; document.getElementById('game-timer').textContent = `${this.timeLeft}s | ❤️ ${this.lives}`;
      if (this.timeLeft <= 0) this.endGame();
    }, 1000);
  },

  gameLoop() {
    if (this.gameOver) return;
    this.update();
    this.draw();
    this.animationId = setTimeout(() => this.gameLoop(), this.speed);
  },

  update() {
    this.dir = {...this.nextDir};
    const head = {x: this.snake[0].x + this.dir.x, y: this.snake[0].y + this.dir.y};
    if (head.x < 0 || head.x >= this.cols || head.y < 0 || head.y >= this.rows) {
      this.lives--;
      if (this.lives <= 0) { this.endGame(); return; }
      this.snake = [{x:Math.floor(this.cols/2),y:Math.floor(this.rows/2)}];
      this.dir = {x:1,y:0}; this.nextDir = {x:1,y:0};
      document.getElementById('snake-status').textContent = `💔 撞牆了！剩餘生命: ❤️${this.lives}`;
      return;
    }
    if (this.snake.some(s => s.x === head.x && s.y === head.y)) {
      this.lives--;
      if (this.lives <= 0) { this.endGame(); return; }
      this.snake = [{x:Math.floor(this.cols/2),y:Math.floor(this.rows/2)}];
      this.dir = {x:1,y:0}; this.nextDir = {x:1,y:0};
      document.getElementById('snake-status').textContent = `💔 撞到自己了！剩餘生命: ❤️${this.lives}`;
      return;
    }
    this.snake.unshift(head);
    if (this.food && head.x === this.food.x && head.y === this.food.y) {
      this.totalEaten++;
      this.correctCount++; this.score += 100; SoundFX.playSuccess();
      document.getElementById('game-score').textContent = this.score;
      this.currentQuestionIndex++;
      this.spawnFood();
    } else {
      this.snake.pop();
    }
  },

  draw() {
    const c = this.canvas, ctx = this.ctx;
    ctx.fillStyle = "#0f111a"; ctx.fillRect(0, 0, c.width, c.height);
    for (let x = 0; x < this.cols; x++) for (let y = 0; y < this.rows; y++) {
      if ((x + y) % 2 === 0) { ctx.fillStyle = "#131626"; ctx.fillRect(x*this.gridSize, y*this.gridSize, this.gridSize, this.gridSize); }
    }
    this.snake.forEach((s, i) => {
      ctx.fillStyle = i === 0 ? '#00b894' : '#00a381';
      ctx.beginPath(); ctx.roundRect(s.x*this.gridSize+1, s.y*this.gridSize+1, this.gridSize-2, this.gridSize-2, 4); ctx.fill();
    });
    if (this.food) {
      ctx.fillStyle = "#e17055"; ctx.beginPath(); ctx.arc(this.food.x*this.gridSize+this.gridSize/2, this.food.y*this.gridSize+this.gridSize/2, this.gridSize/2-2, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = "#fff"; ctx.font = "10px Outfit,sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(this.food.text, this.food.x*this.gridSize+this.gridSize/2, this.food.y*this.gridSize+this.gridSize/2);
    }
  },

  endGame() {
    this.gameOver = true; this.destroy(); SoundFX.playWin();
    this.container.innerHTML = `<div class="game-win-overlay"><div class="win-title">🏆 知識蛇遊戲結束！</div><div class="win-score">SCORE: ${this.score}</div><p style="color:var(--text-muted)">答對: ${this.correctCount} / 食物: ${this.totalEaten}</p><button id="btn-win-exit" class="btn btn-neon-green">退出並登錄成績</button></div>`;
    document.getElementById('btn-win-exit').addEventListener('click', async () => {
      SoundFX.playClick(); const b = document.getElementById('btn-win-exit'); b.disabled = true; b.textContent = "上傳成績中...";
      await GAS_API.logScore("知識蛇", this.score, this.correctCount, this.totalEaten);
      document.getElementById('game-stage').classList.add('hidden'); document.getElementById('arcade-lobby').classList.remove('hidden'); ArcadeState.currentGame = null;
    });
  },

  destroy() {
    clearInterval(this.timerInterval); clearTimeout(this.animationId);
    document.removeEventListener('keydown', this.onKey);
    if (this.canvas) { this.canvas.removeEventListener('pointerdown', () => {}); }
    window.removeEventListener('resize', this.resize);
  }
};
window.SnakeGame = SnakeGame;
