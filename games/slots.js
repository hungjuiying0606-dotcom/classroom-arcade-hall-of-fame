const SlotsGame = {
  container: null,
  score: 0,
  timeLeft: 90,
  timerInterval: null,
  currentQuestion: null,
  correctCount: 0,
  totalSpins: 0,
  sessionQuestions: [],
  currentQuestionIndex: 0,
  reels: [null, null, null],
  reelIntervals: [null, null, null],
  spinning: false,

  init() {
    this.score = 0;
    this.timeLeft = 90;
    this.correctCount = 0;
    this.totalSpins = 0;
    this.currentQuestionIndex = 0;
    this.spinning = false;
    this.reelIntervals = [null, null, null];

    this.sessionQuestions = ArcadeState.getRandomQuestions(20);
    if (!this.sessionQuestions.length) {
      document.getElementById('game-body').innerHTML = '<p style="color:var(--text-muted);padding:2rem;">No questions available.</p>';
      return;
    }

    document.getElementById('game-stage-title').textContent = '🎰 Slot Machine Quiz';
    document.getElementById('game-score').textContent = '0';
    document.getElementById('game-timer').textContent = '90s';

    document.getElementById('game-body').innerHTML = `<div style="padding:16px;text-align:center;">
  <h3 id="slots-question" style="font-size:1.2rem;color:var(--text-main);margin-bottom:20px;min-height:60px;"></h3>
  <div style="display:flex;justify-content:center;gap:12px;margin-bottom:20px;">
    <div id="reel-0" style="touch-action:none;width:120px;height:80px;border:3px solid var(--neon-gold);border-radius:8px;background:#1a1a2e;display:flex;align-items:center;justify-content:center;font-size:1rem;font-weight:700;color:#fff;overflow:hidden;padding:4px;"></div>
    <div id="reel-1" style="touch-action:none;width:120px;height:80px;border:3px solid var(--neon-pink);border-radius:8px;background:#1a1a2e;display:flex;align-items:center;justify-content:center;font-size:1rem;font-weight:700;color:#fff;overflow:hidden;padding:4px;"></div>
    <div id="reel-2" style="touch-action:none;width:120px;height:80px;border:3px solid var(--neon-blue);border-radius:8px;background:#1a1a2e;display:flex;align-items:center;justify-content:center;font-size:1rem;font-weight:700;color:#fff;overflow:hidden;padding:4px;"></div>
  </div>
  <div id="slots-result" style="touch-action:none;height:40px;font-size:1.1rem;font-weight:700;margin-bottom:12px;"></div>
  <button id="slots-btn" class="btn btn-neon-pink" style="touch-action:none;min-width:200px;min-height:64px;font-size:1.2rem;">STOP</button>
  <p id="slots-progress" style="margin-top:12px;color:var(--text-muted);">Q 0/20</p>
</div>`;

    this.container = document.getElementById('game-body');
    document.getElementById('slots-btn').addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.handleButton();
    });

    this.loadQuestion();
    this.startTimer();
  },

  loadQuestion() {
    if (this.currentQuestionIndex >= this.sessionQuestions.length) {
      this.endGame();
      return;
    }
    const raw = this.sessionQuestions[this.currentQuestionIndex];
    this.currentQuestion = ArcadeState.getMultipleChoiceQuestion(raw);
    document.getElementById('slots-question').textContent = this.currentQuestion.question;
    document.getElementById('slots-progress').textContent = `Q ${this.currentQuestionIndex + 1}/${this.sessionQuestions.length}`;
    document.getElementById('slots-result').textContent = '';
    document.getElementById('slots-btn').textContent = 'STOP';
    document.getElementById('slots-btn').className = 'btn btn-neon-pink';
    this.startSpin();
  },

  startSpin() {
    this.spinning = true;
    const options = this.currentQuestion.options;
    this.reels = [null, null, null];

    for (let i = 0; i < 3; i++) {
      const reelEl = document.getElementById(`reel-${i}`);
      this.reelIntervals[i] = setInterval(() => {
        const idx = Math.floor(Math.random() * options.length);
        reelEl.textContent = options[idx];
      }, 80);
    }
  },

  stopSpin() {
    const options = this.currentQuestion.options;
    const correctAnswer = options[this.currentQuestion.answer];

    for (let i = 0; i < 3; i++) {
      clearInterval(this.reelIntervals[i]);
      this.reelIntervals[i] = null;
      const randomIdx = Math.floor(Math.random() * options.length);
      this.reels[i] = options[randomIdx];
      document.getElementById(`reel-${i}`).textContent = this.reels[i];
    }

    this.spinning = false;
    this.totalSpins++;

    const middleMatch = this.reels[1] === correctAnswer;
    const allMatch = this.reels[0] === correctAnswer && this.reels[1] === correctAnswer && this.reels[2] === correctAnswer;

    document.getElementById('slots-btn').textContent = 'SPIN';
    document.getElementById('slots-btn').className = 'btn btn-neon-green';

    if (allMatch) {
      this.score += 100;
      this.correctCount++;
      SoundFX.playWin();
      document.getElementById('slots-result').textContent = '🎉 JACKPOT! +100 pts';
      document.getElementById('slots-result').style.color = '#FFD700';
    } else if (middleMatch) {
      this.score += 100;
      this.correctCount++;
      SoundFX.playSuccess();
      document.getElementById('slots-result').textContent = '✅ Match! +100 pts';
      document.getElementById('slots-result').style.color = '#00FF00';
    } else {
      this.score = Math.max(0, this.score - 20);
      SoundFX.playFail();
      document.getElementById('slots-result').textContent = `❌ Wrong! -20 pts (Answer: ${correctAnswer})`;
      document.getElementById('slots-result').style.color = '#FF4444';
    }

    document.getElementById('game-score').textContent = this.score;
  },

  handleButton() {
    if (this.spinning) {
      this.stopSpin();
    } else {
      this.currentQuestionIndex++;
      this.loadQuestion();
    }
  },

  startTimer() {
    clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.timeLeft--;
      document.getElementById('game-timer').textContent = `${this.timeLeft}s`;
      if (this.timeLeft <= 0) {
        this.endGame();
      }
    }, 1000);
  },

  endGame() {
    clearInterval(this.timerInterval);
    for (let i = 0; i < 3; i++) {
      clearInterval(this.reelIntervals[i]);
    }
    this.spinning = false;
    SoundFX.playCoin();

    const body = document.getElementById('game-body');
    body.innerHTML = `<div class="game-win-overlay">
  <div class="win-title">🎰 Slot Machine Quiz</div>
  <div class="win-score">SCORE: ${this.score}</div>
  <p style="color:var(--text-muted)">Correct: ${this.correctCount} / ${this.totalSpins}</p>
  <button id="btn-win-exit" class="btn btn-neon-gold" style="padding:0.75rem 2rem;touch-action:none;">Exit and Save Score</button>
</div>`;

    document.getElementById('btn-win-exit').addEventListener('pointerdown', (e) => {
      e.preventDefault();
      GAS_API.logScore('slot machine quiz', this.score, this.correctCount, this.totalSpins);
      document.getElementById('game-stage').classList.add('hidden');
      document.getElementById('arcade-lobby').classList.remove('hidden');
      ArcadeState.currentGame = null;
    });
  },

  destroy() {
    clearInterval(this.timerInterval);
    for (let i = 0; i < 3; i++) {
      clearInterval(this.reelIntervals[i]);
    }
    this.spinning = false;
  },
};
window.SlotsGame = SlotsGame;
