/* ════════════════════════════════════════════
   FLASHCARD SYSTEM
   ════════════════════════════════════════════ */

var flashcardTopics = [];
var currentFlashcards = [];
var currentCardIdx = 0;
var isAutoSpeakFlashcard = true;
var currentFlashcardMode = 'classic';
var currentTopicId = '';
var isWaitingNext = false;

function setFlashcardMode(mode) {
  currentFlashcardMode = mode;
  isWaitingNext = false;
  
  // Update buttons state
  const btnClassic = document.getElementById('fc-mode-classic');
  const btnQuiz = document.getElementById('fc-mode-quiz');
  const btnType = document.getElementById('fc-mode-type');
  
  if (btnClassic) btnClassic.classList.toggle('active', mode === 'classic');
  if (btnQuiz) btnQuiz.classList.toggle('active', mode === 'quiz');
  if (btnType) btnType.classList.toggle('active', mode === 'type');
  
  // Show/Hide views
  const viewClassic = document.getElementById('fc-classic-view');
  const viewQuiz = document.getElementById('fc-quiz-view');
  const viewType = document.getElementById('fc-type-view');
  
  if (viewClassic) viewClassic.style.display = mode === 'classic' ? 'block' : 'none';
  if (viewQuiz) viewQuiz.style.display = mode === 'quiz' ? 'block' : 'none';
  if (viewType) viewType.style.display = mode === 'type' ? 'block' : 'none';
  
  renderCurrentCard();
}

async function openFlashcardTopicsPage() {
  showPage('page-flashcard-topics');
  const listContainer = document.getElementById('flashcard-topics-list');
  if (!listContainer) return;
  listContainer.innerHTML = '<div class="units-loading"><div class="loader"></div>Đang tải các chủ đề...</div>';

  try {
    if (flashcardTopics.length === 0) {
      if (typeof fetchFlashcardTopicsFromSupabase === 'function') {
        flashcardTopics = await fetchFlashcardTopicsFromSupabase();
      }
      if (!flashcardTopics || flashcardTopics.length === 0) {
        const res = await fetch(`./content/flashcards/topics-index.json?t=${Date.now()}`);
        if (!res.ok) throw new Error();
        flashcardTopics = await res.json();
      }
    }
    renderFlashcardTopics();
  } catch (e) {
    listContainer.innerHTML = '<div class="units-loading" style="color:var(--c-danger);">⚠️ Không thể tải danh sách chủ đề.<br><span style="font-size:.78rem;color:var(--c-muted);font-weight:500;">Vui lòng kiểm tra file content/flashcards/topics-index.json</span></div>';
  }
}

function renderFlashcardTopics() {
  const listContainer = document.getElementById('flashcard-topics-list');
  if (!listContainer) return;
  if (flashcardTopics.length === 0) {
    listContainer.innerHTML = '<div class="units-loading">📭 Chưa có chủ đề từ vựng nào.</div>';
    return;
  }

  listContainer.innerHTML = flashcardTopics.map((topic, index) => `
    <div class="cat-card" style="animation-delay:${index * .08}s" onclick="startFlashcardTopic('${topic.id}')">
      <div class="cat-icon">${topic.icon || '📇'}</div>
      <div class="cat-info">
        <div class="cat-title">${topic.title}</div>
        <div class="cat-desc">${topic.description || ''}</div>
      </div>
      <div class="cat-badge">
        <div class="cat-badge-num">${topic.cardCount || 0}</div>
        <div class="cat-badge-label">từ</div>
      </div>
      <div class="cat-arrow">›</div>
    </div>
  `).join('');
}

async function startFlashcardTopic(topicId) {
  currentTopicId = topicId;
  const topic = flashcardTopics.find(t => t.id === topicId);
  const title = topic ? topic.title : 'Từ vựng';

  // Update nav title immediately
  const navTitle = document.getElementById('fc-nav-title');
  const topicInfo = document.getElementById('fc-topic-info');
  if (navTitle) navTitle.textContent = title;
  if (topicInfo) topicInfo.textContent = `Chủ đề: ${title}`;

  // Reset card index
  currentCardIdx = 0;
  currentFlashcards = [];

  // Get DOM elements for card reset
  const cardEl = document.getElementById('fc-card');
  if (cardEl) cardEl.classList.remove('flipped');

  // Reset to Classic Mode
  setFlashcardMode('classic');

  showPage('page-flashcard');

  // Loading state on card
  const fcEnglish = document.getElementById('fc-english');
  const fcPhonetic = document.getElementById('fc-phonetic');
  const fcVietnamese = document.getElementById('fc-vietnamese');
  if (fcEnglish) fcEnglish.textContent = 'Đang tải từ vựng...';
  if (fcPhonetic) fcPhonetic.textContent = '';
  if (fcVietnamese) fcVietnamese.textContent = 'Loading...';

  try {
    if (typeof fetchFlashcardsFromSupabase === 'function') {
      currentFlashcards = await fetchFlashcardsFromSupabase(topicId);
    }
    if (!currentFlashcards || currentFlashcards.length === 0) {
      const res = await fetch(`./content/flashcards/${topicId}.json?t=${Date.now()}`);
      if (!res.ok) throw new Error();
      currentFlashcards = await res.json();
    }

    if (currentFlashcards.length === 0) {
      if (fcEnglish) fcEnglish.textContent = 'Không có từ vựng';
      if (fcVietnamese) fcVietnamese.textContent = 'Chủ đề này hiện chưa có dữ liệu từ vựng.';
      return;
    }

    renderCurrentCard();
  } catch (e) {
    if (fcEnglish) fcEnglish.textContent = 'Lỗi tải dữ liệu';
    if (fcVietnamese) fcVietnamese.textContent = 'Không thể kết nối hoặc không tìm thấy file từ vựng.';
  }
}

function renderCurrentCard() {
  if (currentFlashcards.length === 0) return;

  const card = currentFlashcards[currentCardIdx];
  const cardEl = document.getElementById('fc-card');
  if (cardEl) cardEl.classList.remove('flipped'); // Reset card to front

  // Fill front (for Classic Mode)
  const fcEnglish = document.getElementById('fc-english');
  if (fcEnglish) fcEnglish.textContent = card.english || '';
  const phoneticEl = document.getElementById('fc-phonetic');
  if (phoneticEl) {
    if (card.phonetic) {
      phoneticEl.textContent = card.phonetic;
      phoneticEl.style.display = 'block';
    } else {
      phoneticEl.style.display = 'none';
    }
  }

  // Update badge types (front and back)
  const badgeFront = document.getElementById('fc-badge-front');
  const badgeBack = document.getElementById('fc-badge-back');
  const cardType = card.type || 'vocabulary';

  if (badgeFront) {
    badgeFront.textContent = cardType === 'example' ? 'ví dụ (example)' : 'từ vựng (vocab)';
    badgeFront.className = `card-badge ${cardType}`;
  }
  if (badgeBack) {
    badgeBack.textContent = cardType === 'example' ? 'ví dụ (example)' : 'từ vựng (vocab)';
    badgeBack.className = `card-badge ${cardType}`;
  }

  // Fill back (for Classic Mode)
  const viText = card.vietnamese || '';
  const viEl = document.getElementById('fc-vietnamese');
  if (viEl) {
    viEl.textContent = viText;
    viEl.classList.toggle('card-vietnamese--detail', /【Nghĩa】|【Giải thích】|【Dịch】/.test(viText));
  }

  // Quiz Mode Rendering
  if (currentFlashcardMode === 'quiz') {
    const fcQuizEnglish = document.getElementById('fc-quiz-english');
    const fcQuizPhonetic = document.getElementById('fc-quiz-phonetic');
    const fcQuizOptions = document.getElementById('fc-quiz-options');
    
    if (fcQuizEnglish) fcQuizEnglish.textContent = card.english || '';
    if (fcQuizPhonetic) {
      if (card.phonetic) {
        fcQuizPhonetic.textContent = card.phonetic;
        fcQuizPhonetic.style.display = 'block';
      } else {
        fcQuizPhonetic.style.display = 'none';
      }
    }
    
    if (fcQuizOptions) {
      fcQuizOptions.innerHTML = '';
      
      // Correct translation
      const correctAns = card.vietnamese || '';
      
      // Gather other cards in the topic as distractors
      const distractors = currentFlashcards
        .filter(c => c.english !== card.english && c.vietnamese)
        .map(c => c.vietnamese);
      
      // Shuffle distractors and pick up to 3 unique ones
      const shuffledDistractors = distractors.sort(() => 0.5 - Math.random());
      const selectedDistractors = [];
      for (let d of shuffledDistractors) {
        if (selectedDistractors.length < 3 && !selectedDistractors.includes(d) && d !== correctAns) {
          selectedDistractors.push(d);
        }
      }
      
      // Combine correct & distractors
      const choices = [correctAns, ...selectedDistractors];
      // Shuffle all choices
      choices.sort(() => 0.5 - Math.random());
      
      choices.forEach(choice => {
        const btn = document.createElement('button');
        btn.className = 'quiz-opt-btn';
        btn.textContent = choice;
        btn.onclick = () => selectQuizOption(btn, choice, correctAns);
        fcQuizOptions.appendChild(btn);
      });
    }
  } 
  // Type Answer Mode Rendering
  else if (currentFlashcardMode === 'type') {
    const fcTypeVietnamese = document.getElementById('fc-type-vietnamese');
    const fcTypeInput = document.getElementById('fc-type-input');
    const fcTypeFeedback = document.getElementById('fc-type-feedback');
    const fcTypeSubmit = document.getElementById('fc-type-submit');
    
    if (fcTypeVietnamese) fcTypeVietnamese.textContent = card.vietnamese || '';
    if (fcTypeInput) {
      fcTypeInput.value = '';
      fcTypeInput.className = ''; // Remove status colors
      fcTypeInput.disabled = false;
      setTimeout(() => fcTypeInput.focus(), 150);
    }
    if (fcTypeFeedback) {
      fcTypeFeedback.textContent = '';
      fcTypeFeedback.className = 'type-feedback';
    }
    if (fcTypeSubmit) {
      fcTypeSubmit.disabled = false;
      fcTypeSubmit.textContent = 'Kiểm tra ✓';
    }
  }

  // Update progress
  const total = currentFlashcards.length;
  const progressText = document.getElementById('fc-progress-text');
  const progressPercent = document.getElementById('fc-progress-percent');
  const progressFill = document.getElementById('fc-progress-fill');
  const pct = Math.round(((currentCardIdx + 1) / total) * 100);

  if (progressText) progressText.textContent = `Thẻ ${currentCardIdx + 1} / ${total}`;
  if (progressPercent) progressPercent.textContent = `${pct}%`;
  if (progressFill) progressFill.style.width = `${pct}%`;

  // Web Speech Auto-play (Skip auto-speak in Type Answer mode)
  if (isAutoSpeakFlashcard && currentFlashcardMode !== 'type') {
    stopFlashcardSpeech();
    setTimeout(() => {
      speakFlashcard();
    }, 320);
  } else {
    stopFlashcardSpeech();
  }
}

function flipFlashcard() {
  const cardEl = document.getElementById('fc-card');
  if (cardEl) {
    cardEl.classList.toggle('flipped');
  }
}

function nextFlashcard() {
  if (currentFlashcards.length === 0) return;
  isWaitingNext = false;
  currentCardIdx = (currentCardIdx + 1) % currentFlashcards.length;
  renderCurrentCard();
}

function prevFlashcard() {
  if (currentFlashcards.length === 0) return;
  isWaitingNext = false;
  currentCardIdx = (currentCardIdx - 1 + currentFlashcards.length) % currentFlashcards.length;
  renderCurrentCard();
}

function shuffleFlashcards() {
  if (currentFlashcards.length <= 1) return;

  // Fisher-Yates shuffle
  for (let i = currentFlashcards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [currentFlashcards[i], currentFlashcards[j]] = [currentFlashcards[j], currentFlashcards[i]];
  }

  isWaitingNext = false;
  currentCardIdx = 0;
  renderCurrentCard();
}

function speakFlashcard() {
  if (currentFlashcards.length === 0) return;
  const card = currentFlashcards[currentCardIdx];
  const textToSpeak = card.english;
  if (!textToSpeak) return;

  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();

  const u = new SpeechSynthesisUtterance(textToSpeak);
  u.lang = 'en-US';
  u.rate = card.type === 'example' ? 0.3 : 0.6; // Read sentences slightly slower for clarity
  u.pitch = 1.05;

  // Find voices
  if (typeof _getEnglishVoice === 'function') {
    const preferred = _getEnglishVoice();
    if (preferred) u.voice = preferred;
  } else {
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => /en[-_](US|GB|AU)/i.test(v.lang) && /natural|google|samantha|zira|david/i.test(v.name))
      || voices.find(v => /en[-_](US|GB)/i.test(v.lang))
      || null;
    if (preferred) u.voice = preferred;
  }

  // Visual feedback on the speak button if playing
  const speakBtns = document.querySelectorAll('.card-speak-btn');
  u.onstart = () => {
    speakBtns.forEach(btn => btn.style.transform = 'scale(1.15)');
  };
  u.onend = () => {
    speakBtns.forEach(btn => btn.style.transform = '');
  };
  u.onerror = () => {
    speakBtns.forEach(btn => btn.style.transform = '');
  };

  window.speechSynthesis.speak(u);
}

function stopFlashcardSpeech() {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

function toggleAutoSpeak(checked) {
  if (checked !== undefined) {
    isAutoSpeakFlashcard = checked;
  } else {
    isAutoSpeakFlashcard = !isAutoSpeakFlashcard;
    const chk = document.getElementById('fc-auto-speak-chk');
    if (chk) chk.checked = isAutoSpeakFlashcard;
  }
}

/* ════════════════════════════════════════════
   QUIZ MODE — Chọn đáp án trắc nghiệm
   ════════════════════════════════════════════ */

function selectQuizOption(selectedBtn, selectedAnswer, correctAnswer) {
  if (isWaitingNext) return; // Prevent double-tap
  isWaitingNext = true;

  const allBtns = document.querySelectorAll('#fc-quiz-options .quiz-opt-btn');
  const isCorrect = selectedAnswer === correctAnswer;

  // Disable all buttons
  allBtns.forEach(btn => {
    btn.disabled = true;
    // Highlight the correct answer
    if (btn.textContent === correctAnswer) {
      btn.classList.add('correct');
    }
  });

  if (!isCorrect) {
    selectedBtn.classList.add('incorrect');
  }

  // Award XP if correct
  if (isCorrect) {
    const topicTitle = _getFlashcardTopicTitle();
    awardFlashcardXP(5, 'Quiz', topicTitle);
  }

  // Auto-advance after a brief delay
  setTimeout(() => {
    nextFlashcard();
  }, isCorrect ? 800 : 1500);
}

/* ════════════════════════════════════════════
   TYPE ANSWER MODE — Gõ đáp án tiếng Anh
   ════════════════════════════════════════════ */

function checkTypeAnswer() {
  if (isWaitingNext) return;
  if (currentFlashcards.length === 0) return;

  const card = currentFlashcards[currentCardIdx];
  const correctWord = (card.english || '').trim();
  const inputEl = document.getElementById('fc-type-input');
  const feedbackEl = document.getElementById('fc-type-feedback');
  const submitBtn = document.getElementById('fc-type-submit');

  if (!inputEl || !feedbackEl) return;

  const userAnswer = inputEl.value.trim();
  if (!userAnswer) {
    feedbackEl.textContent = '⚠️ Vui lòng nhập đáp án!';
    feedbackEl.className = 'type-feedback incorrect';
    return;
  }

  const distance = levenshteinDistance(
    userAnswer.toLowerCase(),
    correctWord.toLowerCase()
  );

  const isExactMatch = distance === 0;
  const isTypoMatch = distance === 1;
  const isCorrect = isExactMatch || isTypoMatch;

  isWaitingNext = true;
  inputEl.disabled = true;
  if (submitBtn) submitBtn.disabled = true;

  if (isExactMatch) {
    inputEl.classList.add('correct');
    feedbackEl.textContent = '✅ Chính xác! Giỏi lắm!';
    feedbackEl.className = 'type-feedback correct';
  } else if (isTypoMatch) {
    inputEl.classList.add('correct');
    feedbackEl.innerHTML = `✅ Gần đúng! Đáp án chính xác: <strong>${correctWord}</strong>`;
    feedbackEl.className = 'type-feedback correct';
  } else {
    inputEl.classList.add('incorrect');
    feedbackEl.innerHTML = `❌ Sai rồi! Đáp án đúng: <strong>${correctWord}</strong>`;
    feedbackEl.className = 'type-feedback incorrect';
  }

  // Award XP if correct (exact or typo)
  if (isCorrect) {
    const topicTitle = _getFlashcardTopicTitle();
    awardFlashcardXP(5, 'Type', topicTitle);
  }

  // Auto-advance
  setTimeout(() => {
    nextFlashcard();
  }, isCorrect ? 1000 : 2000);
}

/* ════════════════════════════════════════════
   LEVENSHTEIN DISTANCE — So sánh chuỗi (typo)
   ════════════════════════════════════════════ */

function levenshteinDistance(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      const cost = a[j - 1] === b[i - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,     // deletion
        matrix[i][j - 1] + 1,     // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return matrix[b.length][a.length];
}

/* ════════════════════════════════════════════
   XP AWARD & GOOGLE SHEETS SYNC
   ════════════════════════════════════════════ */

function _getFlashcardTopicTitle() {
  const topic = flashcardTopics.find(t => t.id === currentTopicId);
  return topic ? topic.title : 'Flashcard';
}

function awardFlashcardXP(xpAmount, modeName, topicTitle) {
  if (!currentUser || !xpAmount) return;

  // Snapshot level before XP update
  let prevLv = 1;
  if (typeof getLevelInfo === 'function') {
    prevLv = getLevelInfo(currentUser.xp).cur.lv;
  }

  // Update local XP
  currentUser.xp += xpAmount;
  if (typeof getLevelInfo === 'function') {
    currentUser.level = getLevelInfo(currentUser.xp).cur.lv;
  }

  // Update streak date
  const today = new Date().toDateString();
  if (currentUser.lastDate !== today) {
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    currentUser.streak = currentUser.lastDate === yesterday ? currentUser.streak + 1 : 1;
    currentUser.lastDate = today;
  }

  // Persist session
  if (typeof saveSession === 'function') saveSession(currentUser);

  // Refresh UI elements
  if (typeof refreshGamiCard === 'function') refreshGamiCard();
  if (typeof showXPToast === 'function') showXPToast(xpAmount);

  // Check level up
  let newLv = prevLv;
  if (typeof getLevelInfo === 'function') {
    const newLvInfo = getLevelInfo(currentUser.xp);
    newLv = newLvInfo.cur.lv;
    if (newLv > prevLv && typeof showLevelUp === 'function') {
      setTimeout(() => showLevelUp(newLvInfo.cur), 600);
    }
  }

  // Sync to Google Sheets
  syncFlashcardXP(xpAmount, modeName, topicTitle);
}

async function syncFlashcardXP(xpEarned, modeName, topicTitle) {
  if (!CONFIG.SHEETS_URL || CONFIG.SHEETS_URL.includes('YOUR_SCRIPT_ID')) return;
  if (!currentUser) return;

  try {
    const params = new URLSearchParams({
      action: 'recordResult',
      student_id: currentUser.student_id,
      username: currentUser.username,
      unit: `Flashcard ${modeName}: ${topicTitle}`,
      difficulty: 'flashcard',
      score: 1,
      total: 1,
      pct: 100,
      xp_earned: xpEarned,
      new_xp: currentUser.xp,
      new_level: currentUser.level,
      streak: currentUser.streak,
      date: new Date().toLocaleDateString('vi-VN'),
      timestamp: new Date().toISOString(),
      recordJSON: JSON.stringify({
        id: 'FC_' + Date.now(),
        date: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        timestamp: Date.now(),
        studentName: currentUser.full_name,
        lessonName: `Flashcard ${modeName}: ${topicTitle}`,
        score: 1,
        total: 1,
        pct: 100,
        answers: []
      })
    });
    await fetch(CONFIG.SHEETS_URL + '?' + params);
  } catch (e) {
    // Silent fail — XP đã được lưu cục bộ
    console.warn('Flashcard XP sync failed:', e);
  }
}
