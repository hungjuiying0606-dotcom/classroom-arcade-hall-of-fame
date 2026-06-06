/* ==========================================
   CLASSROOM ARCADE - INEQUALITY ARENA (arena.js)
   ========================================== */

const ArenaGame = {
  container: null,
  score: 0,
  timeLeft: 90,
  timerInterval: null,
  
  mode: 'quiz',
  playerHp: 100,
  bossHp: 100,
  bossLevel: 1,
  
  correctCount: 0,
  wrongCount: 0,
  
  currentQuestion: null,
  
  bossAvatars: ['👹', '🐉', '👿', '👾', '🧛', '🧙'],
  bossNames: ['數字小鬼', '不等式巨龍', '負號魔王', '未知數怪物', '分數吸血鬼', '變號大魔法師'],

  init() {
    this.container = document.getElementById('game-body');
    this.score = 0;
    this.sessionQuestions = ArcadeState.getRandomQuestions(20);
    this.currentQuestionIndex = 0;
    this.timeLeft = 90;
    this.playerHp = 100;
    this.bossHp = 100;
    this.bossLevel = 1;
    this.correctCount = 0;
    this.wrongCount = 0;
    
    document.getElementById('game-stage-title').textContent = "世界名人堂對戰場";
    document.getElementById('game-score').textContent = this.score;
    document.getElementById('game-timer').textContent = `進度: 0/20 | 時限: 90s`;
    
    this.startCombat('quiz');
  },

  startCombat(mode) {
    this.mode = mode;
    this.timeLeft = 90;
    this.playerHp = 100;
    this.bossHp = 100;
    this.bossLevel = 1;
    
    this.renderBattlefield();
    this.updateHpUI();
    this.nextRound();
    this.startTimer();
  },

  startTimer() {
    clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.timeLeft--;
      document.getElementById('game-timer').textContent = `進度: ${this.correctCount + this.wrongCount}/20 | 時限: ${this.timeLeft}s`;
      if (this.timeLeft <= 0) {
        clearInterval(this.timerInterval);
        this.endGame(false, "時間到！");
      }
    }, 1000);
  },

  renderBattlefield() {
    this.container.innerHTML = `
      <div class="arena-wrapper">
        <!-- Battlefield View -->
        <div class="arena-battlefield">
          <!-- Player -->
          <div class="arena-fighter player-side" id="arena-player">
            <div class="fighter-name">${ArcadeState.student.name || "PLAYER"}</div>
            <div class="fighter-avatar" id="player-avatar-el">🤠</div>
            <div class="hp-container">
              <div class="hp-bar-fill" id="player-hp-fill"></div>
              <div class="hp-text" id="player-hp-text">100 / 100 HP</div>
            </div>
            <div class="effect-layer" id="player-effect"></div>
          </div>
          
          <div class="arena-vs">VS</div>
          
          <!-- Boss -->
          <div class="arena-fighter enemy-side" id="arena-enemy">
            <div class="fighter-name" id="boss-name-el">魔王</div>
            <div class="fighter-avatar" id="boss-avatar-el">👹</div>
            <div class="hp-container">
              <div class="hp-bar-fill enemy" id="boss-hp-fill"></div>
              <div class="hp-text" id="boss-hp-text">100 / 100 HP</div>
            </div>
            <div class="effect-layer" id="boss-effect"></div>
          </div>
        </div>

        <!-- Controls panel -->
        <div class="arena-input-panel glass-panel">
          <!-- Quiz controls -->
          <div id="arena-quiz-controls">
            <div class="arena-question-text" id="arena-quiz-question">載入中...</div>
            <div class="arena-quiz-options" id="arena-quiz-options"></div>
          </div>
        </div>
      </div>
    `;
  },

  updateHpUI() {
    document.getElementById('player-hp-fill').style.width = `${this.playerHp}%`;
    document.getElementById('player-hp-text').textContent = `${this.playerHp} / 100 HP`;
    
    document.getElementById('boss-hp-fill').style.width = `${this.bossHp}%`;
    document.getElementById('boss-hp-text').textContent = `${this.bossHp} / 100 HP`;
    
    const avatarIdx = Math.min(this.bossLevel - 1, this.bossAvatars.length - 1);
    document.getElementById('boss-avatar-el').textContent = this.bossHp > 0 ? this.bossAvatars[avatarIdx] : '💀';
    document.getElementById('boss-name-el').textContent = `${this.bossNames[avatarIdx]} (Lv.${this.bossLevel})`;
    
    document.getElementById('player-avatar-el').textContent = this.playerHp > 0 ? '🤠' : '💀';
  },

  nextRound() {
    if (this.playerHp <= 0) {
      this.endGame(false, "你被擊倒了！");
      return;
    }
    
    if (this.bossHp <= 0) {
      // Defeated boss!
      this.score += 500 * this.bossLevel;
      document.getElementById('game-score').textContent = this.score;
      SoundFX.playWin();
      
      this.showDamageEffect(document.getElementById('arena-enemy'), `Defeated!`, false, true);
      
      // Spawn next level boss
      this.bossLevel++;
      if (this.bossLevel > 6) {
        clearInterval(this.timerInterval);
        this.endGame(true, "你擊敗了最終魔王！");
        return;
      }
      
      this.bossHp = 100;
      this.updateHpUI();
      
      setTimeout(() => {
        this.nextRound();
      }, 1500);
      return;
    }

    this.generateQuizProblem();
  },

  generateQuizProblem() {
    if (this.correctCount + this.wrongCount >= 20) {
      this.endGame(this.playerHp > 0, this.playerHp > 0 ? "你擊敗了魔王！" : "你被擊倒了！");
      return;
    }
    const rawQuestion = this.sessionQuestions[this.correctCount + this.wrongCount];
    const qObj = ArcadeState.getMultipleChoiceQuestion(rawQuestion);
    
    this.currentQuestion = qObj;
    
    document.getElementById('arena-quiz-question').textContent = qObj.question;
    const optionsContainer = document.getElementById('arena-quiz-options');
    optionsContainer.innerHTML = '';
    
    // Choose move names styled after RPG skills
    const movePrefixes = [
      'A: 火焰斬', 'B: 冰凍擊', 'C: 雷霆破', 'D: 旋風斬',
      'A: 聖光術', 'B: 暗影箭', 'C: 地烈崩', 'D: 流星雨'
    ];
    
    const moves = qObj.options;
    moves.forEach((opt, index) => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      
      let letter = String.fromCharCode(65 + index);
      let skillName = movePrefixes[index] || `${letter}: 物理攻擊`;
      
      btn.innerHTML = `
        <span class="option-letter">${letter}</span>
        <div style="text-align:left; display:flex; flex-direction:column; gap:2px;">
          <span style="font-size:0.65rem; text-transform:uppercase; color:var(--text-muted); font-weight:700">${skillName}</span>
          <span class="option-content" style="font-size:0.85rem">${opt}</span>
        </div>
      `;
      
      btn.addEventListener('click', () => {
        // Disable choices
        document.querySelectorAll('.arena-quiz-options .option-btn').forEach(b => b.disabled = true);
        const correct = (index === qObj.answer);
        
        if (correct) {
          btn.classList.add('correct');
        } else {
          btn.classList.add('wrong');
          // Highlight correct answer
          document.querySelectorAll('.arena-quiz-options .option-btn')[qObj.answer].classList.add('correct');
        }
        
        setTimeout(() => {
          this.handleCombatResult(correct, qObj.explanation);
        }, 600);
      });
      
      optionsContainer.appendChild(btn);
    });
  },

  handleCombatResult(isCorrect, feedbackText) {
    const playerEl = document.getElementById('arena-player');
    const enemyEl = document.getElementById('arena-enemy');
    
    if (isCorrect) {
      this.correctCount++;
      // Player attacks
      playerEl.classList.add('fighter-attack-right');
      SoundFX.playSuccess();
      
      // Calculate damage based on Level
      const damage = Math.ceil(20 + Math.random() * 15 + (this.bossLevel * 5));
      this.bossHp = Math.max(0, this.bossHp - damage);
      this.score += damage * 5;
      document.getElementById('game-score').textContent = this.score;
      document.getElementById('game-timer').textContent = `進度: ${this.correctCount + this.wrongCount}/20 | 時限: ${this.timeLeft}s`;
      
      setTimeout(() => {
        // Boss takes damage
        enemyEl.classList.add('fighter-damage');
        this.triggerSlashEffect(enemyEl);
        this.showDamageEffect(enemyEl, `-${damage} HP`, false);
        this.updateHpUI();
        
        // Clear classes after animation
        setTimeout(() => {
          playerEl.classList.remove('fighter-attack-right');
          enemyEl.classList.remove('fighter-damage');
          this.nextRound();
        }, 500);
      }, 350);
      
    } else {
      this.wrongCount++;
      // Boss attacks
      enemyEl.classList.add('fighter-attack-left');
      SoundFX.playFail();
      
      const damage = Math.ceil(15 + Math.random() * 10);
      this.playerHp = Math.max(0, this.playerHp - damage);
      this.score = Math.max(0, this.score - 40);
      document.getElementById('game-score').textContent = this.score;
      document.getElementById('game-timer').textContent = `進度: ${this.correctCount + this.wrongCount}/20 | 時限: ${this.timeLeft}s`;
      
      setTimeout(() => {
        // Player takes damage
        playerEl.classList.add('fighter-damage');
        this.triggerSlashEffect(playerEl);
        this.showDamageEffect(playerEl, `-${damage} HP`, true);
        this.updateHpUI();
        
        if (feedbackText) {
          alert(`答錯了！\n解析：${feedbackText}`);
        }
        
        setTimeout(() => {
          enemyEl.classList.remove('fighter-attack-left');
          playerEl.classList.remove('fighter-damage');
          this.nextRound();
        }, 500);
      }, 350);
    }
  },

  triggerSlashEffect(targetEl) {
    const effectOverlay = targetEl.querySelector('.effect-layer');
    if (!effectOverlay) return;
    
    effectOverlay.innerHTML = '<div class="slash-effect"></div>';
    setTimeout(() => {
      effectOverlay.innerHTML = '';
    }, 400);
  },

  showDamageEffect(targetEl, text, isPlayer, isHeal = false) {
    const rect = targetEl.getBoundingClientRect();
    const wrapper = this.container.querySelector('.arena-wrapper');
    const wrapperRect = wrapper.getBoundingClientRect();
    
    const floatingText = document.createElement('div');
    floatingText.className = `arena-damage-text ${isHeal ? 'heal' : ''}`;
    floatingText.textContent = text;
    
    // Position relative to the game container
    const xOffset = isPlayer ? wrapperRect.width * 0.2 : wrapperRect.width * 0.75;
    floatingText.style.left = `${xOffset}px`;
    floatingText.style.top = `35%`;
    
    wrapper.appendChild(floatingText);
    
    setTimeout(() => {
      floatingText.remove();
    }, 800);
  },

  endGame(isWin, winReason) {
    this.destroy();
    SoundFX.playWin();

    let finalScore = this.score;
    let timeBonus = 0;
    
    if (isWin) {
      timeBonus = this.timeLeft * 15;
      finalScore += timeBonus;
    }
    
    const totalTries = this.correctCount + this.wrongCount;
    const accuracy = totalTries > 0 ? Math.round((this.correctCount / totalTries) * 100) : 0;
    
    this.container.innerHTML = `
      <div class="game-win-overlay">
        <div class="win-title">${isWin ? "🎉 恭喜通關！" : "💀 戰敗結束"}</div>
        <p style="font-size:1.1rem; color:var(--text-main)">${winReason}</p>
        <div class="win-score">SCORE: ${finalScore}</div>
        <div style="font-size:0.9rem; margin-top:-0.5rem; color:var(--text-muted)">
          ${isWin ? `對戰得分: ${this.score} + 時間加成: ${timeBonus} (${this.timeLeft}s x 15)` : `對戰得分: ${this.score}`}
        </div>
        <p style="color:var(--text-muted); font-size:0.95rem;">
          挑戰魔王數: Lv.${this.bossLevel} | 答對次數: ${this.correctCount} / 答錯次數: ${this.wrongCount} (精準度: ${accuracy}%)
        </p>
        <button id="btn-win-exit" class="btn btn-neon-gold" style="padding:0.75rem 2rem;">退出並登錄成績</button>
      </div>
    `;

    document.getElementById('btn-win-exit').addEventListener('click', async () => {
      SoundFX.playClick();
      const exitBtn = document.getElementById('btn-win-exit');
      exitBtn.disabled = true;
      exitBtn.textContent = "上傳成績中...";

      await GAS_API.logScore("世界名人堂對戰場", finalScore, this.correctCount, totalTries);

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

window.ArenaGame = ArenaGame;
