/* ==========================================
   CLASSROOM ARCADE - MONOPOLY GAME (monopoly.js)
   ========================================== */

const MonopolyGame = {
  container: null,
  score: 300,
  position: 0,
  laps: 0,
  maxLaps: 2,
  questionsAsked: 0,
  questionsCorrect: 0,
  isMoving: false,
  isJailed: false,
  
  // Board cell definition: 20 cells
  cells: [
    { name: "起點", type: "start", color: "", label: "🏁 起點" },
    { name: "國語", type: "question", color: "pink", label: "📚 國語" },
    { name: "命運", type: "chance", color: "", label: "❓ 命運" },
    { name: "數學", type: "question", color: "blue", label: "📐 數學" },
    { name: "機會", type: "chance", color: "", label: "🌟 機會" },
    { name: "監獄", type: "jail", color: "", label: "🔒 監獄" },
    { name: "英文", type: "question", color: "green", label: "🔤 英文" },
    { name: "自然", type: "question", color: "blue", label: "🔬 自然" },
    { name: "機會", type: "chance", color: "", label: "🌟 機會" },
    { name: "社會", type: "question", color: "pink", label: "🗺️ 社會" },
    { name: "去坐牢", type: "go-to-jail", color: "", label: "🚨 去坐牢" },
    { name: "體育", type: "question", color: "green", label: "🏀 體育" },
    { name: "命運", type: "chance", color: "", label: "❓ 命運" },
    { name: "音樂", type: "question", color: "gold", label: "🎵 音樂" },
    { name: "藝術", type: "question", color: "gold", label: "🎨 藝術" },
    { name: "免費停車", type: "free-parking", color: "", label: "🚗 休息站" },
    { name: "歷史", type: "question", color: "pink", label: "🏺 歷史" },
    { name: "機會", type: "chance", color: "", label: "🌟 機會" },
    { name: "地理", type: "question", color: "blue", label: "🌋 地理" },
    { name: "資訊", type: "question", color: "green", label: "💻 資訊" }
  ],

  // Grid coordinates mapping (1-based row and column)
  coordinates: [
    { r: 1, c: 1 }, { r: 1, c: 2 }, { r: 1, c: 3 }, { r: 1, c: 4 }, { r: 1, c: 5 }, { r: 1, c: 6 },
    { r: 2, c: 6 }, { r: 3, c: 6 }, { r: 4, c: 6 }, { r: 5, c: 6 }, { r: 6, c: 6 },
    { r: 6, c: 5 }, { r: 6, c: 4 }, { r: 6, c: 3 }, { r: 6, c: 2 }, { r: 6, c: 1 },
    { r: 5, c: 1 }, { r: 4, c: 1 }, { r: 3, c: 1 }, { r: 2, c: 1 }
  ],

  init() {
    this.container = document.getElementById('game-body');
    this.score = 300;
    this.position = 0;
    this.laps = 0;
    this.questionsAsked = 0;
    this.questionsCorrect = 0;
    this.isMoving = false;
    this.isJailed = false;
    
    this.sessionQuestions = ArcadeState.getRandomQuestions(30);
    this.questionsPoolIndex = 0;
    
    // Update platform UI headers
    document.getElementById('game-stage-title').textContent = "知識大富翁";
    document.getElementById('game-score').textContent = this.score;
    document.getElementById('game-timer').textContent = "進度: 0 / 20 題";
    
    this.renderBoard();
    this.updateTokenPosition();
  },

  renderBoard() {
    this.container.innerHTML = `
      <div class="monopoly-board-wrapper">
        <div class="monopoly-board">
          <div class="monopoly-center">
            <h3 style="font-family:var(--font-arcade); font-size:1.1rem; color:var(--neon-pink); margin-bottom:0.5rem">BOARD CENTER</h3>
            <div class="dice-container">
              <div id="monopoly-dice" class="dice">🎲</div>
              <button id="btn-roll" class="btn btn-sm btn-neon-blue">擲骰子</button>
            </div>
            <p id="monopoly-info" style="font-size:0.85rem; color:var(--text-muted); margin-top:1rem">準備好起跑了嗎？點擊按鈕擲骰子！</p>
          </div>
          
          <!-- Cells injected by JS -->
        </div>
      </div>
    `;

    const board = this.container.querySelector('.monopoly-board');

    // Render cells
    this.cells.forEach((cell, idx) => {
      const coord = this.coordinates[idx];
      const cellEl = document.createElement('div');
      cellEl.className = `monopoly-cell ${cell.type} cell-${cell.color}`;
      if (idx === 0 || idx === 5 || idx === 10 || idx === 15) {
        cellEl.classList.add('corner-cell');
      }
      
      cellEl.style.gridRow = coord.r;
      cellEl.style.gridColumn = coord.c;
      
      cellEl.innerHTML = `
        <div class="monopoly-cell-header"></div>
        <div style="font-weight:700; font-size:0.8rem">${cell.label.split(' ')[0]}</div>
        <div style="font-size:0.75rem">${cell.label.split(' ')[1]}</div>
        <div id="token-slot-${idx}" style="min-height:24px; width:100%; display:flex; justify-content:center; align-items:center; gap:2px"></div>
      `;
      
      board.appendChild(cellEl);
    });

    // Spawn player token
    const token = document.createElement('div');
    token.id = 'player-token-element';
    token.className = 'player-token';
    token.textContent = 'P1';
    board.appendChild(token);

    // Bind event
    document.getElementById('btn-roll').addEventListener('click', () => this.rollDice());
    document.getElementById('monopoly-dice').addEventListener('click', () => this.rollDice());
  },

  updateTokenPosition() {
    const token = document.getElementById('player-token-element');
    if (!token) return;

    const board = this.container.querySelector('.monopoly-board');
    const boardRect = board.getBoundingClientRect();
    
    // Get center of target slot
    const slot = document.getElementById(`token-slot-${this.position}`);
    if (slot) {
      const slotRect = slot.getBoundingClientRect();
      const left = slotRect.left - boardRect.left + (slotRect.width / 2) - 12;
      const top = slotRect.top - boardRect.top + (slotRect.height / 2) - 12;
      
      token.style.left = `${left}px`;
      token.style.top = `${top}px`;
    }
  },

  async rollDice() {
    if (this.isMoving) return;
    this.isMoving = true;
    
    const rollBtn = document.getElementById('btn-roll');
    const dice = document.getElementById('monopoly-dice');
    const info = document.getElementById('monopoly-info');
    
    rollBtn.disabled = true;
    dice.classList.add('rolling');
    SoundFX.playDice();
    
    // Animate dice numbers
    let counter = 0;
    const interval = setInterval(() => {
      dice.textContent = Math.floor(Math.random() * 6) + 1;
      counter++;
      if (counter > 8) {
        clearInterval(interval);
        
        const rollResult = Math.floor(Math.random() * 6) + 1;
        dice.textContent = rollResult;
        dice.classList.remove('rolling');
        
        info.textContent = `擲出了 ${rollResult} 點！`;
        
        setTimeout(() => {
          this.moveSteps(rollResult);
        }, 400);
      }
    }, 80);
  },

  async moveSteps(steps) {
    const info = document.getElementById('monopoly-info');
    let currentStep = 0;
    
    const makeStep = () => {
      if (currentStep < steps) {
        this.position = (this.position + 1) % 20;
        
        // Pass Start
        if (this.position === 0) {
          this.laps++;
          this.score += 200;
          document.getElementById('game-score').textContent = this.score;
          document.getElementById('game-timer').textContent = `Laps: ${this.laps} / ${this.maxLaps}`;
          SoundFX.playCoin();
          info.textContent = "通過起點！獲得 200 分！";
        } else {
          SoundFX.playClick();
        }
        
        this.updateTokenPosition();
        currentStep++;
        
        setTimeout(makeStep, 250);
      } else {
        // Stop moving, execute cell action
        this.executeCellAction();
      }
    };
    
    makeStep();
  },

  async executeCellAction() {
    const cell = this.cells[this.position];
    const info = document.getElementById('monopoly-info');
    
    info.textContent = `停留在【${cell.name}】格。`;

    if (cell.type === "start") {
      this.isMoving = false;
      this.checkGameStatus();
    }
    
    else if (cell.type === "question") {
      const q = this.sessionQuestions[this.questionsPoolIndex];
      this.questionsPoolIndex = (this.questionsPoolIndex + 1) % this.sessionQuestions.length;
      this.questionsAsked++;
      
      // Dynamic multiple-choice generation for Q&A format
      const mcQuestion = ArcadeState.getMultipleChoiceQuestion(q);
      
      QuestionModal.show(mcQuestion, 25, (isCorrect) => {
        if (isCorrect) {
          this.questionsCorrect++;
          this.score += 200;
          info.textContent = "回答正確！獲得 200 分！";
        } else {
          this.score = Math.max(0, this.score - 100);
          info.textContent = "回答錯誤！扣除 100 分。";
        }
        document.getElementById('game-score').textContent = this.score;
        this.isMoving = false;
        this.checkGameStatus();
      });
    }
    
    else if (cell.type === "chance") {
      // Chance cards
      const events = [
        { text: "🌟 課堂搶答成功！獲得 150 分！", val: 150 },
        { text: "🚨 忘記帶課本，扣除 80 分。", val: -80 },
        { text: "🎓 代表學校參賽獲獎！獲得 250 分！", val: 250 },
        { text: "🧹 認真打掃衛生，老師獎勵 100 分！", val: 100 },
        { text: "💤 上課打瞌睡，被老師發現扣 120 分。", val: -120 },
        { text: "💧 扶老奶奶過馬路，功德加身，加 100 分！", val: 100 }
      ];
      
      const ev = events[Math.floor(Math.random() * events.length)];
      info.textContent = ev.text;
      
      if (ev.val > 0) {
        SoundFX.playSuccess();
        this.score += ev.val;
      } else {
        SoundFX.playFail();
        this.score = Math.max(0, this.score + ev.val);
      }
      
      document.getElementById('game-score').textContent = this.score;
      
      setTimeout(() => {
        this.isMoving = false;
        this.checkGameStatus();
      }, 2000);
    }
    
    else if (cell.type === "jail") {
      info.textContent = "🔒 參觀監獄。下一回合可以正常移動。";
      SoundFX.playFail();
      
      setTimeout(() => {
        this.isMoving = false;
        this.checkGameStatus();
      }, 1500);
    }
    
    else if (cell.type === "go-to-jail") {
      info.textContent = "🚨 去坐牢！立刻被傳送到監獄，並扣除 150 分！";
      SoundFX.playFail();
      
      setTimeout(() => {
        this.position = 5; // Teleport to jail
        this.score = Math.max(0, this.score - 150);
        document.getElementById('game-score').textContent = this.score;
        this.updateTokenPosition();
        
        setTimeout(() => {
          this.isMoving = false;
          this.checkGameStatus();
        }, 1500);
      }, 1500);
    }
    
    else if (cell.type === "free-parking") {
      info.textContent = "🚗 來到休息站！免費獲得 150 分！";
      SoundFX.playCoin();
      this.score += 150;
      document.getElementById('game-score').textContent = this.score;
      
      setTimeout(() => {
        this.isMoving = false;
        this.checkGameStatus();
      }, 1500);
    }
  },

  checkGameStatus() {
    document.getElementById('game-timer').textContent = `進度: ${this.questionsAsked} / 20 題`;
    if (this.questionsAsked >= 20) {
      // Game over, complete!
      SoundFX.playWin();
      this.endGame();
    } else {
      // Re-enable button
      const rollBtn = document.getElementById('btn-roll');
      if (rollBtn) rollBtn.disabled = false;
    }
  },

  async endGame() {
    this.container.innerHTML = `
      <div class="game-win-overlay">
        <div class="win-title">🏆 挑戰完成！</div>
        <p>你順利完成了 20 題的大富翁挑戰！</p>
        <div class="win-score">SCORE: ${this.score}</div>
        <p style="color:var(--text-muted)">答對題數: ${this.questionsCorrect} / 總回答題數: ${this.questionsAsked}</p>
        <button id="btn-win-exit" class="btn btn-neon-green">退出並登錄成績</button>
      </div>
    `;

    document.getElementById('btn-win-exit').addEventListener('click', async () => {
      SoundFX.playClick();
      const exitBtn = document.getElementById('btn-win-exit');
      exitBtn.disabled = true;
      exitBtn.textContent = "上傳成績中...";
      
      await GAS_API.logScore("知識大富翁", this.score, this.questionsCorrect, this.questionsAsked);
      
      // Go back to lobby
      document.getElementById('game-stage').classList.add('hidden');
      document.getElementById('arcade-lobby').classList.remove('hidden');
      ArcadeState.currentGame = null;
    });
  },

  destroy() {
    this.isMoving = false;
  }
};

// Bind to window so app.js can access it
window.MonopolyGame = MonopolyGame;
