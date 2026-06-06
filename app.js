/* ==========================================
   CLASSROOM ARCADE PLATFORM CONTROLLER (app.js)
   ========================================== */

// 1. Demo Mode Fallback Questions Database
const DEMO_QUESTIONS = [
  {
    question: "諾貝爾是哪個國家的人？",
    answer: "瑞典"
  },
  {
    question: "陪伴愛因斯坦一生，甚至能登台演奏的樂器是什麼？",
    answer: "小提琴"
  },
  {
    question: "哈伯在擔任天文學家前，曾經擔任哪一項工作？",
    answer: "律師"
  },
  {
    question: "查爾斯·達爾文的父親及祖父的職業是什麼？",
    answer: "律師"
  },
  {
    question: "搞笑諾貝爾獎的獎金是多少？",
    answer: "不會有任何獎金"
  },
  {
    question: "現代物理學之父是誰？",
    answer: "愛因斯坦"
  },
  {
    question: "星系天文學之父是指哪一位科學家？",
    answer: "哈伯"
  },
  {
    question: "達爾文死後在哪裡安葬？",
    answer: "西敏寺"
  },
  {
    question: "搞笑諾貝爾獎是向什麼致敬（授予什麼成就）？",
    answer: "乍看好笑後引人深思"
  },
  {
    question: "愛因斯坦的「奇蹟之年」是哪一年？",
    answer: "1905年"
  },
  {
    question: "諾貝爾是什麼時候出生？",
    answer: "1833年"
  },
  {
    question: "諾貝爾在哪一年去世的？",
    answer: "1896年"
  },
  {
    question: "諾貝爾的主要研究領域是什麼？",
    answer: "炸藥製造"
  },
  {
    question: "為什麼諾貝爾要創立諾貝爾獎？",
    answer: "獎勵對人類社會有最大貢獻的人"
  },
  {
    question: "諾貝爾獎總共分為多少個類別的獎項(原始設立)？",
    answer: "5個"
  },
  {
    question: "諾貝爾獎的頒獎儀式在哪裡舉行？",
    answer: "瑞典"
  },
  {
    question: "諾貝爾獎的頒獎典禮在每年的哪個日期舉行？",
    answer: "2026/12/10"
  },
  {
    question: "什麼是搞笑諾貝爾獎？",
    answer: "對諾貝爾獎的有趣模仿"
  },
  {
    question: "搞笑諾貝爾獎的頒獎儀式在哪裡舉行？",
    answer: "哈佛大學"
  },
  {
    question: "愛因斯坦是哪個國家的人？",
    answer: "德國"
  },
  {
    question: "愛因斯坦在美國的哪所大學擔任教職？",
    answer: "普林斯頓大學"
  },
  {
    question: "愛因斯坦得過哪一種諾貝爾獎？",
    answer: "物理學獎"
  },
  {
    question: "質能互換方程式是指哪一個方程式？",
    answer: "E=mc2"
  },
  {
    question: "科學家們因為愛因斯坦提出的哪個理論，而開始了核分裂的研究？",
    answer: "狹義相對論(質能互換)"
  },
  {
    question: "愛因斯坦的研究間接促成核分裂的應用，例如下列何者？",
    answer: "原子彈"
  },
  {
    question: "埃德溫·哈伯是在哪一年出生？",
    answer: "1889年"
  },
  {
    question: "埃德溫·哈伯在西元1919年獲得哪一個天文台聘用，成為終身職位？",
    answer: "威爾森天文台"
  },
  {
    question: "哈伯證實了銀河系外其他星系存在，並發現星系紅移現象，建立了什麼定律？",
    answer: "哈伯定律"
  },
  {
    question: "哈伯定律指出遙遠星系的退行速度與距離成正比，為哪一個理論提出了有力支持？",
    answer: "宇宙大爆炸理論"
  },
  {
    question: "以天文學家愛德溫·哈伯來命名，在地球軌道上運行的太空望遠鏡是哪一座？",
    answer: "哈伯太空望遠鏡"
  },
  {
    question: "哈伯太空望遠鏡的高解析影像被用來證實何者存在於星系核中的學說？",
    answer: "黑洞"
  },
  {
    question: "將太空望遠鏡發射到地球軌道上運行的好處是什麼？",
    answer: "影像不受大氣湍流擾動"
  },
  {
    question: "查爾斯·達爾文是哪個國家的科學家？",
    answer: "英國"
  },
  {
    question: "達爾文因提出哪一套理論而聞名？",
    answer: "天擇說(演化論)"
  },
  {
    question: "下列何者「不是」達爾文天擇說的四個重要主張？",
    answer: "用進廢退"
  },
  {
    question: "下列哪一本是達爾文所寫的著名書籍？",
    answer: "物種起源"
  },
  {
    question: "得到哪一種疾病的人因為紅血球變形，可以免除瘧疾的危害？",
    answer: "蠶豆症"
  },
  {
    question: "在達爾文時代，演化論被視為新奇想法，如果公開會被教會視為什麼？",
    answer: "異端邪說"
  },
  {
    question: "長頸鹿面對高樹木的環境，脖子長的更容易活下來傳遞特點，這符合哪一項概念？",
    answer: "適者生存"
  }
];

// 2. Audio Synthesizer (Web Audio API)
const SoundFX = {
  ctx: null,
  
  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  },
  
  play(freq, type, duration, delay = 0) {
    this.init();
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    
    setTimeout(() => {
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        
        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        // Exponential decay
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch (e) {
        console.warn("Audio synthesis error:", e);
      }
    }, delay * 1000);
  },

  playClick() {
    this.play(800, 'sine', 0.05);
  },

  playSuccess() {
    // Upward arpeggio
    this.play(523.25, 'triangle', 0.1, 0);      // C5
    this.play(659.25, 'triangle', 0.1, 0.08);   // E5
    this.play(783.99, 'triangle', 0.15, 0.16);  // G5
    this.play(1046.50, 'triangle', 0.25, 0.24); // C6
  },

  playFail() {
    // Double downward buzz
    this.play(196.00, 'sawtooth', 0.15, 0);     // G3
    this.play(130.81, 'sawtooth', 0.3, 0.12);   // C3
  },

  playCoin() {
    this.play(987.77, 'sine', 0.08, 0);         // B5
    this.play(1318.51, 'sine', 0.25, 0.08);     // E6
  },

  playDice() {
    // Rapid tick sounds
    for (let i = 0; i < 6; i++) {
      this.play(300 + i * 100, 'sine', 0.04, i * 0.06);
    }
  },

  playWin() {
    // Triumph arpeggio
    const notes = [523, 659, 784, 1046, 784, 1046, 1318];
    notes.forEach((f, idx) => {
      this.play(f, 'sine', 0.2, idx * 0.12);
    });
  }
};

// 3. Platform State Manager
const ArcadeState = {
  student: {
    class: localStorage.getItem('arcade_student_class') || '',
    seat: localStorage.getItem('arcade_student_seat') || '',
    name: localStorage.getItem('arcade_student_name') || ''
  },
  apiUrl: localStorage.getItem('arcade_api_url') || '',
  questions: [...DEMO_QUESTIONS],
  isDemoMode: true,
  history: JSON.parse(localStorage.getItem('arcade_play_history') || '[]'),
  currentGame: null,

  getMultipleChoiceQuestion(q) {
    if (q.options && Array.isArray(q.options)) {
      return {
        question: q.question,
        options: q.options,
        answer: typeof q.answer === 'number' ? q.answer : parseInt(q.answer) || 0,
        explanation: q.explanation || ""
      };
    }
    
    const correctText = q.answer;
    
    // Get all other distinct answers from pool
    let otherAnswers = Array.from(new Set(
      this.questions
        .map(x => x.answer)
        .filter(ans => ans !== correctText && ans !== "")
    ));
    
    // Shuffle other answers
    otherAnswers = this.shuffleArray(otherAnswers);
    
    // Select 3 incorrect answers (distractors)
    const distractors = otherAnswers.slice(0, 3);
    
    // If not enough distractors, fill with mock choices
    while (distractors.length < 3) {
      const mockOptions = ["錯誤選項A", "錯誤選項B", "錯誤選項C", "錯誤選項D"];
      const nextMock = mockOptions.find(o => o !== correctText && !distractors.includes(o));
      distractors.push(nextMock || `選項 ${distractors.length + 1}`);
    }
    
    // Combine and shuffle
    const finalOptions = [correctText, ...distractors];
    const shuffledOptions = this.shuffleArray(finalOptions);
    const correctIndex = shuffledOptions.indexOf(correctText);
    
    return {
      question: q.question,
      options: shuffledOptions,
      answer: correctIndex,
      explanation: q.explanation || ""
    };
  },

  shuffleArray(arr) {
    const newArr = [...arr];
    for (let i = newArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
  },

  saveStudent(studentClass, seat, name) {
    this.student.class = studentClass.trim();
    this.student.seat = seat.trim();
    this.student.name = name.trim();
    
    localStorage.setItem('arcade_student_class', this.student.class);
    localStorage.setItem('arcade_student_seat', this.student.seat);
    localStorage.setItem('arcade_student_name', this.student.name);
  },

  clearStudent() {
    this.student.class = '';
    this.student.seat = '';
    this.student.name = '';
    localStorage.removeItem('arcade_student_class');
    localStorage.removeItem('arcade_student_seat');
    localStorage.removeItem('arcade_student_name');
  },

  setApiUrl(url) {
    this.apiUrl = url.trim();
    localStorage.setItem('arcade_api_url', this.apiUrl);
    this.isDemoMode = (this.apiUrl.length === 0);
  },

  addHistory(gameName, score, correct, total, status) {
    const record = {
      game: gameName,
      name: this.student.name || "測試玩家",
      correct: correct,
      total: total,
      score: score,
      status: status,
      time: new Date().toLocaleString("zh-TW", { timeZone: "Asia/Taipei" })
    };
    this.history.unshift(record);
    if (this.history.length > 20) this.history.pop();
    localStorage.setItem('arcade_play_history', JSON.stringify(this.history));
    this.renderHistory();
  },

  renderHistory() {
    const listContainer = document.getElementById('history-list');
    if (!listContainer) return;
    
    if (this.history.length === 0) {
      listContainer.innerHTML = `
        <tr class="empty-row">
          <td colspan="7">尚未有遊玩記錄，快開始第一局吧！</td>
        </tr>
      `;
      return;
    }
    
    listContainer.innerHTML = this.history.map(record => {
      let statusClass = 'demo';
      let statusText = '單機模式';
      if (record.status === 'success') {
        statusClass = 'success';
        statusText = '已存入雲端';
      } else if (record.status === 'failed') {
        statusClass = 'error';
        statusText = '上傳失敗';
      }
      
      return `
        <tr>
          <td><strong>${record.game}</strong></td>
          <td>${record.name}</td>
          <td>${record.correct} 題</td>
          <td>${record.total} 題</td>
          <td><span class="accent-text" style="font-weight:bold">${record.score}</span></td>
          <td><span class="status-pill ${statusClass}">${statusText}</span></td>
          <td style="font-size:0.8rem; color:var(--text-muted)">${record.time}</td>
        </tr>
      `;
    }).join('');
  }
};

// 4. API Service Integration
const GAS_API = {
  async testAndSaveConnection(url) {
    if (!url) {
      ArcadeState.setApiUrl('');
      ArcadeState.questions = [...DEMO_QUESTIONS];
      return { success: true, message: "已切換回單機測試模式。" };
    }
    
    try {
      const res = await fetch(`${url}?action=read_questions`);
      const json = await res.json();
      
      if (json.status === 'success') {
        ArcadeState.setApiUrl(url);
        ArcadeState.questions = json.data.length > 0 ? json.data : [...DEMO_QUESTIONS];
        return { 
          success: true, 
          message: `連線成功！共讀取到 ${json.data.length} 題庫。`
        };
      } else {
        return { success: false, message: "伺服器回傳錯誤：" + json.message };
      }
    } catch (e) {
      console.error(e);
      return { success: false, message: "連線測試失敗。請確認 Apps Script 部署 URL 是否正確且已設為「任何人」存取。" };
    }
  },

  async fetchQuestionsSilent() {
    if (ArcadeState.isDemoMode || !ArcadeState.apiUrl) return;
    try {
      const res = await fetch(`${ArcadeState.apiUrl}?action=read_questions`);
      const json = await res.json();
      if (json.status === 'success' && json.data.length > 0) {
        ArcadeState.questions = json.data;
      }
    } catch (e) {
      console.warn("Failed silent fetch of questions, using cached.", e);
    }
  },

  async logScore(gameName, score, correct, total) {
    if (ArcadeState.isDemoMode || !ArcadeState.apiUrl) {
      ArcadeState.addHistory(gameName, score, correct, total, 'demo');
      return { success: true, demo: true };
    }
    
    try {
      const url = `${ArcadeState.apiUrl}?action=log_score&name=${encodeURIComponent(ArcadeState.student.name)}&class=${encodeURIComponent(ArcadeState.student.class)}&seat=${encodeURIComponent(ArcadeState.student.seat)}&game=${encodeURIComponent(gameName)}&score=${score}&correct=${correct}&total=${total}`;
      const res = await fetch(url);
      const json = await res.json();
      
      if (json.status === 'success') {
        ArcadeState.addHistory(gameName, score, correct, total, 'success');
        return { success: true };
      } else {
        ArcadeState.addHistory(gameName, score, correct, total, 'failed');
        return { success: false, message: json.message };
      }
    } catch (e) {
      console.error("Score logging failed:", e);
      ArcadeState.addHistory(gameName, score, correct, total, 'failed');
      return { success: false, message: "網路傳輸失敗，無法寫入 Google Sheets。" };
    }
  }
};

// 5. Particle Effects System
const LobbyParticles = {
  canvas: null,
  ctx: null,
  particles: [],
  animationId: null,

  init() {
    this.canvas = document.getElementById('bg-particles');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    this.particles = [];
    for (let i = 0; i < 40; i++) {
      this.particles.push(this.createParticle());
    }

    this.animate();
  },

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  },

  createParticle() {
    return {
      x: Math.random() * this.canvas.width,
      y: Math.random() * this.canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4 - 0.2, // Drifts slightly upwards
      size: Math.random() * 3 + 1,
      color: Math.random() > 0.5 ? 'rgba(0, 217, 255, 0.15)' : 'rgba(255, 0, 127, 0.15)'
    };
  },

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
      if (p.y < 0) p.y = this.canvas.height;
      if (p.y > this.canvas.height) p.y = 0;

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.fill();
    });

    this.animationId = requestAnimationFrame(() => this.animate());
  }
};

// 6. Generic Question Overlay Modal Manager
const QuestionModal = {
  timerId: null,
  
  show(questionObj, durationSeconds = 20, onAnsweredCallback) {
    const modal = document.getElementById('question-modal');
    const qText = document.getElementById('modal-question-text');
    const optContainer = document.getElementById('modal-options-container');
    const feedback = document.getElementById('modal-feedback');
    const fText = document.getElementById('modal-feedback-text');
    const expText = document.getElementById('modal-explanation-text');
    const nextBtn = document.getElementById('btn-next-question');
    const timerBar = document.getElementById('question-timer-bar');

    // Clean states
    clearTimeout(this.timerId);
    feedback.classList.add('hidden');
    nextBtn.classList.add('hidden');
    optContainer.innerHTML = '';
    
    // Set text
    qText.textContent = questionObj.question;
    
    // Set timer duration variable in CSS
    timerBar.style.setProperty('--duration', `${durationSeconds}s`);
    // Restart animation
    timerBar.style.animation = 'none';
    timerBar.offsetHeight; /* trigger reflow */
    timerBar.style.animation = null;

    let hasSelected = false;

    // Render options
    questionObj.options.forEach((optText, index) => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.innerHTML = `
        <span class="option-letter">${String.fromCharCode(65 + index)}</span>
        <span class="option-content">${optText}</span>
      `;
      
      btn.addEventListener('click', () => {
        if (hasSelected) return;
        hasSelected = true;
        
        clearTimeout(this.timerId);
        // Disable timer animation
        timerBar.style.animation = 'none';
        
        const isCorrect = (index === questionObj.answer);
        
        // Disable all option buttons
        document.querySelectorAll('.option-btn').forEach((b, i) => {
          b.disabled = true;
          if (i === questionObj.answer) {
            b.classList.add('correct');
          } else if (i === index && !isCorrect) {
            b.classList.add('wrong');
          }
        });

        // Show feedback
        feedback.classList.remove('hidden');
        feedback.className = `question-feedback ${isCorrect ? 'success' : 'error'}`;
        fText.textContent = isCorrect ? "🎉 答對了！太棒了！" : `❌ 答錯了！正確答案是 ${String.fromCharCode(65 + questionObj.answer)}`;
        expText.textContent = questionObj.explanation ? `解析：${questionObj.explanation}` : "";
        
        // Play Sound
        if (isCorrect) {
          SoundFX.playSuccess();
        } else {
          SoundFX.playFail();
        }
        
        nextBtn.classList.remove('hidden');
        
        // Save choice callback
        nextBtn.onclick = () => {
          SoundFX.playClick();
          modal.classList.add('hidden');
          onAnsweredCallback(isCorrect);
        };
      });
      
      optContainer.appendChild(btn);
    });

    modal.classList.remove('hidden');

    // Trigger timer timeout
    this.timerId = setTimeout(() => {
      if (hasSelected) return;
      hasSelected = true;
      
      // Auto wrong
      document.querySelectorAll('.option-btn').forEach((b, i) => {
        b.disabled = true;
        if (i === questionObj.answer) b.classList.add('correct');
      });

      feedback.classList.remove('hidden');
      feedback.className = 'question-feedback error';
      fText.textContent = `⏰ 時間到！正確答案是 ${String.fromCharCode(65 + questionObj.answer)}`;
      expText.textContent = questionObj.explanation ? `解析：${questionObj.explanation}` : "";
      
      SoundFX.playFail();
      
      nextBtn.classList.remove('hidden');
      nextBtn.onclick = () => {
        SoundFX.playClick();
        modal.classList.add('hidden');
        onAnsweredCallback(false);
      };
    }, durationSeconds * 1000);
  }
};

// 7. Global Initializer & Lobby Binding
window.addEventListener('DOMContentLoaded', () => {
  // A. Initialize Lucide Icons
  lucide.createIcons();

  // B. Run background particles
  LobbyParticles.init();

  // C. Determine Initial Connection State
  ArcadeState.isDemoMode = (ArcadeState.apiUrl.length === 0);
  const banner = document.getElementById('connection-banner');
  if (ArcadeState.isDemoMode) {
    banner.style.display = 'flex';
  } else {
    banner.style.display = 'none';
    GAS_API.fetchQuestionsSilent(); // Silent reload in background
  }
  
  // Render past history
  ArcadeState.renderHistory();

  // D. Handle Student Profile Login
  const studentForm = document.getElementById('student-form');
  const studentBadge = document.getElementById('student-badge');
  const badgeName = document.getElementById('badge-display-name');
  const logoutBtn = document.getElementById('btn-logout');
  const gameCards = document.querySelectorAll('.game-card');

  const updateLoginUI = () => {
    if (ArcadeState.student.name) {
      studentForm.classList.add('hidden');
      studentBadge.classList.remove('hidden');
      badgeName.textContent = `${ArcadeState.student.name} (${ArcadeState.student.class}班 ${ArcadeState.student.seat}號)`;
      
      // Unlock games
      gameCards.forEach(card => {
        card.classList.remove('locked');
        card.querySelector('.start-game-btn').disabled = false;
      });
    } else {
      studentForm.classList.remove('hidden');
      studentBadge.classList.add('hidden');
      
      // Lock games
      gameCards.forEach(card => {
        card.classList.add('locked');
        card.querySelector('.start-game-btn').disabled = true;
      });
    }
  };
  
  // Fill initial form values if saved
  document.getElementById('student-class').value = ArcadeState.student.class;
  document.getElementById('student-seat').value = ArcadeState.student.seat;
  document.getElementById('student-name').value = ArcadeState.student.name;
  updateLoginUI();

  studentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    SoundFX.playCoin();
    
    const cls = document.getElementById('student-class').value;
    const seat = document.getElementById('student-seat').value;
    const name = document.getElementById('student-name').value;
    
    ArcadeState.saveStudent(cls, seat, name);
    updateLoginUI();
  });

  logoutBtn.addEventListener('click', () => {
    SoundFX.playClick();
    if (confirm("確認要切換或登出玩家嗎？")) {
      ArcadeState.clearStudent();
      updateLoginUI();
    }
  });

  // E. Settings Modal Bindings
  const settingsModal = document.getElementById('settings-modal');
  const openSettings = document.getElementById('open-settings');
  const closeSettings = document.getElementById('close-settings');
  const saveSettingsBtn = document.getElementById('btn-test-api');
  const apiUrlInput = document.getElementById('settings-api-url');

  openSettings.addEventListener('click', () => {
    SoundFX.playClick();
    apiUrlInput.value = ArcadeState.apiUrl;
    settingsModal.classList.remove('hidden');
  });

  closeSettings.addEventListener('click', () => {
    SoundFX.playClick();
    settingsModal.classList.add('hidden');
  });

  saveSettingsBtn.addEventListener('click', async () => {
    saveSettingsBtn.disabled = true;
    saveSettingsBtn.innerHTML = '<i data-lucide="refresh-cw" class="animate-spin"></i> 測試中...';
    lucide.createIcons();
    
    const res = await GAS_API.testAndSaveConnection(apiUrlInput.value);
    
    saveSettingsBtn.disabled = false;
    saveSettingsBtn.innerHTML = '<i data-lucide="refresh-cw"></i> 測試連線並儲存';
    lucide.createIcons();
    
    alert(res.message);
    
    if (res.success) {
      settingsModal.classList.add('hidden');
      if (ArcadeState.isDemoMode) {
        banner.style.display = 'flex';
      } else {
        banner.style.display = 'none';
      }
    }
  });

  // F. Theme Toggle
  const themeToggle = document.getElementById('theme-toggle');
  themeToggle.addEventListener('click', () => {
    SoundFX.playClick();
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('arcade_theme', newTheme);
  });
  
  const savedTheme = localStorage.getItem('arcade_theme');
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
  }

  // G. Game exit button handler
  document.getElementById('btn-exit-game').addEventListener('click', () => {
    SoundFX.playClick();
    if (confirm("確認要退出目前的遊戲嗎？您的成績可能不會存檔。")) {
      document.getElementById('game-stage').classList.add('hidden');
      document.getElementById('arcade-lobby').classList.remove('hidden');
      if (ArcadeState.currentGame && typeof ArcadeState.currentGame.destroy === 'function') {
        ArcadeState.currentGame.destroy();
      }
      ArcadeState.currentGame = null;
    }
  });

  // H. Start Game Cards Handlers
  gameCards.forEach(card => {
    const startBtn = card.querySelector('.start-game-btn');
    startBtn.addEventListener('click', () => {
      if (card.classList.contains('locked')) return;
      SoundFX.playCoin();
      
      const gameType = card.dataset.game;
      let gameEngine = null;
      
      if (gameType === 'monopoly') {
        gameEngine = MonopolyGame;
      } else if (gameType === 'match') {
        gameEngine = MatchGame;
      } else if (gameType === 'mole') {
        gameEngine = MoleGame;
      } else if (gameType === 'treasure') {
        gameEngine = TreasureGame;
      } else if (gameType === 'shooter') {
        gameEngine = ShooterGame;
      } else if (gameType === 'racer') {
        gameEngine = RacerGame;
      } else if (gameType === 'archery') {
        gameEngine = ArcheryGame;
      } else if (gameType === 'jumper') {
        gameEngine = JumperGame;
      } else if (gameType === 'flip') {
        gameEngine = FlipGame;
      } else if (gameType === 'puzzle') {
        gameEngine = PuzzleGame;
      } else if (gameType === 'balloon') {
        gameEngine = BalloonGame;
      } else if (gameType === 'miner') {
        gameEngine = MinerGame;
      } else if (gameType === 'arena') {
        gameEngine = ArenaGame;
      }
      
      if (gameEngine) {
        // Setup Stage UI
        document.getElementById('arcade-lobby').classList.add('hidden');
        document.getElementById('game-stage').classList.remove('hidden');
        document.getElementById('game-player-name').textContent = ArcadeState.student.name;
        
        ArcadeState.currentGame = gameEngine;
        gameEngine.init();
      }
    });
  });
});
