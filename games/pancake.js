/* ==========================================
   CLASSROOM ARCADE - PANCAKE STACK QUIZ (pancake.js)
   ========================================== */

const PancakeGame = {
  container: null,
  score: 0,
  timeLeft: 90,
  timerInterval: null,
  currentQuestion: null,
  correctCount: 0,
  totalAnswers: 0,
  sessionQuestions: [],
  currentQuestionIndex: 0,
  stackHeight: 0,
  maxStack: 10,

  pancakeColors: [
    '#8B4513', '#A0522D', '#D2691E', '#CD853F',
    '#DAA520', '#F4A460', '#DEB887', '#C8A050',
    '#B8860B', '#D2A679'
  ],

  init() {
    this.container = document.getElementById('game-body');
    this.score = 0;
    this.sessionQuestions = ArcadeState.getRandomQuestions(20);
    this.currentQuestionIndex = 0;
    this.timeLeft = 90;
    this.correctCount = 0;
    this.totalAnswers = 0;
    this.stackHeight = 0;

    document.getElementById('game-stage-title').textContent = '答題煎餅疊疊樂';
    document.getElementById('game-score').textContent = this.score;
    document.getElementById('game-timer').textContent = '90s | 0/20';

    this.renderLayout();
    this.startTimer();
    this.nextQuestion();
  },

  renderLayout() {
    this.container.innerHTML = `
      <div style="padding:12px 16px; display:flex; flex-direction:column; align-items:center; height:100%; box-sizing:border-box; gap:10px;">
        <div style="background:rgba(255,255,255,0.05); border-radius:14px; padding:12px 16px; width:100%; border:1px solid rgba(255,255,255,0.1); box-sizing:border-box;">
          <div id="pancake-progress" style="font-size:0.75rem; color:var(--text-muted); margin-bottom:6px; text-transform:uppercase; letter-spacing:1px; text-align:center;">Q 0/20 | 疊了 0/10 片</div>
          <h3 id="pancake-question" style="font-size:1.1rem; font-weight:700; color:var(--text-main); margin:0; min-height:54px; display:flex; align-items:center; justify-content:center; line-height:1.4; text-align:center;"></h3>
        </div>

        <div style="display:flex; align-items:flex-end; gap:20px; flex:1; min-height:0;">
          <!-- Pancake stack visual -->
          <div style="display:flex; flex-direction:column; align-items:center; gap:4px; width:140px; flex-shrink:0;">
            <div style="font-size:0.75rem; color:var(--neon-gold); font-weight:700; margin-bottom:4px;">🍳 ${this.stackHeight}/${this.maxStack}</div>
            <div id="pancake-plate" style="position:relative; width:130px; border-bottom:6px solid #7a5230; border-radius:50%; height:16px; background:linear-gradient(135deg,#5d4037,#795548);"></div>
            <div id="pancake-stack" style="display:flex; flex-direction:column-reverse; align-items:center; gap:2px; min-height:160px; justify-content:flex-start; width:130px; position:relative;"></div>
          </div>

          <!-- Answer buttons -->
          <div id="pancake-options" style="display:flex; flex-direction:column; flex:1; gap:8px; align-self:center;"></div>
        </div>

        <div id="pancake-feedback" style="height:28px; font-size:0.95rem; font-weight:700; text-align:center;"></div>
      </div>
    `;
  },

  startTimer() {
    clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.timeLeft--;
      document.getElementById('game-timer').textContent = `${this.timeLeft}s | ${this.currentQuestionIndex}/20`;
      if (this.timeLeft <= 0) { clearInterval(this.timerInterval); this.endGame(); }
    }, 1000);
  },

  nextQuestion() {
    if (this.currentQuestionIndex >= 20 || this.stackHeight >= this.maxStack) {
      this.endGame();
      return;
    }
    const raw = this.sessionQuestions[this.currentQuestionIndex];
    this.currentQuestionIndex++;
    this.currentQuestion = ArcadeState.getMultipleChoiceQuestion(raw);
    document.getElementById('pancake-question').textContent = this.currentQuestion.question;
    this.updateProgress();
    this.renderOptions();
  },

  updateProgress() {
    const el = document.getElementById('pancake-progress');
    if (el) el.textContent = `Q ${this.currentQuestionIndex}/20 | 疊了 ${this.stackHeight}/${this.maxStack} 片`;
  },

  renderOptions() {
    const colors = [
      'linear-gradient(135deg,#e91e8c,#ff6b6b)',
      'linear-gradient(135deg,#1e90ff,#00d4ff)',
      'linear-gradient(135deg,#00c853,#69f0ae)',
      'linear-gradient(135deg,#ff6f00,#ffd740)'
    ];
    const labels = ['A', 'B', 'C', 'D'];
    const container = document.getElementById('pancake-options');
    if (!container) return;
    container.innerHTML = '';

    this.currentQuestion.options.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.style.cssText = `
        width:100%; min-height:68px; border:none; border-radius:12px; font-size:1rem; font-weight:700;
        color:#fff; cursor:pointer; background:${colors[idx]}; text-align:left;
        padding:8px 14px; display:flex; align-items:center; gap:10px; touch-action:none;
        box-shadow:0 3px 12px rgba(0,0,0,0.3); transition:transform 0.1s; box-sizing:border-box;
      `;
      btn.innerHTML = `<span style="font-size:1.2rem; background:rgba(0,0,0,0.2); border-radius:8px; width:32px; height:32px; display:flex; align-items:center; justify-content:center; flex-shrink:0;">${labels[idx]}</span><span style="flex:1;">${opt}</span>`;
      btn.addEventListener('pointerdown', (e) => { e.preventDefault(); this.handleAnswer(idx, btn); });
      btn.addEventListener('pointerenter', () => { btn.style.transform = 'scale(1.02)'; });
      btn.addEventListener('pointerleave', () => { btn.style.transform = 'scale(1)'; });
      container.appendChild(btn);
    });
  },

  handleAnswer(idx, btn) {
    const allBtns = document.querySelectorAll('#pancake-options button');
    allBtns.forEach(b => { b.style.pointerEvents = 'none'; b.style.opacity = '0.6'; });
    this.totalAnswers++;
    const isCorrect = (idx === this.currentQuestion.answer);
    const feedbackEl = document.getElementById('pancake-feedback');

    if (isCorrect) {
      this.score += 100;
      this.correctCount++;
      this.stackHeight++;
      btn.style.background = 'linear-gradient(135deg,#00c853,#69f0ae)';
      btn.style.opacity = '1';
      feedbackEl.textContent = `✅ 答對了！+100 pts 🥞 又疊一片！`;
      feedbackEl.style.color = '#69f0ae';
      SoundFX.playSuccess();
      document.getElementById('game-score').textContent = this.score;
      this.addPancake();
      this.updateProgress();
      setTimeout(() => { feedbackEl.textContent = ''; this.nextQuestion(); }, 900);
    } else {
      this.score = Math.max(0, this.score - 20);
      // Remove a pancake
      if (this.stackHeight > 0) { this.stackHeight--; this.removePancake(); }
      allBtns[this.currentQuestion.answer].style.background = 'linear-gradient(135deg,#00c853,#69f0ae)';
      allBtns[this.currentQuestion.answer].style.opacity = '1';
      feedbackEl.textContent = `❌ 答錯！倒塌一片...`;
      feedbackEl.style.color = '#ef5350';
      SoundFX.playFail();
      document.getElementById('game-score').textContent = this.score;
      this.shakePancakeStack();
      this.updateProgress();
      setTimeout(() => { feedbackEl.textContent = ''; this.nextQuestion(); }, 1200);
    }
  },

  addPancake() {
    const stack = document.getElementById('pancake-stack');
    if (!stack) return;
    const pancake = document.createElement('div');
    const w = 100 - this.stackHeight * 4;
    const color = this.pancakeColors[(this.stackHeight - 1) % this.pancakeColors.length];
    pancake.className = 'pancake-item';
    pancake.style.cssText = `
      width:${Math.max(50, w)}px; height:18px; border-radius:50%; background:${color};
      border-bottom:3px solid rgba(0,0,0,0.25); transition:all 0.3s;
      animation:pancakeDrop 0.3s ease-out;
      box-shadow: inset 0 -3px 6px rgba(0,0,0,0.2), inset 0 3px 6px rgba(255,255,255,0.1);
    `;
    stack.insertBefore(pancake, stack.firstChild);

    // Inject keyframe if not present
    if (!document.getElementById('pancake-anim-style')) {
      const style = document.createElement('style');
      style.id = 'pancake-anim-style';
      style.textContent = `
        @keyframes pancakeDrop { from { transform: translateY(-20px); opacity:0; } to { transform: translateY(0); opacity:1; } }
        @keyframes pancakeShake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-6px)} 40%{transform:translateX(6px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }
      `;
      document.head.appendChild(style);
    }
  },

  removePancake() {
    const stack = document.getElementById('pancake-stack');
    if (!stack || stack.children.length === 0) return;
    const top = stack.firstElementChild;
    if (top) { top.style.opacity = '0'; top.style.transform = 'translateY(-20px)'; setTimeout(() => top.remove(), 300); }
  },

  shakePancakeStack() {
    const stack = document.getElementById('pancake-stack');
    if (!stack) return;
    stack.style.animation = 'pancakeShake 0.5s ease';
    setTimeout(() => { stack.style.animation = ''; }, 500);
  },

  endGame() {
    this.destroy();
    SoundFX.playWin();
    const finalScore = this.stackHeight >= this.maxStack ? this.score + 500 : this.score;
    const winMsg = this.stackHeight >= this.maxStack ? '🥞 成功疊出 10 片！獲得 +500 完美獎勵！' : `疊了 ${this.stackHeight} 片煎餅！`;
    this.container.innerHTML = `
      <div class="game-win-overlay">
        <div class="win-title">🍳 煎餅挑戰結束！</div>
        <p style="font-size:1.1rem; color:var(--text-main);">${winMsg}</p>
        <div class="win-score">SCORE: ${finalScore}</div>
        <p style="color:var(--text-muted)">答對: ${this.correctCount} / 已答: ${this.totalAnswers}</p>
        <button id="btn-win-exit" class="btn btn-neon-gold" style="padding:0.75rem 2rem; margin-top:1rem;">退出並登錄成績</button>
      </div>
    `;
    document.getElementById('btn-win-exit').addEventListener('pointerdown', async (e) => {
      e.preventDefault();
      SoundFX.playClick();
      const btn = document.getElementById('btn-win-exit');
      btn.disabled = true; btn.textContent = '上傳成績中...';
      await GAS_API.logScore('答題煎餅疊疊樂', finalScore, this.correctCount, this.totalAnswers);
      document.getElementById('game-stage').classList.add('hidden');
      document.getElementById('arcade-lobby').classList.remove('hidden');
      ArcadeState.currentGame = null;
    });
  },

  destroy() {
    clearInterval(this.timerInterval);
  }
};

window.PancakeGame = PancakeGame;
