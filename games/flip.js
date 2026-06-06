/* ==========================================
   CLASSROOM ARCADE - MEMORY FLIP (flip.js)
   ========================================== */

const FlipGame = {
  container: null,
  score: 0,
  timeLeft: 60,
  timerInterval: null,

  pairsCount: 6, // 12 cards total
  matchedPairs: 0,
  correctCount: 0,
  wrongCount: 0,
  cardsData: [],
  firstSelectedCard: null,
  secondSelectedCard: null,
  isBusy: false,

  init() {
    this.container = document.getElementById('game-body');
    this.score = 0;
    this.matchedPairs = 0;
    this.correctCount = 0;
    this.wrongCount = 0;
    this.timeLeft = 120;
    this.firstSelectedCard = null;
    this.secondSelectedCard = null;
    this.isBusy = false;
    this.cardsData = [];
    this.round = 1;
    this.pairsCount = 10;
    this.sessionQuestions = ArcadeState.getRandomQuestions(20);

    document.getElementById('game-stage-title').textContent = "經典翻牌記";
    document.getElementById('game-score').textContent = this.score;
    document.getElementById('game-timer').textContent = "進度: 關卡 1/2 | 時間: 120s";

    this.startNewGame();
  },

  startNewGame() {
    const selectedQuestions = this.sessionQuestions.slice((this.round - 1) * 10, this.round * 10);

    const cards = [];
    selectedQuestions.forEach((q, index) => {
      // Find correct answer text
      let answerText = "無解";
      if (q.options && Array.isArray(q.options) && typeof q.answer === 'number' && q.options[q.answer] !== undefined) {
        answerText = q.options[q.answer];
      } else if (q.answer !== undefined && q.answer !== null) {
        answerText = String(q.answer);
      }

      cards.push({
        id: `q-${index}`,
        pairId: index,
        type: 'question',
        text: q.question.length > 30 ? q.question.substring(0, 27) + "..." : q.question,
        fullText: q.question
      });

      cards.push({
        id: `a-${index}`,
        pairId: index,
        type: 'answer',
        text: answerText.length > 30 ? answerText.substring(0, 27) + "..." : answerText,
        fullText: answerText
      });
    });

    this.cardsData = this.shuffleArray(cards);
    this.pairsCount = selectedQuestions.length;

    this.renderGrid();

    // Start timer
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
      <div class="flip-grid-wrapper" style="width:100%; max-width:850px; margin:0 auto; display:flex; flex-direction:column; gap:10px;">
        <p style="text-align:center; font-size:0.9rem; color:var(--text-muted)">💡 翻開卡牌，將「題目」與對應的「正確答案」配對！</p>
        <div class="flip-grid" style="display:grid; grid-template-columns: repeat(4, 1fr); gap:12px; perspective: 1000px;">
          <!-- Cards injected here -->
        </div>
      </div>
    `;

    const grid = this.container.querySelector('.flip-grid');

    this.cardsData.forEach(card => {
      // 3D Card structure using standard CSS
      const cardContainer = document.createElement('div');
      cardContainer.className = 'flip-card-container';
      cardContainer.dataset.id = card.id;
      cardContainer.style.width = '100%';
      cardContainer.style.height = '105px';
      cardContainer.style.position = 'relative';
      cardContainer.style.transformStyle = 'preserve-3d';
      cardContainer.style.transition = 'transform 0.5s';
      cardContainer.style.cursor = 'pointer';

      // Card Back (Visible initially)
      const cardBack = document.createElement('div');
      cardBack.className = 'card-face card-back';
      this.styleCardFace(cardBack);
      cardBack.style.background = 'linear-gradient(135deg, #1e293b, #0f172a)';
      cardBack.style.border = '2px solid rgba(0, 217, 255, 0.4)';
      cardBack.innerHTML = `
        <div style="font-size:2rem; filter:drop-shadow(0 0 6px rgba(0,217,255,0.6))">❓</div>
      `;

      // Card Front (Displays value when flipped)
      const cardFront = document.createElement('div');
      cardFront.className = `card-face card-front card-${card.type}`;
      this.styleCardFace(cardFront);
      cardFront.style.transform = 'rotateY(180deg)';
      cardFront.style.background = card.type === 'question' ? 'rgba(0, 217, 255, 0.1)' : 'rgba(255, 0, 127, 0.1)';
      cardFront.style.border = card.type === 'question' ? '2px solid var(--neon-blue)' : '2px solid var(--neon-pink)';
      cardFront.style.color = '#fff';
      cardFront.style.padding = '8px';
      cardFront.style.fontSize = '0.8rem';
      cardFront.style.lineHeight = '1.3';
      cardFront.style.overflow = 'hidden';
      cardFront.style.wordBreak = 'break-all';
      cardFront.textContent = card.text;
      cardFront.title = card.fullText;

      cardContainer.appendChild(cardBack);
      cardContainer.appendChild(cardFront);

      cardContainer.addEventListener('click', () => this.handleCardClick(card, cardContainer));

      grid.appendChild(cardContainer);
    });
  },

  styleCardFace(el) {
    el.style.position = 'absolute';
    el.style.width = '100%';
    el.style.height = '100%';
    el.style.backfaceVisibility = 'hidden';
    el.style.borderRadius = '8px';
    el.style.display = 'flex';
    el.style.justifyContent = 'center';
    el.style.alignItems = 'center';
    el.style.textAlign = 'center';
    el.style.boxSizing = 'border-box';
    el.style.boxShadow = '0 4px 10px rgba(0,0,0,0.3)';
  },

  handleCardClick(card, cardContainer) {
    if (this.isBusy) return;
    if (cardContainer.classList.contains('flipped') || cardContainer.classList.contains('matched')) return;

    SoundFX.playClick();
    
    // Flip card visually
    cardContainer.style.transform = 'rotateY(180deg)';
    cardContainer.classList.add('flipped');

    if (!this.firstSelectedCard) {
      this.firstSelectedCard = { card, el: cardContainer };
      return;
    }

    this.secondSelectedCard = { card, el: cardContainer };
    this.isBusy = true;

    // Check Match
    const first = this.firstSelectedCard;
    const second = this.secondSelectedCard;

    if (first.card.pairId === second.card.pairId && first.card.type !== second.card.type) {
      // Correct Match!
      setTimeout(() => {
        first.el.classList.add('matched');
        second.el.classList.add('matched');
        
        // Add green glow border style
        first.el.querySelector('.card-front').style.borderColor = 'var(--neon-green)';
        second.el.querySelector('.card-front').style.borderColor = 'var(--neon-green)';

        this.score += 100;
        this.matchedPairs++;
        this.correctCount++;
        document.getElementById('game-score').textContent = this.score;
        SoundFX.playCoin();

        this.firstSelectedCard = null;
        this.secondSelectedCard = null;
        this.isBusy = false;

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
            setTimeout(() => this.endGame(true), 500);
          }
        }
      }, 500);
    } else {
      // Wrong Match! Flip back
      setTimeout(() => {
        first.el.style.transform = 'rotateY(0deg)';
        second.el.style.transform = 'rotateY(0deg)';
        first.el.classList.remove('flipped');
        second.el.classList.remove('flipped');

        this.score = Math.max(0, this.score - 20);
        this.wrongCount++;
        document.getElementById('game-score').textContent = this.score;
        SoundFX.playFail();

        this.firstSelectedCard = null;
        this.secondSelectedCard = null;
        this.isBusy = false;
      }, 1200);
    }
  },

  endGame(isWin) {
    let finalScore = this.score;
    let timeBonus = 0;
    
    if (isWin) {
      SoundFX.playWin();
      timeBonus = this.timeLeft * 10;
      finalScore += timeBonus;
    }
    
    this.container.innerHTML = `
      <div class="game-win-overlay">
        <div class="win-title">${isWin ? "🎉 配對成功！" : "⏰ 時間到！"}</div>
        <p>${isWin ? `太棒了！你憑著絕佳的記憶力配對了所有卡牌！` : "別灰心，多玩幾次訓練大腦記憶！"}</p>
        <div class="win-score">SCORE: ${finalScore}</div>
        <div style="font-size:0.9rem; margin-top:-0.5rem; color:var(--text-muted)">
          ${isWin ? `配對得分: ${this.score} + 時間加成: ${timeBonus} (${this.timeLeft}s x 10)` : `配對得分: ${this.score}`}
        </div>
        <p style="color:var(--text-muted)">配對成功: ${this.matchedPairs} 對 / 錯誤嘗試: ${this.wrongCount} 次</p>
        <button id="btn-win-exit" class="btn btn-neon-blue">退出並登錄成績</button>
      </div>
    `;

    document.getElementById('btn-win-exit').addEventListener('click', async () => {
      SoundFX.playClick();
      const exitBtn = document.getElementById('btn-win-exit');
      exitBtn.disabled = true;
      exitBtn.textContent = "上傳成績中...";

      await GAS_API.logScore("經典翻牌記", finalScore, this.correctCount, this.correctCount + this.wrongCount);

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

window.FlipGame = FlipGame;
