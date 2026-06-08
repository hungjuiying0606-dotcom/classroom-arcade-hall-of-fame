/* ==========================================
   CLASSROOM ARCADE - TREASURE HUNT GAME (treasure.js)
   ========================================== */

const TreasureGame = {
  container: null,
  score: 100,
  health: 3, // Lives
  playerPos: { r: 0, c: 0 },
  chestPos: { r: 4, c: 4 },
  gridSize: 5,
  gridData: [], // 2D array of cells { r, c, type: 'start'|'path'|'fog'|'blocked'|'chest', content: 'gold'|'trap'|'empty' }
  questionsAnswered: 0,
  questionsCorrect: 0,

  init() {
    this.container = document.getElementById('game-body');
    this.score = 100;
    this.sessionQuestions = ArcadeState.getRandomQuestions(30);
    this.questionsPoolIndex = 0;
    this.health = 3;
    this.playerPos = { r: 0, c: 0 };
    this.questionsAnswered = 0;
    this.questionsCorrect = 0;
    
    document.getElementById('game-stage-title').textContent = "秘境尋寶記";
    document.getElementById('game-score').textContent = this.score;
    this.updateStatsUI();

    this.generateMap();
    this.renderMap();
  },

  updateStatsUI() {
    let hearts = "";
    for (let i = 0; i < 3; i++) {
      hearts += i < this.health ? "❤️" : "🖤";
    }
    document.getElementById('game-timer').textContent = `生命: ${hearts} | 進度: ${this.questionsAnswered}/10 題`;
  },

  generateMap() {
    this.gridData = [];
    
    // Define obstacle coordinates (hardcoded for a neat maze-like layout)
    // 5x5 grid has obstacles that allow at least one path from (0,0) to (4,4)
    const obstacles = [
      { r: 0, c: 2 },
      { r: 1, c: 4 },
      { r: 2, c: 1 },
      { r: 3, c: 3 },
      { r: 4, c: 1 }
    ];

    for (let r = 0; r < this.gridSize; r++) {
      const row = [];
      for (let c = 0; c < this.gridSize; c++) {
        let type = 'foggy';
        let content = 'empty';

        // Check if start or chest
        if (r === this.playerPos.r && c === this.playerPos.c) {
          type = 'path'; // start is already cleared
        } else if (r === this.chestPos.r && c === this.chestPos.c) {
          type = 'chest';
        } else if (obstacles.some(o => o.r === r && o.c === c)) {
          type = 'blocked';
        } else {
          // Add random items in foggy tiles
          const rand = Math.random();
          if (rand < 0.2) {
            content = 'gold';
          } else if (rand < 0.35) {
            content = 'trap';
          }
        }

        row.push({ r, c, type, content });
      }
      this.gridData.push(row);
    }
  },

  renderMap() {
    this.container.innerHTML = `
      <div class="treasure-wrapper">
        <p style="text-align:center; font-size:0.95rem; color:var(--text-muted)">💡 點擊玩家 🤠 四周的霧氣 ❓ 答題開路，尋找寶箱 🎁</p>
        <div class="treasure-map">
          <!-- 25 tiles injected here -->
        </div>
      </div>
    `;

    const mapEl = this.container.querySelector('.treasure-map');
    
    for (let r = 0; r < this.gridSize; r++) {
      for (let c = 0; c < this.gridSize; c++) {
        const cell = this.gridData[r][c];
        const tile = document.createElement('div');
        tile.className = `treasure-tile ${cell.type}`;
        
        // Add player token indicator
        if (r === this.playerPos.r && c === this.playerPos.c) {
          tile.classList.add('current-player');
        }

        // Show contents if cleared path
        if (cell.type === 'chest' && this.questionsAnswered < 10) {
      SoundFX.playFail();
      alert(`🎁 這是終極寶箱！但是它被魔法鎖住了。\n您目前才回答了 ${this.questionsAnswered} 題，至少需要探索迷霧並回答 10 題才能開啟它！請先去其他格子答題。`);
      return;
    }
    if (cell.type === 'path') {
          if (cell.content === 'gold') tile.textContent = '🪙';
          else if (cell.content === 'trap') tile.textContent = '🕸️';
          else if (r !== 0 || c !== 0) tile.textContent = '👣';
        }

        // Click handler for movement
        tile.addEventListener('click', () => this.handleTileClick(cell));

        mapEl.appendChild(tile);
      }
    }
  },

  handleTileClick(cell) {
    // Check if clicked cell is adjacent (taxicab distance = 1)
    const dr = Math.abs(cell.r - this.playerPos.r);
    const dc = Math.abs(cell.c - this.playerPos.c);
    const isAdjacent = (dr + dc === 1);

    if (!isAdjacent) {
      if (cell.r === this.playerPos.r && cell.c === this.playerPos.c) return;
      SoundFX.playFail();
      alert("太遠了！你只能移動到相鄰的格子（上、下、左、右）。");
      return;
    }

    if (cell.type === 'blocked') {
      SoundFX.playFail();
      alert("那是障礙物（礁石/山脈），無法通過！");
      return;
    }

    // If already clear path, move instantly
    if (cell.type === 'chest' && this.questionsAnswered < 10) {
      SoundFX.playFail();
      alert(`🎁 這是終極寶箱！但是它被魔法鎖住了。\n您目前才回答了 ${this.questionsAnswered} 題，至少需要探索迷霧並回答 10 題才能開啟它！請先去其他格子答題。`);
      return;
    }
    if (cell.type === 'path') {
      SoundFX.playClick();
      this.playerPos = { r: cell.r, c: cell.c };
      this.renderMap();
      this.checkWin();
      return;
    }

    // If foggy or chest, trigger question challenge
    const q = this.sessionQuestions[this.questionsPoolIndex];
    this.questionsPoolIndex = (this.questionsPoolIndex + 1) % this.sessionQuestions.length;
    this.questionsAnswered++;

    // Convert simplified Q&A format to 4-choice format
    const mcQuestion = ArcadeState.getMultipleChoiceQuestion(q);

    QuestionModal.show(mcQuestion, 25, (isCorrect) => {
      if (isCorrect) {
        this.questionsCorrect++;
        this.score += 100;
        document.getElementById('game-score').textContent = this.score;

        // Clear fog
        if (cell.type === 'foggy') {
          cell.type = 'path';
          
          // Trigger cell item
          if (cell.content === 'gold') {
            this.score += 150;
            document.getElementById('game-score').textContent = this.score;
            SoundFX.playCoin();
            setTimeout(() => alert("💰 發現隱藏寶藏！額外獲得 150 分！"), 300);
          } else if (cell.content === 'trap') {
            this.score = Math.max(0, this.score - 50);
            document.getElementById('game-score').textContent = this.score;
            SoundFX.playFail();
            setTimeout(() => alert("🕸️ 踩到捕獸夾陷阱！扣除 50 分。"), 300);
          } else {
            SoundFX.playSuccess();
          }
        } else if (cell.type === 'chest') {
          SoundFX.playSuccess();
        }

        // Move player
        this.playerPos = { r: cell.r, c: cell.c };
        this.renderMap();
        this.checkWin();

      } else {
        // Answer wrong
        this.health--;
        this.score = Math.max(0, this.score - 40);
        document.getElementById('game-score').textContent = this.score;
        this.updateStatsUI();

        if (this.health <= 0) {
          this.endGame(false);
        }
      }
    });
  },

  checkWin() {
    if (this.playerPos.r === this.chestPos.r && this.playerPos.c === this.chestPos.c) {
      // Reached chest!
      this.endGame(true);
    }
  },

  async endGame(isWin) {
    let finalScore = this.score;
    let bonus = 0;
    
    if (isWin) {
      SoundFX.playWin();
      bonus = 400 + this.health * 100; // Heart bonus
      finalScore += bonus;
    } else {
      SoundFX.playFail();
    }

    this.container.innerHTML = `
      <div class="game-win-overlay">
        <div class="win-title">${isWin ? "🎁 尋得大寶藏！" : "💀 💀 挑戰結束"}</div>
        <p>${isWin ? "你越過重重迷霧與考驗，成功開啟了終極寶箱！" : "你的生命值已耗盡，迷失在了荒島迷霧中..."}</p>
        <div class="win-score">SCORE: ${finalScore}</div>
        <div style="font-size:0.9rem; margin-top:-0.5rem; color:var(--text-muted)">
          ${isWin ? `探險積分: ${this.score} + 生存加成: ${bonus}` : `探險積分: ${this.score}`}
        </div>
        <p style="color:var(--text-muted)">答對題數: ${this.questionsCorrect} 題 / 答題次數: ${this.questionsAnswered} 次</p>
        <button id="btn-win-exit" class="btn btn-neon-green">退出並登錄成績</button>
      </div>
    `;

    document.getElementById('btn-win-exit').addEventListener('click', async () => {
      SoundFX.playClick();
      const exitBtn = document.getElementById('btn-win-exit');
      exitBtn.disabled = true;
      exitBtn.textContent = "上傳成績中...";
      
      await GAS_API.logScore("秘境尋寶記", finalScore, this.questionsCorrect, this.questionsAnswered);
      
      // Go back to lobby
      document.getElementById('game-stage').classList.add('hidden');
      document.getElementById('arcade-lobby').classList.remove('hidden');
      ArcadeState.currentGame = null;
    });
  },

  destroy() {
    // No timers to clean
  }
};

window.TreasureGame = TreasureGame;
