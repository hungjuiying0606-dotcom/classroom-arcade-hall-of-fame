/* ==========================================
   CLASSROOM ARCADE - MATCH-UP GAME (match.js)
   ========================================== */

const MatchGame = {
  container: null,
  score: 0,
  selectedCard: null,
  timerInterval: null,
  timeLeft: 60,
  pairsCount: 6, // 12 cards total
  matchedPairs: 0,
  correctCount: 0,
  wrongCount: 0,
  cardsData: [],

  init() {
    this.container = document.getElementById('game-body');
    this.score = 0;
    this.selectedCard = null;
    this.timeLeft = 120;
    this.matchedPairs = 0;
    this.correctCount = 0;
    this.wrongCount = 0;
    this.cardsData = [];
    this.round = 1;
    this.pairsCount = 10;
    this.sessionQuestions = ArcadeState.getRandomQuestions(20);

    document.getElementById('game-stage-title').textContent = "知識連連看";
    document.getElementById('game-score').textContent = this.score;
    document.getElementById('game-timer').textContent = "進度: 關卡 1/2 | 時間: 120s";

    this.startNewGame();
  },

  startNewGame() {
    const selectedQuestions = this.sessionQuestions.slice((this.round - 1) * 10, this.round * 10);

    // Generate cards (1 question card + 1 answer card per question)
    const cards = [];
    selectedQuestions.forEach((q, index) => {
      // Find correct answer text
      let answerText = "無解";
      if (q.options && Array.isArray(q.options) && typeof q.answer === 'number' && q.options[q.answer] !== undefined) {
        answerText = q.options[q.answer];
      } else if (q.answer !== undefined && q.answer !== null) {
        answerText = String(q.answer);
      }
      
      // Question card
      cards.push({
        id: `q-${index}`,
        pairId: index,
        type: 'question',
        text: q.question.length > 30 ? q.question.substring(0, 27) + "..." : q.question,
        fullText: q.question
      });

      // Answer card
      cards.push({
        id: `a-${index}`,
        pairId: index,
        type: 'answer',
        text: answerText.length > 30 ? answerText.substring(0, 27) + "..." : answerText,
        fullText: answerText
      });
    });

    // Shuffle cards
    this.cardsData = this.shuffleArray(cards);
    this.pairsCount = selectedQuestions.length;

    this.renderGrid();
    
    // Start countdown timer
    if (this.round === 1) {
      clearInterval(this.timerInterval);
      this.timerInterval = setInterval(() => {
        this.timeLeft--;
        document.getElementById('game-timer').textContent = `進度: 關卡 ${this.round}/2 | 時間: ${this.timeLeft}s`;
        
        if (this.timeLeft <= 0) {
          clearInterval(this.timerInterval);
          this.endGame(false);
        }
      }, 1000);
    } else {
      document.getElementById('game-timer').textContent = `進度: 關卡 ${this.round}/2 | 時間: ${this.timeLeft}s`;
    }
  },

  shuffleArray(arr) {
    const newArr = [...arr];
    for (let i = newArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
  },

  renderGrid() {
    this.container.innerHTML = `
      <div class="match-grid-wrapper">
        <p style="text-align:center; font-size:0.9rem; color:var(--text-muted)">💡 點擊「題目卡」與對應的「答案卡」進行配對！</p>
        <div class="match-grid">
          <!-- Cards injected here -->
        </div>
      </div>
    `;

    const grid = this.container.querySelector('.match-grid');
    
    this.cardsData.forEach(card => {
      const cardEl = document.createElement('div');
      cardEl.className = `match-card card-${card.type}`;
      cardEl.dataset.id = card.id;
      cardEl.textContent = card.text;
      cardEl.title = card.fullText; // Show full text on hover
      
      cardEl.addEventListener('click', () => this.handleCardClick(card, cardEl));
      
      grid.appendChild(cardEl);
    });
  },

  handleCardClick(card, cardEl) {
    if (cardEl.classList.contains('matched') || cardEl.classList.contains('wrong')) return;
    
    SoundFX.playClick();

    // If no card is selected
    if (!this.selectedCard) {
      this.selectedCard = { card, el: cardEl };
      cardEl.classList.add('selected');
      return;
    }

    const first = this.selectedCard;
    
    // If clicking the same card, deselect
    if (first.card.id === card.id) {
      first.el.classList.remove('selected');
      this.selectedCard = null;
      return;
    }

    // Checking match
    if (first.card.pairId === card.pairId && first.card.type !== card.type) {
      // MATCH SUCCESS!
      first.el.classList.remove('selected');
      first.el.classList.add('matched');
      cardEl.classList.add('matched');
      
      this.score += 100;
      this.matchedPairs++;
      this.correctCount++;
      document.getElementById('game-score').textContent = this.score;
      SoundFX.playCoin();
      
      this.selectedCard = null;

      // Check if all matched
      if (this.matchedPairs >= this.pairsCount) {
        if (this.round < 2) {
          this.round++;
          this.matchedPairs = 0;
          setTimeout(() => {
            alert("第一關配對完成！即將進入第二關（另外 10 題）");
            this.startNewGame();
          }, 500);
        } else {
          clearInterval(this.timerInterval);
          setTimeout(() => {
            this.endGame(true);
          }, 500);
        }
      }
    } else {
      // MATCH FAIL!
      first.el.classList.remove('selected');
      first.el.classList.add('wrong');
      cardEl.classList.add('wrong');
      
      this.score = Math.max(0, this.score - 20);
      this.wrongCount++;
      document.getElementById('game-score').textContent = this.score;
      SoundFX.playFail();
      
      this.selectedCard = null;
      
      setTimeout(() => {
        first.el.classList.remove('wrong');
        cardEl.classList.remove('wrong');
      }, 500);
    }
  },

  async endGame(isWin) {
    
    if (isWin) {
      SoundFX.playWin();
    }
    
    this.container.innerHTML = `
      <div class="game-win-overlay">
        <div class="win-title">${isWin ? "🎉 挑戰成功！" : "⏰ 時間到！"}</div>
        <p>${isWin ? `你用最快的速度消滅了所有卡牌！` : "別灰心，下次再試試看吧！"}</p>
        <div class="win-score">SCORE: ${this.score}</div>
        <p style="color:var(--text-muted)">配對成功: ${this.matchedPairs} 對 / 錯誤嘗試: ${this.wrongCount} 次</p>
        <button id="btn-win-exit" class="btn btn-neon-green">退出並登錄成績</button>
      </div>
    `;

    document.getElementById('btn-win-exit').addEventListener('click', async () => {
      SoundFX.playClick();
      const exitBtn = document.getElementById('btn-win-exit');
      exitBtn.disabled = true;
      exitBtn.textContent = "上傳成績中...";
      
      await GAS_API.logScore("知識連連看", finalScore, this.correctCount, this.correctCount + this.wrongCount);
      
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

window.MatchGame = MatchGame;
