/* ════════════════════════════════════════════
   FLASHCARD SYSTEM
   ════════════════════════════════════════════ */

var flashcardTopics = [];
var currentFlashcards = [];
var currentCardIdx = 0;
var isAutoSpeakFlashcard = true;

async function openFlashcardTopicsPage() {
  showPage('page-flashcard-topics');
  const listContainer = document.getElementById('flashcard-topics-list');
  if (!listContainer) return;
  listContainer.innerHTML = '<div class="units-loading"><div class="loader"></div>Đang tải các chủ đề...</div>';
  
  try {
    if (flashcardTopics.length === 0) {
      const res = await fetch(`./content/flashcards/topics-index.json?t=${Date.now()}`);
      if (!res.ok) throw new Error();
      flashcardTopics = await res.json();
    }
    renderFlashcardTopics();
  } catch (e) {
    listContainer.innerHTML = '<div class="units-loading" style="color:var(--c-danger);">⚠️ Không thể tải danh sách chủ đề.<br><span style="font-size:.78rem;color:var(--c-muted);">Vui lòng kiểm tra file content/flashcards/topics-index.json</span></div>';
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
  
  showPage('page-flashcard');
  
  // Loading state on card
  const fcEnglish = document.getElementById('fc-english');
  const fcPhonetic = document.getElementById('fc-phonetic');
  const fcVietnamese = document.getElementById('fc-vietnamese');
  if (fcEnglish) fcEnglish.textContent = 'Đang tải từ vựng...';
  if (fcPhonetic) fcPhonetic.textContent = '';
  if (fcVietnamese) fcVietnamese.textContent = 'Loading...';
  
  try {
    const res = await fetch(`./content/flashcards/${topicId}.json?t=${Date.now()}`);
    if (!res.ok) throw new Error();
    currentFlashcards = await res.json();
    
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
  
  // Fill front
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
  
  // Fill back
  const viText = card.vietnamese || '';
  const viEl = document.getElementById('fc-vietnamese');
  if (viEl) {
    viEl.textContent = viText;
    viEl.classList.toggle('card-vietnamese--detail', /【Nghĩa】|【Giải thích】|【Dịch】/.test(viText));
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
  
  // Web Speech Auto-play
  if (isAutoSpeakFlashcard) {
    // Cancel any ongoing speech to avoid overlaps
    stopFlashcardSpeech();
    // Short timeout to let UI transition finish smoothly
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
  currentCardIdx = (currentCardIdx + 1) % currentFlashcards.length;
  renderCurrentCard();
}

function prevFlashcard() {
  if (currentFlashcards.length === 0) return;
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
  u.rate = card.type === 'example' ? 0.88 : 0.92; // Read sentences slightly slower for clarity
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
