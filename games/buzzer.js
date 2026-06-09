const BuzzerGame = {
  container: null,
  score: 0,
  timeLeft: 60,
  timerInterval: null,
  currentQuestion: null,
  correctCount: 0,
  totalAnswers: 0,
  sessionQuestions: [],
  currentQuestionIndex: 0,
  combo: 0,
  maxCombo: 0,
  questionStartTime: 0,

  init() {
    this.container = document.getElementById('game-body');
    this.score = 0;
    this.sessionQuestions = ArcadeState.getRandomQuestions(20);
    this.currentQuestionIndex = 0;
    this.timeLeft = 60;
    this.correctCount = 0;
    this.totalAnswers = 0;
    this.combo = 0;
    this.maxCombo = 0;
    document.getElementById('game-stage-title').textContent = 'Quick Answer Buzzer';
    document.getElementById('game-score').textContent = this.score;
    document.getElementById('game-timer').textContent = '60s | 0/20';
    this.renderLayout();
    this.startTimer();
    this.nextQuestion();
  },

  renderLayout() {
    this.container.innerHTML = `
      <div style="padding:16px; display:flex; flex-direction:column; height:100%; box-sizing:border-box;">
        <div id="buzzer-question" style="font-size:1.3rem; font-weight:700; color:var(--text-main); text-align:center; margin-bottom:16px; line-height:1.4; min-height:80px;">Question here</div>
        <div id="buzzer-combo" style="text-align:center; font-size:0.9rem; color:var(--neon-gold); margin-bottom:8px;">Combo x1</div>
        <div id="buzzer-options" style="display:flex; flex-direction:column; flex:1; gap:8px;"></div>
      </div>
    `;
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
    if (this.currentQuestionIndex >= 20) {
      this.endGame();
      return;
    }
    const raw = this.sessionQuestions[this.currentQuestionIndex];
    this.currentQuestionIndex++;
    this.currentQuestion = ArcadeState.getMultipleChoiceQuestion(raw);
    this.questionStartTime = Date.now();

    document.getElementById('buzzer-question').textContent = this.currentQuestion.question;

    const comboEl = document.getElementById('buzzer-combo');
    if (this.combo >= 3) comboEl.textContent = '🔥 Combo x3!';
    else if (this.combo === 2) comboEl.textContent = '⚡ Combo x2';
    else if (this.combo === 1) comboEl.textContent = '✨ Combo x1.5';
    else comboEl.textContent = '';

    const colors = [
      'linear-gradient(135deg,#e91e8c,#ff6b6b)',
      'linear-gradient(135deg,#1e90ff,#00d4ff)',
      'linear-gradient(135deg,#00c853,#69f0ae)',
      'linear-gradient(135deg,#ff6f00,#ffd740)'
    ];
    const labels = ['A', 'B', 'C', 'D'];

    const optContainer = document.getElementById('buzzer-options');
    optContainer.innerHTML = '';
    this.currentQuestion.options.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.style.cssText = `
        min-height:80px; width:100%; border:none; border-radius:12px; font-size:1.1rem; font-weight:700;
        color:#fff; cursor:pointer; background:${colors[idx]}; text-align:left;
        padding:12px 16px; display:flex; align-items:center; gap:12px; touch-action:none;
        margin-bottom:8px; box-shadow:0 4px 15px rgba(0,0,0,0.3); transition:transform 0.15s, opacity 0.15s;
      `;
      btn.innerHTML = `<span style="font-size:1.4rem; background:rgba(0,0,0,0.2); border-radius:8px; width:36px; height:36px; display:flex; align-items:center; justify-content:center; flex-shrink:0;">${labels[idx]}</span><span>${opt}</span>`;
      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.handleAnswer(idx, btn);
      });
      optContainer.appendChild(btn);
    });
  },

  handleAnswer(idx, btn) {
    const allBtns = document.querySelectorAll('#buzzer-options button');
    allBtns.forEach(b => { b.style.pointerEvents = 'none'; b.style.opacity = '0.6'; });

    const isCorrect = (idx === this.currentQuestion.answer);
    this.totalAnswers++;

    if (isCorrect) {
      const elapsed = (Date.now() - this.questionStartTime) / 1000;
      const speedBonus = Math.max(0, Math.round(100 * (1 - elapsed / 2)));
      const comboMult = this.combo >= 3 ? 3 : this.combo === 2 ? 2 : this.combo === 1 ? 1.5 : 1;
      const gained = Math.round((100 + speedBonus) * comboMult);
      this.score += gained;
      this.correctCount++;
      this.combo++;
      if (this.combo > this.maxCombo) this.maxCombo = this.combo;

      btn.style.background = 'linear-gradient(135deg,#00c853,#69f0ae)';
      btn.style.opacity = '1';
      btn.innerHTML += ` <span style="margin-left:auto; font-size:0.85rem; background:rgba(0,0,0,0.2); padding:2px 8px; border-radius:6px;">+${gained}pt</span>`;
      SoundFX.playSuccess();
      document.getElementById('game-score').textContent = this.score;

      setTimeout(() => this.nextQuestion(), 900);
    } else {
      btn.style.background = 'linear-gradient(135deg,#b71c1c,#ef5350)';
      btn.style.opacity = '1';
      allBtns[this.currentQuestion.answer].style.background = 'linear-gradient(135deg,#00c853,#69f0ae)';
      allBtns[this.currentQuestion.answer].style.opacity = '1';
      this.score = Math.max(0, this.score - 30);
      this.combo = 0;
      SoundFX.playFail();
      document.getElementById('game-score').textContent = this.score;

      setTimeout(() => this.nextQuestion(), 1200);
    }
  },

  endGame() {
    this.destroy();
    SoundFX.playWin();
    const finalScore = this.score;
    this.container.innerHTML = `
      <div class="game-win-overlay">
        <div class="win-title">Buzzer Game Over!</div>
        <div class="win-score">SCORE: ${finalScore}</div>
        <p style="color:var(--text-muted)">Correct: ${this.correctCount} / ${this.totalAnswers}</p>
        <button id="btn-win-exit" class="btn btn-neon-gold" style="padding:0.75rem 2rem;">Exit and Save Score</button>
      </div>
    `;
    document.getElementById('btn-win-exit').addEventListener('pointerdown', async (e) => {
      e.preventDefault();
      SoundFX.playClick();
      const exitBtn = document.getElementById('btn-win-exit');
      exitBtn.disabled = true;
      exitBtn.textContent = 'Uploading...';
      await GAS_API.logScore('quick answer buzzer', finalScore, this.correctCount, this.totalAnswers);
      document.getElementById('game-stage').classList.add('hidden');
      document.getElementById('arcade-lobby').classList.remove('hidden');
      ArcadeState.currentGame = null;
    });
  },

  destroy() {
    clearInterval(this.timerInterval);
  }
};

window.BuzzerGame = BuzzerGame;
