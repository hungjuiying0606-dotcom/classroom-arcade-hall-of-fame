/* ==========================================
   CLASSROOM ARCADE - WHACK-A-MOLE GAME (mole.js)
   ========================================== */

const MoleGame = {
  container: null,
  score: 0,
  timeLeft: 60,
  timerInterval: null,
  moleInterval: null,
  
  currentQuestion: null,
  correctCount: 0,
  totalWhacks: 0,
  
  // 6 holes config
  holesCount: 6,
  molesUp: [],
  activeMolesTimer: [],
  
  init() {
    this.container = document.getElementById('game-body');
    this.score = 0;
    this.sessionQuestions = ArcadeState.getRandomQuestions(20);
    this.currentQuestionIndex = 0;
    this.timeLeft = 60;
    this.correctCount = 0;
    this.totalWhacks = 0;
    this.molesUp = Array(this.holesCount).fill(false);
    this.activeMolesTimer = [];
    
    document.getElementById('game-stage-title').textContent = "拼速打地鼠";
    document.getElementById('game-score').textContent = this.score;
    document.getElementById('game-timer').textContent = "時限: 60s";

    this.renderStage();
    this.nextQuestion();
    this.startTimers();
  },

  renderStage() {
    this.container.innerHTML = `
      <div class="mole-wrapper">
        <div class="mole-question-box">
          <p style="font-size:0.8rem; color:var(--neon-green); text-transform:uppercase; font-weight:700; margin-bottom:0.25rem">當前題目</p>
          <h3 id="mole-question-text" style="font-size:1.25rem; line-height:1.4">載入問題中...</h3>
        </div>
        
        <div class="mole-grid">
          <!-- 6 holes generated here -->
          ${Array(this.holesCount).fill(0).map((_, idx) => `
            <div class="mole-hole" id="hole-${idx}">
              <div class="mole" id="mole-${idx}">
                <div class="mole-face">🐹</div>
                <div class="mole-sign" id="mole-sign-${idx}">選項</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // Bind whack events
    for (let idx = 0; idx < this.holesCount; idx++) {
      const moleEl = document.getElementById(`mole-${idx}`);
      moleEl.addEventListener('click', (e) => this.whackMole(idx, e));
    }
  },

  startTimers() {
    // 60 seconds game timer
    clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.timeLeft--;
      document.getElementById('game-timer').textContent = `進度: ${this.currentQuestionIndex}/20 | 時間: ${this.timeLeft}s`;
      
      if (this.timeLeft <= 0) {
        this.endGame();
      }
    }, 1000);

    // Mole spawn scheduler
    clearInterval(this.moleInterval);
    this.moleInterval = setInterval(() => {
      this.spawnMolesRandomly();
    }, 1200);
  },

  nextQuestion() {
    // Pick a random question
    if (this.currentQuestionIndex >= 20) {
      this.endGame();
      return;
    }
    const rawQuestion = this.sessionQuestions[this.currentQuestionIndex];
    this.currentQuestionIndex++;
    
    // Convert simplified Q&A format to 4-choice format
    this.currentQuestion = ArcadeState.getMultipleChoiceQuestion(rawQuestion);
    
    document.getElementById('mole-question-text').textContent = this.currentQuestion.question;
    
    // Reset all moles
    this.popDownAll();
  },

  popDownAll() {
    this.activeMolesTimer.forEach(t => clearTimeout(t));
    this.activeMolesTimer = [];
    
    for (let i = 0; i < this.holesCount; i++) {
      const hole = document.getElementById(`hole-${i}`);
      hole.classList.remove('active');
      this.molesUp[i] = false;
    }
  },

  spawnMolesRandomly() {
    // Check how many moles are currently up. Max 4 moles up.
    const activeCount = this.molesUp.filter(u => u).length;
    if (activeCount >= 3) return;

    // Determine what roles to spawn
    // Roles needed: Option A, B, C, D, and Distractions (Bomb, Joke)
    // We shuffle options and assign them to empty holes
    const unusedHoles = [];
    this.molesUp.forEach((up, idx) => {
      if (!up) unusedHoles.push(idx);
    });

    if (unusedHoles.length === 0) return;

    // Pick a role to spawn: correct answer, wrong answers, or a distraction
    // Ensure that correct answer mole is spawned frequently
    const spawnType = Math.random();
    let label = "";
    let dataRole = "";
    let face = "🐹";

    if (spawnType < 0.35) {
      // Spawn correct answer
      label = this.currentQuestion.options[this.currentQuestion.answer];
      dataRole = "correct";
      face = "🐹";
    } else if (spawnType < 0.75) {
      // Spawn a random wrong answer
      const wrongIndices = [];
      this.currentQuestion.options.forEach((_, idx) => {
        if (idx !== this.currentQuestion.answer) wrongIndices.push(idx);
      });
      const wrongIdx = wrongIndices[Math.floor(Math.random() * wrongIndices.length)];
      label = this.currentQuestion.options[wrongIdx] || "錯誤答案";
      dataRole = "wrong";
      face = "🐹";
    } else {
      // Spawn a bomb or joke mole
      if (Math.random() > 0.5) {
        label = "💣 炸彈!";
        dataRole = "bomb";
        face = "💥";
      } else {
        label = "🤪 點我扣分!";
        dataRole = "joke";
        face = "🤪";
      }
    }

    if (!label) return;

    // Pick a random unused hole
    const targetHoleIdx = unusedHoles[Math.floor(Math.random() * unusedHoles.length)];
    const hole = document.getElementById(`hole-${targetHoleIdx}`);
    const mole = document.getElementById(`mole-${targetHoleIdx}`);
    const sign = document.getElementById(`mole-sign-${targetHoleIdx}`);
    const faceEl = mole.querySelector('.mole-face');

    // Setup mole properties
    faceEl.textContent = face;
    sign.textContent = label.length > 15 ? label.substring(0, 13) + "..." : label;
    mole.dataset.role = dataRole;
    
    // Popup
    hole.classList.add('active');
    this.molesUp[targetHoleIdx] = true;

    // Schedule to pop down
    const duration = 3000 + Math.random() * 2000; // 3 to 5 seconds
    const timer = setTimeout(() => {
      hole.classList.remove('active');
      this.molesUp[targetHoleIdx] = false;
    }, duration);

    this.activeMolesTimer.push(timer);
  },

  whackMole(idx, e) {
    const hole = document.getElementById(`hole-${idx}`);
    const mole = document.getElementById(`mole-${idx}`);
    
    if (!hole.classList.contains('active')) return;
    
    this.totalWhacks++;
    const role = mole.dataset.role;

    // Visual Whack Effect
    const effect = document.createElement('div');
    effect.className = 'whack-effect';
    effect.style.left = `${e.clientX - 20}px`;
    effect.style.top = `${e.clientY - 40}px`;
    effect.style.position = 'fixed';
    document.body.appendChild(effect);
    
    setTimeout(() => effect.remove(), 500);

    if (role === "correct") {
      // HIT CORRECT MOLE
      effect.textContent = "💥 HIT!";
      effect.style.color = "var(--neon-green)";
      SoundFX.playCoin();
      
      this.score += 100;
      this.correctCount++;
      document.getElementById('game-score').textContent = this.score;
      
      // Flash correct sign indicator
      const sign = document.getElementById(`mole-sign-${idx}`);
      sign.style.background = "var(--neon-green)";
      sign.style.color = "var(--text-dark)";
      
      setTimeout(() => {
        this.nextQuestion();
      }, 300);
      
    } else if (role === "wrong") {
      // HIT WRONG OPTION MOLE
      effect.textContent = "❌ MISS!";
      effect.style.color = "var(--neon-pink)";
      SoundFX.playFail();
      
      this.score = Math.max(0, this.score - 20);
      document.getElementById('game-score').textContent = this.score;
      
      // Flash incorrect indicator
      const sign = document.getElementById(`mole-sign-${idx}`);
      sign.style.background = "var(--neon-pink)";
      sign.style.color = "#fff";
      
      setTimeout(() => {
        hole.classList.remove('active');
        this.molesUp[idx] = false;
      }, 300);
      
    } else if (role === "bomb") {
      // HIT BOMB
      effect.textContent = "💥 BOOM!";
      effect.style.color = "var(--neon-gold)";
      SoundFX.playFail();
      
      this.score = Math.max(0, this.score - 20);
      document.getElementById('game-score').textContent = this.score;
      
      setTimeout(() => {
        this.popDownAll();
      }, 300);
      
    } else if (role === "joke") {
      // HIT JOKE
      effect.textContent = "🤪 OUCH!";
      effect.style.color = "var(--neon-pink)";
      SoundFX.playFail();
      
      this.score = Math.max(0, this.score - 20);
      document.getElementById('game-score').textContent = this.score;
      
      setTimeout(() => {
        hole.classList.remove('active');
        this.molesUp[idx] = false;
      }, 300);
    }
  },

  async endGame() {
    this.destroy();
    
    SoundFX.playWin();
    
    this.container.innerHTML = `
      <div class="game-win-overlay">
        <div class="win-title">🏆 挑戰完成！</div>
        <p>你在打地鼠限時挑戰中取得了優異的成績！</p>
        <div class="win-score">SCORE: ${this.score}</div>
        <p style="color:var(--text-muted)">答對題數: ${this.correctCount} 題 / 總敲擊次數: ${this.totalWhacks} 次</p>
        <button id="btn-win-exit" class="btn btn-neon-green">退出並登錄成績</button>
      </div>
    `;

    document.getElementById('btn-win-exit').addEventListener('click', async () => {
      SoundFX.playClick();
      const exitBtn = document.getElementById('btn-win-exit');
      exitBtn.disabled = true;
      exitBtn.textContent = "上傳成績中...";
      
      await GAS_API.logScore("拼速打地鼠", this.score, this.correctCount, this.totalWhacks);
      
      // Go back to lobby
      document.getElementById('game-stage').classList.add('hidden');
      document.getElementById('arcade-lobby').classList.remove('hidden');
      ArcadeState.currentGame = null;
    });
  },

  destroy() {
    clearInterval(this.timerInterval);
    clearInterval(this.moleInterval);
    this.activeMolesTimer.forEach(t => clearTimeout(t));
  }
};

window.MoleGame = MoleGame;
