/* ════════════════════════════════════════════════════════
   VIDEO MODULE — video.js
   Tính năng độc lập, không ảnh hưởng app.js
   Thầy có thể chỉnh sửa thoải mái file này
 ════════════════════════════════════════════════════════ */

/* ─── CACHE THÔNG MINH ─── */
const VIDEO_CACHE = {
  topics: null,
  topicVideos: {},
  quizzes: {},

  async getTopics() {
    if (this.topics) return this.topics;
    const res = await fetch(`${VIDEO_CONFIG.TOPICS_INDEX}?t=${Date.now()}`);
    if (!res.ok) throw new Error('Không tải được topics');
    this.topics = await res.json();
    return this.topics;
  },

  async getVideos(topicId) {
    if (this.topicVideos[topicId]) return this.topicVideos[topicId];
    const res = await fetch(`${VIDEO_CONFIG.VIDEOS_DIR}${topicId}/index.json?t=${Date.now()}`);
    if (!res.ok) throw new Error('Không tải được video');
    this.topicVideos[topicId] = await res.json();
    return this.topicVideos[topicId];
  },

  async getQuiz(topicId, youtubeId) {
    const key = `${topicId}-${youtubeId}`;
    if (this.quizzes[key]) return this.quizzes[key];
    try {
      const res = await fetch(`${VIDEO_CONFIG.VIDEOS_DIR}${topicId}/video-${youtubeId}-quiz.json?t=${Date.now()}`);
      if (!res.ok) return null;
      this.quizzes[key] = await res.json();
      return this.quizzes[key];
    } catch { return null; }
  }
};

/* ─── STATE ─── */
const VID = {
  currentTopicId: null,
  currentVideo: null,
  quizData: null,
  quizIndex: 0,
  quizScore: 0,
  quizAnswered: false,
};

/* ═══════════════════════════════════════════
   HERO VIDEO TRÊN TRANG CHỦ
   ═══════════════════════════════════════════ */
function videoInitHome() {
  const widget = document.getElementById('video-hero-widget');
  if (!widget) return;

  const videoId = VIDEO_CONFIG.HOME_VIDEO_ID;
  const title = VIDEO_CONFIG.HOME_VIDEO_TITLE;

  // Detect mobile: show thumbnail instead of iframe
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  if (isMobile) {
    widget.innerHTML = `
      <div class="video-hero-card" onclick="videoPlayHero()">
        <div class="video-hero-thumb-wrap">
          <img src="https://img.youtube.com/vi/${videoId}/hqdefault.jpg"
               alt="${title}" class="video-hero-thumb">
          <div class="video-hero-play-overlay">
            <div class="video-hero-play-btn">▶</div>
          </div>
          <span class="video-hero-badge">🎬 Video Nổi Bật</span>
        </div>
        <div class="video-hero-info">
          <div class="video-hero-title">${title}</div>
          <div class="video-hero-cta">Nhấn để xem video →</div>
        </div>
      </div>`;
  } else {
    widget.innerHTML = `
      <div class="video-hero-card">
        <div class="video-hero-iframe-wrap">
          <iframe
            src="https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=1&rel=0&modestbranding=1&playsinline=1"
            title="${title}"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
            loading="lazy">
          </iframe>
          <span class="video-hero-badge">🎬 Video Nổi Bật</span>
        </div>
        <div class="video-hero-info">
          <div class="video-hero-title">${title}</div>
          <div class="video-hero-cta" onclick="videoOpenFeatured()">Xem chi tiết & làm Quiz →</div>
        </div>
      </div>`;
  }
  widget.style.display = 'block';
}

function videoPlayHero() {
  const videoId = VIDEO_CONFIG.HOME_VIDEO_ID;
  const widget = document.getElementById('video-hero-widget');
  const card = widget.querySelector('.video-hero-card');
  card.onclick = null;
  card.querySelector('.video-hero-thumb-wrap').innerHTML = `
    <div class="video-hero-iframe-wrap">
      <iframe
        src="https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&rel=0&modestbranding=1&playsinline=1"
        title="${VIDEO_CONFIG.HOME_VIDEO_TITLE}"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen>
      </iframe>
    </div>`;
}

async function videoOpenFeatured() {
  // Find which topic contains the featured video
  try {
    const topics = await VIDEO_CACHE.getTopics();
    for (const topic of topics) {
      const videos = await VIDEO_CACHE.getVideos(topic.id);
      const found = videos.find(v => v.youtubeId === VIDEO_CONFIG.HOME_VIDEO_ID);
      if (found) {
        openVideoWatch(topic.id, found.id);
        return;
      }
    }
  } catch (e) {
    console.warn('Could not find featured video topic:', e);
  }
}

/* ═══════════════════════════════════════════
   TRANG 1: DANH SÁCH CHỦ ĐỀ VIDEO
   ═══════════════════════════════════════════ */
async function openVideoTopicsPage() {
  showPage('page-video-topics');
  const container = document.getElementById('video-topics-list');
  container.innerHTML = '<div class="units-loading"><div class="loader"></div>Đang tải...</div>';

  try {
    const topics = await VIDEO_CACHE.getTopics();
    renderVideoTopics(topics);
  } catch (e) {
    container.innerHTML = `
      <div class="units-loading" style="color:var(--c-danger);">
        ⚠️ Không thể tải danh sách chủ đề video.<br>
        <span style="font-size:.78rem;color:var(--c-muted);">
          Kiểm tra file: content/videos/topics-index.json
        </span>
      </div>`;
  }
}

function renderVideoTopics(topics) {
  const container = document.getElementById('video-topics-list');
  if (!topics.length) {
    container.innerHTML = '<div class="units-loading">📭 Chưa có chủ đề video nào.</div>';
    return;
  }
  container.innerHTML = topics.map((topic, i) => `
    <div class="video-topic-card" style="animation-delay:${i * .08}s; --accent: ${topic.color}"
      onclick="openVideoList('${topic.id}')">
      <div class="video-topic-icon" style="background: ${topic.color}15; color: ${topic.color}">
        ${topic.icon}
      </div>
      <div class="video-topic-info">
        <div class="video-topic-title">${topic.title}</div>
        <div class="video-topic-desc">${topic.description}</div>
      </div>
      <div class="video-topic-count">
        <div class="video-topic-count-num">${topic.videoCount}</div>
        <div class="video-topic-count-label">video</div>
      </div>
      <div class="cat-arrow">›</div>
    </div>
  `).join('');
}

/* ═══════════════════════════════════════════
   TRANG 2: DANH SÁCH VIDEO TRONG CHỦ ĐỀ
   ═══════════════════════════════════════════ */
async function openVideoList(topicId) {
  VID.currentTopicId = topicId;
  showPage('page-video-list');

  // Update nav title
  try {
    const topics = await VIDEO_CACHE.getTopics();
    const topic = topics.find(t => t.id === topicId);
    if (topic) {
      document.getElementById('video-list-nav-title').textContent = topic.title;
      document.getElementById('video-list-header-icon').textContent = topic.icon;
      document.getElementById('video-list-header-title').textContent = topic.title;
      document.getElementById('video-list-header-desc').textContent =
        `${topic.videoCount} video · ${topic.description}`;
    }
  } catch {}

  const container = document.getElementById('video-list-container');
  container.innerHTML = '<div class="units-loading"><div class="loader"></div>Đang tải...</div>';

  try {
    const videos = await VIDEO_CACHE.getVideos(topicId);
    renderVideoList(videos, topicId);
  } catch (e) {
    container.innerHTML = `
      <div class="units-loading" style="color:var(--c-danger);">
        ⚠️ Không thể tải danh sách video.<br>
        <span style="font-size:.78rem;color:var(--c-muted);">
          Kiểm tra file: content/videos/${topicId}/index.json
        </span>
      </div>`;
  }
}

function renderVideoList(videos, topicId) {
  const container = document.getElementById('video-list-container');
  if (!videos.length) {
    container.innerHTML = '<div class="units-loading">📭 Chưa có video nào trong chủ đề này.</div>';
    return;
  }
  container.innerHTML = videos.map((video, i) => `
    <div class="video-card" style="animation-delay:${i * .08}s"
      onclick="openVideoWatch('${topicId}', '${video.id}')">
      <div class="video-card-thumb">
        <img data-src="${video.thumbnail}"
             src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='320' height='180'%3E%3Crect fill='%23e5e7eb' width='320' height='180'/%3E%3C/svg%3E"
             alt="${video.title}" class="video-thumb" loading="lazy">
        <div class="video-card-duration">${video.duration}</div>
        ${video.featured ? '<span class="video-card-featured">⭐ Nổi bật</span>' : ''}
      </div>
      <div class="video-card-body">
        <div class="video-card-title">${video.titleVi || video.title}</div>
        <div class="video-card-meta">
          <span class="video-card-channel">📺 ${video.channel}</span>
          <span class="video-card-level video-level-${video.level}">${
            video.level === 'beginner' ? '🌱 Cơ bản' :
            video.level === 'intermediate' ? '🌿 Trung bình' : '🌳 Nâng cao'
          }</span>
        </div>
        ${video.hasQuiz ? '<span class="video-card-quiz-badge">❓ Có Quiz</span>' : ''}
      </div>
    </div>
  `).join('');

  // Lazy load thumbnails
  videoLazyLoadThumbs();
}

function videoLazyLoadThumbs() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }
        observer.unobserve(img);
      }
    });
  }, { rootMargin: '100px' });

  document.querySelectorAll('.video-thumb[data-src]').forEach(img => observer.observe(img));
}

/* ═══════════════════════════════════════════
   TRANG 3: XEM VIDEO + QUIZ
   ═══════════════════════════════════════════ */
async function openVideoWatch(topicId, videoId) {
  VID.currentTopicId = topicId;
  showPage('page-video-watch');

  const playerWrap = document.getElementById('video-player-wrap');
  const vocabContainer = document.getElementById('video-vocab-container');
  const quizContainer = document.getElementById('video-quiz-container');

  playerWrap.innerHTML = '<div class="units-loading"><div class="loader"></div>Đang tải video...</div>';
  vocabContainer.innerHTML = '';
  quizContainer.innerHTML = '';

  try {
    const videos = await VIDEO_CACHE.getVideos(topicId);
    const video = videos.find(v => v.id === videoId);
    if (!video) throw new Error('Video not found');

    VID.currentVideo = video;

    // Update nav title
    document.getElementById('video-watch-nav-title').textContent = video.titleVi || video.title;

    // Render iframe
    playerWrap.innerHTML = `
      <iframe
        src="https://www.youtube.com/embed/${video.youtubeId}?rel=0&modestbranding=1&playsinline=1"
        title="${video.title}"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen>
      </iframe>`;

    // Render video info
    document.getElementById('video-watch-title').textContent = video.titleVi || video.title;
    document.getElementById('video-watch-subtitle').textContent = video.title;
    document.getElementById('video-watch-meta').innerHTML = `
      <span>📺 ${video.channel}</span>
      <span>⏱ ${video.duration}</span>
      <span class="video-level-${video.level}">${
        video.level === 'beginner' ? '🌱 Cơ bản' :
        video.level === 'intermediate' ? '🌿 Trung bình' : '🌳 Nâng cao'
      }</span>`;

    // Render vocabulary
    renderVideoVocab(video.keyVocabulary);

    // Load quiz if available
    if (video.hasQuiz) {
      const quiz = await VIDEO_CACHE.getQuiz(topicId, video.youtubeId);
      if (quiz && quiz.length) {
        VID.quizData = quiz;
        VID.quizIndex = 0;
        VID.quizScore = 0;
        renderVideoQuiz();
      } else {
        quizContainer.innerHTML = '<div class="video-quiz-empty">📝 Quiz đang được cập nhật...</div>';
      }
    } else {
      quizContainer.innerHTML = '<div class="video-quiz-empty">📝 Video này chưa có quiz</div>';
    }

    // Default show vocab tab
    videoSwitchTab('vocab');

  } catch (e) {
    playerWrap.innerHTML = `
      <div class="units-loading" style="color:var(--c-danger);">
        ⚠️ Không thể tải video.<br>
        <span style="font-size:.78rem;color:var(--c-muted);">${e.message}</span>
      </div>`;
  }
}

/* ─── TAB SWITCHER ─── */
function videoSwitchTab(tab) {
  document.querySelectorAll('.video-tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`.video-tab-btn[data-tab="${tab}"]`)?.classList.add('active');

  document.getElementById('video-vocab-container').style.display = tab === 'vocab' ? 'block' : 'none';
  document.getElementById('video-quiz-container').style.display = tab === 'quiz' ? 'block' : 'none';
}

/* ─── VOCABULARY ─── */
function renderVideoVocab(vocabList) {
  const container = document.getElementById('video-vocab-container');
  if (!vocabList || !vocabList.length) {
    container.innerHTML = '<div class="video-quiz-empty">📖 Chưa có từ vựng cho video này</div>';
    return;
  }
  container.innerHTML = `
    <div class="video-vocab-list">
      ${vocabList.map((word, i) => `
        <div class="video-vocab-item" style="animation-delay:${i * .06}s">
          <div class="video-vocab-word">${word}</div>
          <button class="video-vocab-speak" onclick="videoSpeakWord('${word.replace(/'/g, "\\'")}')" title="Nghe phát âm">
            🔊
          </button>
        </div>
      `).join('')}
    </div>
    <div class="video-vocab-hint">💡 Nhấn 🔊 để nghe phát âm từng từ</div>`;
}

function videoSpeakWord(word) {
  if (window.speechSynthesis.speaking) window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(word);
  utt.lang = 'en-US';
  utt.rate = 0.85;
  const voices = window.speechSynthesis.getVoices();
  const best = voices.find(v => v.lang === 'en-US' && v.localService)
    || voices.find(v => v.lang.startsWith('en'))
    || voices[0];
  if (best) utt.voice = best;
  window.speechSynthesis.speak(utt);
}

/* ─── QUIZ ENGINE ─── */
function renderVideoQuiz() {
  const container = document.getElementById('video-quiz-container');
  const quiz = VID.quizData;

  if (VID.quizIndex >= quiz.length) {
    // Show results
    const pct = Math.round((VID.quizScore / quiz.length) * 100);
    const emoji = pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '💪';
    container.innerHTML = `
      <div class="video-quiz-result">
        <div class="video-quiz-result-emoji">${emoji}</div>
        <div class="video-quiz-result-score">${pct}%</div>
        <div class="video-quiz-result-text">${VID.quizScore}/${quiz.length} câu đúng</div>
        <button class="video-quiz-retry-btn" onclick="videoRetryQuiz()">🔄 Làm lại Quiz</button>
      </div>`;
    return;
  }

  const q = quiz[VID.quizIndex];
  VID.quizAnswered = false;

  let questionHTML = '';
  if (q.type === 'multiple_choice') {
    questionHTML = `
      <div class="video-quiz-card">
        <div class="video-quiz-progress">Câu ${VID.quizIndex + 1}/${quiz.length}</div>
        ${q.timestamp ? `<div class="video-quiz-timestamp">⏱ Tại ${q.timestamp}</div>` : ''}
        <div class="video-quiz-question">${q.question}</div>
        <div class="video-quiz-options">
          ${q.options.map((opt, i) => `
            <button class="video-quiz-option" data-answer="${opt}" onclick="videoCheckAnswer(this, '${q.type}')">
              <span class="video-quiz-option-letter">${String.fromCharCode(65 + i)}</span>
              <span class="video-quiz-option-text">${opt}</span>
            </button>
          `).join('')}
        </div>
        <div class="video-quiz-feedback" id="video-quiz-feedback" style="display:none;"></div>
      </div>`;
  } else if (q.type === 'fill_blank') {
    questionHTML = `
      <div class="video-quiz-card">
        <div class="video-quiz-progress">Câu ${VID.quizIndex + 1}/${quiz.length}</div>
        ${q.timestamp ? `<div class="video-quiz-timestamp">⏱ Tại ${q.timestamp}</div>` : ''}
        <div class="video-quiz-question">${q.question}</div>
        <div class="video-quiz-fill-wrap">
          <input type="text" class="video-quiz-fill-input" id="video-quiz-fill-input"
            placeholder="Nhập câu trả lời..." autocomplete="off" spellcheck="false"
            onkeydown="if(event.key==='Enter') videoCheckFillAnswer()">
          <button class="video-quiz-fill-btn" onclick="videoCheckFillAnswer()">Kiểm tra ✓</button>
        </div>
        <div class="video-quiz-feedback" id="video-quiz-feedback" style="display:none;"></div>
      </div>`;
  }

  container.innerHTML = questionHTML;
}

function videoCheckAnswer(btn, type) {
  if (VID.quizAnswered) return;
  VID.quizAnswered = true;

  const q = VID.quizData[VID.quizIndex];
  const selected = btn.dataset.answer;
  const correct = selected === q.answer;

  if (correct) VID.quizScore++;

  // Highlight buttons
  document.querySelectorAll('.video-quiz-option').forEach(b => {
    b.disabled = true;
    if (b.dataset.answer === q.answer) {
      b.classList.add('correct');
    } else if (b === btn && !correct) {
      b.classList.add('wrong');
    }
  });

  // Show feedback
  const feedback = document.getElementById('video-quiz-feedback');
  feedback.style.display = 'block';
  feedback.className = `video-quiz-feedback ${correct ? 'correct' : 'wrong'}`;
  feedback.innerHTML = `
    <div class="video-quiz-feedback-icon">${correct ? '✅' : '❌'}</div>
    <div class="video-quiz-feedback-text">
      ${correct ? 'Chính xác!' : `Đáp án đúng: ${q.answer}`}
      ${q.explanation ? `<div class="video-quiz-explanation">${q.explanation}</div>` : ''}
    </div>`;

  // Auto next after delay
  setTimeout(() => {
    VID.quizIndex++;
    renderVideoQuiz();
  }, correct ? 1500 : 3000);
}

function videoCheckFillAnswer() {
  if (VID.quizAnswered) return;
  const input = document.getElementById('video-quiz-fill-input');
  const userAnswer = input.value.trim().toLowerCase();
  if (!userAnswer) return;

  VID.quizAnswered = true;
  const q = VID.quizData[VID.quizIndex];
  const correct = userAnswer === q.answer.toLowerCase();

  if (correct) VID.quizScore++;

  input.disabled = true;
  input.classList.add(correct ? 'correct' : 'wrong');
  document.querySelector('.video-quiz-fill-btn').disabled = true;

  const feedback = document.getElementById('video-quiz-feedback');
  feedback.style.display = 'block';
  feedback.className = `video-quiz-feedback ${correct ? 'correct' : 'wrong'}`;
  feedback.innerHTML = `
    <div class="video-quiz-feedback-icon">${correct ? '✅' : '❌'}</div>
    <div class="video-quiz-feedback-text">
      ${correct ? 'Chính xác!' : `Đáp án đúng: <strong>${q.answer}</strong>`}
      ${q.explanation ? `<div class="video-quiz-explanation">${q.explanation}</div>` : ''}
    </div>`;

  setTimeout(() => {
    VID.quizIndex++;
    renderVideoQuiz();
  }, correct ? 1500 : 3000);
}

function videoRetryQuiz() {
  VID.quizIndex = 0;
  VID.quizScore = 0;
  renderVideoQuiz();
}

/* ─── NAVIGATION ─── */
function videoGoBack() {
  const watchPage = document.getElementById('page-video-watch');
  const listPage = document.getElementById('page-video-list');

  if (watchPage.classList.contains('active')) {
    // Stop any playing iframe
    const iframe = watchPage.querySelector('iframe');
    if (iframe) iframe.src = '';
    if (VID.currentTopicId) {
      openVideoList(VID.currentTopicId);
    } else {
      openVideoTopicsPage();
    }
  } else if (listPage.classList.contains('active')) {
    openVideoTopicsPage();
  } else {
    showPage('page-home');
  }
}

/* ─── INIT ON HOME ─── */
document.addEventListener('DOMContentLoaded', () => {
  // Chỉ init hero video khi trang home đã load
  setTimeout(videoInitHome, 300);
});
