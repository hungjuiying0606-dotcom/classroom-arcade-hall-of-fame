/* ==========================================
   CLASSROOM ARCADE - INEQUALITY ARENA (arena.js)
   ========================================== */

const ArenaGame = {
  container: null,
  score: 0,
  timeLeft: 90,
  timerInterval: null,
  
  mode: null, // 'math' or 'quiz'
  playerHp: 100,
  bossHp: 100,
  bossLevel: 1,
  
  correctCount: 0,
  wrongCount: 0,
  
  currentQuestion: null, // for quiz mode
  currentIneq: null, // for math mode
  
  // Math mode state:
  selectedVal: 0, // boundary value on number line
  selectedDot: 'hollow', // 'hollow' or 'solid'
  selectedDir: 'left', // 'left' or 'right'
  
  bossAvatars: ['👹', '🐉', '👿', '👾', '🧛', '🧙'],
  bossNames: ['數字小鬼', '不等式巨龍', '負號魔王', '未知數怪物', '分數吸血鬼', '變號大魔法師'],

  init() {
    this.container = document.getElementById('game-body');
    this.score = 0;
    this.timeLeft = 90;
    this.playerHp = 100;
    this.bossHp = 100;
    this.bossLevel = 1;
    this.correctCount = 0;
    this.wrongCount = 0;
    
    document.getElementById('game-stage-title').textContent = "世界名人堂對戰場";
    document.getElementById('game-score').textContent = this.score;
    document.getElementById('game-timer').textContent = `時限: 90s`;
    
    this.renderModeSelect();
  },

  renderModeSelect() {
    this.container.innerHTML = `
      <div class="arena-wrapper">
        <div class="arena-mode-select glass-panel animate-scale">
          <h3>⚔️ 世界名人堂對戰場 ⚔️</h3>
          <p style="color: var(--text-muted); margin-bottom: 1.5rem;">請選擇您的挑戰模式：</p>
          <div class="arena-modes">
            <button class="btn btn-neon-blue" id="btn-mode-math">
              <i data-lucide="calculator"></i> 不等式挑戰 (數學數線)
            </button>
            <button class="btn btn-neon-pink" id="btn-mode-quiz">
              <i data-lucide="book-open"></i> 世界名人堂挑戰 (自訂題庫)
            </button>
          </div>
        </div>
      </div>
    `;
    lucide.createIcons();

    document.getElementById('btn-mode-math').addEventListener('click', () => {
      SoundFX.playCoin();
      this.startCombat('math');
    });

    document.getElementById('btn-mode-quiz').addEventListener('click', () => {
      SoundFX.playCoin();
      this.startCombat('quiz');
    });
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
      document.getElementById('game-timer').textContent = `時限: ${this.timeLeft}s`;
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
          <!-- Math controls -->
          <div id="arena-math-controls" class="hidden">
            <div class="arena-question-text" id="arena-ineq-question">載入中...</div>
            <div class="number-line-instructions">
              💡 點擊下方數線設定臨界點，並設定空心/實心與射線方向：
            </div>
            
            <div class="arena-svg-container" id="arena-svg-wrapper"></div>
            
            <div class="number-line-toggles">
              <div class="toggle-group">
                <span class="toggle-label">端點類型：</span>
                <button class="btn btn-sm btn-outline-cyan active" id="btn-dot-hollow">○ 空心 (&lt; 或 &gt;)</button>
                <button class="btn btn-sm btn-outline-cyan" id="btn-dot-solid">● 實心 (≦ 或 ≧)</button>
              </div>
              <div class="toggle-group">
                <span class="toggle-label">射線方向：</span>
                <button class="btn btn-sm btn-outline-magenta active" id="btn-dir-left">← 往左 (較小)</button>
                <button class="btn btn-sm btn-outline-magenta" id="btn-dir-right">往右 (較大) →</button>
              </div>
            </div>
            
            <div class="action-row">
              <button class="btn btn-neon-green" style="padding:0.75rem 2rem; font-size:1rem;" id="btn-arena-submit-math">⚔️ 施展不等式斬！</button>
            </div>
          </div>

          <!-- Quiz controls -->
          <div id="arena-quiz-controls" class="hidden">
            <div class="arena-question-text" id="arena-quiz-question">載入中...</div>
            <div class="arena-quiz-options" id="arena-quiz-options"></div>
          </div>
        </div>
      </div>
    `;

    // Bind math controls toggles
    if (this.mode === 'math') {
      document.getElementById('arena-math-controls').classList.remove('hidden');
      
      const btnHollow = document.getElementById('btn-dot-hollow');
      const btnSolid = document.getElementById('btn-dot-solid');
      const btnLeft = document.getElementById('btn-dir-left');
      const btnRight = document.getElementById('btn-dir-right');

      btnHollow.addEventListener('click', () => {
        SoundFX.playClick();
        this.selectedDot = 'hollow';
        btnHollow.classList.add('active');
        btnSolid.classList.remove('active');
        this.drawNumberLine();
      });

      btnSolid.addEventListener('click', () => {
        SoundFX.playClick();
        this.selectedDot = 'solid';
        btnSolid.classList.add('active');
        btnHollow.classList.remove('active');
        this.drawNumberLine();
      });

      btnLeft.addEventListener('click', () => {
        SoundFX.playClick();
        this.selectedDir = 'left';
        btnLeft.classList.add('active');
        btnRight.classList.remove('active');
        this.drawNumberLine();
      });

      btnRight.addEventListener('click', () => {
        SoundFX.playClick();
        this.selectedDir = 'right';
        btnRight.classList.add('active');
        btnLeft.classList.remove('active');
        this.drawNumberLine();
      });

      document.getElementById('btn-arena-submit-math').addEventListener('click', () => {
        this.submitMathAnswer();
      });
    } else {
      document.getElementById('arena-quiz-controls').classList.remove('hidden');
    }
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

    if (this.mode === 'math') {
      this.generateMathProblem();
    } else {
      this.generateQuizProblem();
    }
  },

  generateMathProblem() {
    // Math Generation logic
    // We want the inequality: ax + b operator c
    // with answer: x operatorVal targetVal
    // where operatorVal is inverted if a < 0.
    
    const operators = ['>', '<', '>=', '<='];
    const selectedOp = operators[Math.floor(Math.random() * operators.length)];
    
    // Choose correct critical value inside [-6, 6]
    const correctVal = Math.floor(Math.random() * 13) - 6; // -6 to 6
    
    // Choose coefficient a from {-3, -2, 2, 3}
    const coeffs = [-3, -2, 2, 3];
    const a = coeffs[Math.floor(Math.random() * coeffs.length)];
    
    // Choose constant b from [-8, 8] excluding 0
    let b = 0;
    while (b === 0) {
      b = Math.floor(Math.random() * 17) - 8;
    }
    
    // Calculate right side constant c
    const c = a * correctVal + b;
    
    // Format question string nicely
    let leftSide = "";
    if (a === 1) leftSide = "x";
    else if (a === -1) leftSide = "-x";
    else leftSide = `${a}x`;
    
    if (b > 0) leftSide += ` + ${b}`;
    else leftSide += ` - ${Math.abs(b)}`;
    
    // Map operator symbol to nice HTML
    let opSymbol = "";
    if (selectedOp === '>') opSymbol = "＞";
    else if (selectedOp === '<') opSymbol = "＜";
    else if (selectedOp === '>=') opSymbol = "≧";
    else if (selectedOp === '<=') opSymbol = "≦";
    
    const problemStr = `請解不等式： ${leftSide} ${opSymbol} ${c}`;
    document.getElementById('arena-ineq-question').textContent = problemStr;
    
    // Compute correct mathematical boundaries for checking later:
    // If a < 0, direction is flipped
    let correctDir = "";
    let correctDot = "";
    
    if (selectedOp === '>' || selectedOp === '>=') {
      correctDir = a > 0 ? 'right' : 'left';
    } else {
      correctDir = a > 0 ? 'left' : 'right';
    }
    
    if (selectedOp === '>=' || selectedOp === '<=') {
      correctDot = 'solid';
    } else {
      correctDot = 'hollow';
    }
    
    let simplifiedOpSymbol = opSymbol;
    if (a < 0) {
      if (selectedOp === '>') simplifiedOpSymbol = "＜";
      else if (selectedOp === '<') simplifiedOpSymbol = "＞";
      else if (selectedOp === '>=') simplifiedOpSymbol = "≦";
      else if (selectedOp === '<=') simplifiedOpSymbol = "≧";
    }
    
    this.currentIneq = {
      correctVal: correctVal,
      correctDot: correctDot,
      correctDir: correctDir,
      display: `${leftSide} ${opSymbol} ${c}  ⇒  x ${simplifiedOpSymbol} ${correctVal} (已化簡)`
    };
    
    // Reset inputs
    this.selectedVal = 0;
    // Default toggles matching UI state
    document.getElementById('btn-dot-hollow').classList.add('active');
    document.getElementById('btn-dot-solid').classList.remove('active');
    document.getElementById('btn-dir-left').classList.add('active');
    document.getElementById('btn-dir-right').classList.remove('active');
    
    this.selectedDot = 'hollow';
    this.selectedDir = 'left';
    
    this.drawNumberLine();
  },

  drawNumberLine() {
    const wrapper = document.getElementById('arena-svg-wrapper');
    if (!wrapper) return;

    const width = Math.min(650, wrapper.clientWidth || 550);
    const height = 65;
    
    // Ticks range: -8 to 8
    const minVal = -8;
    const maxVal = 8;
    const span = maxVal - minVal;
    
    const padLeft = width * 0.06;
    const padRight = width * 0.06;
    const graphWidth = width - padLeft - padRight;
    
    const getX = (val) => {
      return padLeft + ((val - minVal) / span) * graphWidth;
    };
    
    // Build ticks HTML
    let ticksHtml = "";
    for (let v = minVal; v <= maxVal; v++) {
      const cx = getX(v);
      ticksHtml += `
        <line x1="${cx}" y1="23" x2="${cx}" y2="33" stroke="var(--text-muted)" stroke-width="1.5"/>
        <text x="${cx}" y="48" fill="var(--text-muted)" font-size="11" font-weight="600" text-anchor="middle" style="user-select:none;">${v}</text>
      `;
    }

    // Selected state geometry
    const dotX = getX(this.selectedVal);
    const arrowStroke = this.selectedDir === 'left' ? 'var(--neon-pink)' : 'var(--neon-blue)';
    const arrowGlow = this.selectedDir === 'left' ? 'var(--neon-pink-glow)' : 'var(--neon-blue-glow)';
    
    let rayLine = "";
    let arrowhead = "";
    
    if (this.selectedDir === 'left') {
      const startX = getX(minVal) - 8;
      rayLine = `<line x1="${startX}" y1="28" x2="${dotX}" y2="28" stroke="${arrowStroke}" stroke-width="3.5" style="filter: drop-shadow(0 0 4px ${arrowGlow})"/>`;
      // left arrow cap
      arrowhead = `<polygon points="${startX},28 ${startX+8},24 ${startX+8},32" fill="${arrowStroke}"/>`;
    } else {
      const startX = getX(maxVal) + 8;
      rayLine = `<line x1="${dotX}" y1="28" x2="${startX}" y2="28" stroke="${arrowStroke}" stroke-width="3.5" style="filter: drop-shadow(0 0 4px ${arrowGlow})"/>`;
      // right arrow cap
      arrowhead = `<polygon points="${startX},28 ${startX-8},24 ${startX-8},32" fill="${arrowStroke}"/>`;
    }

    // Boundary dot
    const dotFill = this.selectedDot === 'solid' ? arrowStroke : 'var(--bg-color)';
    const boundaryDot = `<circle cx="${dotX}" cy="28" r="6.5" fill="${dotFill}" stroke="${arrowStroke}" stroke-width="3" />`;

    // Full SVG Construction
    wrapper.innerHTML = `
      <svg width="${width}" height="${height}" style="overflow:visible; cursor:crosshair;" id="arena-number-line-svg">
        <!-- Main Line -->
        <line x1="${getX(minVal) - 10}" y1="28" x2="${getX(maxVal) + 10}" y2="28" stroke="var(--text-main)" stroke-width="2.5"/>
        
        <!-- Range Ray & Arrowhead -->
        ${rayLine}
        ${arrowhead}
        
        <!-- Tickmarks & labels -->
        ${ticksHtml}
        
        <!-- Boundary Dot -->
        ${boundaryDot}
      </svg>
    `;

    // Click handler to position the dot
    const svgEl = document.getElementById('arena-number-line-svg');
    svgEl.addEventListener('click', (e) => {
      const rect = svgEl.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      
      // Find closest tick value
      let closestVal = minVal;
      let closestDist = Infinity;
      
      for (let v = minVal; v <= maxVal; v++) {
        const tx = getX(v);
        const dist = Math.abs(clickX - tx);
        if (dist < closestDist) {
          closestDist = dist;
          closestVal = v;
        }
      }
      
      // Bound it within valid solving range
      if (closestVal >= -7 && closestVal <= 7) {
        SoundFX.playClick();
        this.selectedVal = closestVal;
        this.drawNumberLine();
      }
    });
  },

  submitMathAnswer() {
    const answer = this.currentIneq;
    const isCorrect = (
      this.selectedVal === answer.correctVal &&
      this.selectedDot === answer.correctDot &&
      this.selectedDir === answer.correctDir
    );

    this.handleCombatResult(isCorrect, answer.display);
  },

  generateQuizProblem() {
    const qPool = ArcadeState.questions;
    const idx = Math.floor(Math.random() * qPool.length);
    const qObj = ArcadeState.getMultipleChoiceQuestion(qPool[idx]);
    
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
      
      setTimeout(() => {
        // Player takes damage
        playerEl.classList.add('fighter-damage');
        this.triggerSlashEffect(playerEl);
        this.showDamageEffect(playerEl, `-${damage} HP`, true);
        this.updateHpUI();
        
        // Show overlay explanation if in math mode
        if (this.mode === 'math') {
          alert(`答錯了！\n解答解析：${feedbackText}`);
        } else if (feedbackText) {
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
