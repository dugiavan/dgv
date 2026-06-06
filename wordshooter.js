/* ════════════════════════════════════════════
   WORD SHOOTER MODULE — wordshooter.js
   Tính năng độc lập, không ảnh hưởng app.js
════════════════════════════════════════════ */

const WS = {
  topics: [],
  topic: null,
  topicTitle: '',
  words: [],
  activeWords: [],
  targetWord: null,
  score: 0,
  lives: 3,
  level: 1,
  combo: 0,
  correctStreak: 0,
  running: false,
  paused: false,
  animFrame: null,
  lastSpawn: 0,
  lastFrame: 0,
  shipId: 'classic',
  bgId: 'space',
  ship: null,
  bg: null,
  effects: [],
  canvas: null,
  ctx: null,
  dpr: 1,
  width: 0,
  height: 0,
  hudBottom: 0,
  shipX: 0,
  shipY: 0,
  shipW: 56,
  shipH: 48,
  shipPaddingX: 40,
  keys: { left: false, right: false },
  pointer: null,
  totalXpEarned: 0,
  maxCombo: 0,
  setup: { topicId: null, shipId: null, bgId: null },
  canvasReady: false,
  inputReady: false,
};

/* ── HELPERS ──────────────────────────────── */

function wsRoundRect(ctx, x, y, w, h, r) {
  if (typeof ctx.roundRect === 'function') {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    return;
  }
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function wsGetUserLevel() {
  if (!currentUser || typeof getLevelInfo !== 'function') return 1;
  return getLevelInfo(currentUser.xp).cur.lv;
}

function wsIsUnlocked(item) {
  return wsGetUserLevel() >= (item.unlockLevel || 1);
}

function wsMaxWordsOnScreen(level) {
  const cfg = WORDSHOOTER_CONFIG;
  if (level <= 1) return 4;
  if (level <= 2) return 5;
  return Math.min(cfg.MAX_WORDS_ON_SCREEN || 6, 5 + Math.floor((level - 3) / 2));
}

function wsFallSpeed(level) {
  const cfg = WORDSHOOTER_CONFIG;
  return cfg.FALL_SPEED_BASE + (level - 1) * cfg.FALL_SPEED_SCALE;
}

function wsScoreForHit(combo) {
  if (combo >= 3) return 30;
  if (combo >= 2) return 20;
  return 10;
}

function wsShortVi(text) {
  if (!text) return '---';
  let s = String(text).replace(/\n/g, ' ').trim();
  const match = s.match(/【Nghĩa】\s*([^【]+)/);
  if (match) s = match[1].trim();
  else s = s.split('【')[0].trim();
  if (s.length > 42) s = s.slice(0, 39) + '…';
  return s;
}

function wsClampShipX(x) {
  const pad = WS.shipPaddingX;
  return Math.max(pad, Math.min(WS.width - pad, x));
}

function wsMoveShipTo(x) {
  WS.shipX = wsClampShipX(x);
}

/* ── SOUND SYSTEM (Web Audio API) ─────────── */
const WS_Audio = {
  ctx: null,
  muted: false,
  volume: 0.6,

  init() {
    if (this.ctx) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (_) {}
  },

  _r() {
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  },

  _seq(notes, type) {
    if (this.muted || !this.ctx) return;
    this._r();
    const t = this.ctx.currentTime;
    notes.forEach(([freq, delay, dur, vol]) => {
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = type || 'sine';
      o.frequency.setValueAtTime(freq, t + delay);
      g.gain.setValueAtTime(0, t);
      g.gain.setValueAtTime((vol || 0.18) * this.volume, t + delay);
      g.gain.exponentialRampToValueAtTime(0.001, t + delay + dur);
      o.connect(g).connect(this.ctx.destination);
      o.start(t + delay);
      o.stop(t + delay + dur);
    });
  },

  shoot() {
    if (this.muted || !this.ctx) return;
    this._r();
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = 'square';
    o.frequency.setValueAtTime(880, t);
    o.frequency.exponentialRampToValueAtTime(220, t + 0.1);
    g.gain.setValueAtTime(0.1 * this.volume, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    o.connect(g).connect(this.ctx.destination);
    o.start(t); o.stop(t + 0.12);
  },

  hit() {
    this._seq([[587, 0, 0.15, 0.2], [880, 0.08, 0.2, 0.22]], 'sine');
  },

  combo() {
    this._seq([[659, 0, 0.12, 0.15], [784, 0.08, 0.12, 0.17], [988, 0.16, 0.15, 0.2]], 'sine');
  },

  miss() {
    if (this.muted || !this.ctx) return;
    this._r();
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(200, t);
    o.frequency.exponentialRampToValueAtTime(100, t + 0.15);
    g.gain.setValueAtTime(0.1 * this.volume, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    o.connect(g).connect(this.ctx.destination);
    o.start(t); o.stop(t + 0.18);
  },

  loseLife() {
    this._seq([[440, 0, 0.12, 0.18], [330, 0.12, 0.12, 0.16], [220, 0.24, 0.18, 0.14]], 'triangle');
  },

  gameOver() {
    this._seq([[392, 0, 0.3, 0.2], [349, 0.2, 0.3, 0.18], [330, 0.4, 0.3, 0.16], [262, 0.6, 0.5, 0.2]], 'sine');
  },

  levelUp() {
    this._seq([[523, 0, 0.15, 0.18], [659, 0.07, 0.15, 0.2], [784, 0.14, 0.15, 0.2], [1047, 0.21, 0.25, 0.22]], 'sine');
  },

  toggle() {
    this.muted = !this.muted;
    return !this.muted;
  }
};

function wsUpdateShipSize() {
  const compact = WS.width < 768;
  WS.shipW = compact ? 76 : 64;
  WS.shipH = compact ? 66 : 54;
  WS.shipPaddingX = Math.max(WS.shipW / 2 + 10, 36);
}

function wsGetViewportSize() {
  const vv = window.visualViewport;
  return {
    width: vv ? vv.width : window.innerWidth,
    height: vv ? vv.height : window.innerHeight,
  };
}

function wsPickTarget() {
  if (WS.words.length === 0) return null;

  // 1. Ưu tiên chọn từ các từ đang chạy trên màn hình (để người chơi luôn có mục tiêu để bắn ngay)
  const activeCandidates = WS.activeWords.filter(aw => !aw.missed);
  if (activeCandidates.length > 0) {
    const chosenActive = activeCandidates[Math.floor(Math.random() * activeCandidates.length)];
    const wordInfo = WS.words.find(w => w.id === chosenActive.wordId);
    if (wordInfo) return wordInfo;
  }

  // 2. Nếu không có từ nào, chọn từ bể từ chưa lên màn hình
  const pool = WS.words.filter(w =>
    !WS.activeWords.some(aw => aw.wordId === w.id) &&
    (!WS.targetWord || w.id !== WS.targetWord.id)
  );
  const candidates = pool.length > 0 ? pool : WS.words;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

function wsMeasureWord(ctx, text) {
  const compact = WS.width < 768;
  const fontSize = compact ? 14 : 15;
  ctx.font = `700 ${fontSize}px Quicksand, sans-serif`;
  const tw = ctx.measureText(text).width;
  return { w: tw + (compact ? 24 : 28), h: compact ? 32 : 34 };
}

/* ── CANVAS SETUP ─────────────────────────── */

function wsBindInput() {
  if (WS.inputReady || !WS.canvas) return;

  WS.canvas.addEventListener('pointerdown', wsOnPointerDown);
  WS.canvas.addEventListener('pointermove', wsOnPointerMove);
  WS.canvas.addEventListener('pointerup', wsOnPointerUp);
  WS.canvas.addEventListener('pointercancel', wsOnPointerUp);
  window.addEventListener('keydown', wsOnKeyDown);
  window.addEventListener('keyup', wsOnKeyUp);

  WS.inputReady = true;
}

function wsOnKeyDown(e) {
  if (!WS.running || WS.paused) return;
  if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') WS.keys.left = true;
  if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') WS.keys.right = true;
}

function wsOnKeyUp(e) {
  if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') WS.keys.left = false;
  if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') WS.keys.right = false;
}

function wsOnPointerDown(e) {
  if (!WS.running || WS.paused) return;
  e.preventDefault();
  WS.canvas.setPointerCapture(e.pointerId);
  const pos = wsGetCanvasPos(e);
  WS.pointer = {
    id: e.pointerId,
    startX: pos.x,
    startY: pos.y,
    moved: false,
  };
  wsMoveShipTo(pos.x);
}

function wsOnPointerMove(e) {
  if (!WS.pointer || WS.pointer.id !== e.pointerId) return;
  const pos = wsGetCanvasPos(e);
  if (Math.abs(pos.x - WS.pointer.startX) > 6 || Math.abs(pos.y - WS.pointer.startY) > 6) {
    WS.pointer.moved = true;
  }
  wsMoveShipTo(pos.x);
}

function wsOnPointerUp(e) {
  if (!WS.pointer || WS.pointer.id !== e.pointerId) return;
  if (!WS.pointer.moved) {
    const pos = wsGetCanvasPos(e);
    wsShootAt(pos.x, pos.y);
  }
  WS.pointer = null;
  try { WS.canvas.releasePointerCapture(e.pointerId); } catch (_) { /* ignore */ }
}

function wsUpdateShip(dt) {
  if (!WS.running || WS.paused) return;
  const factor = dt / 16.67;
  const speed = (WORDSHOOTER_CONFIG.SHIP_SPEED || 8) * factor;
  if (WS.keys.left) wsMoveShipTo(WS.shipX - speed);
  if (WS.keys.right) wsMoveShipTo(WS.shipX + speed);
}

/* ── CANVAS SETUP ─────────────────────────── */

function wsInitCanvas() {
  if (WS.canvasReady) {
    wsResizeCanvas();
    return;
  }
  WS.canvas = document.getElementById('ws-canvas');
  if (!WS.canvas) return;
  WS.ctx = WS.canvas.getContext('2d');
  wsResizeCanvas();
  wsBindInput();
  window.addEventListener('resize', wsResizeCanvas);
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', wsResizeCanvas);
    window.visualViewport.addEventListener('scroll', wsResizeCanvas);
  }
  WS.canvasReady = true;
}

function wsResizeCanvas() {
  if (!WS.canvas || !WS.ctx) return;
  const gamePage = document.getElementById('page-wordshooter-game');
  if (!gamePage || !gamePage.classList.contains('active')) return;

  const hud = gamePage.querySelector('.ws-hud');
  const hint = document.getElementById('ws-mobile-hint');
  const hudH = hud ? hud.offsetHeight : 72;
  const hintH = hint && window.matchMedia('(max-width: 1024px)').matches ? hint.offsetHeight : 0;
  const { width, height } = wsGetViewportSize();

  WS.dpr = Math.min(window.devicePixelRatio || 1, 2);
  WS.width = width;
  WS.height = Math.max(200, height - hudH - hintH);
  WS.hudBottom = hudH + hintH;

  wsUpdateShipSize();

  WS.canvas.style.width = WS.width + 'px';
  WS.canvas.style.height = WS.height + 'px';
  WS.canvas.width = Math.floor(WS.width * WS.dpr);
  WS.canvas.height = Math.floor(WS.height * WS.dpr);
  WS.ctx.setTransform(WS.dpr, 0, 0, WS.dpr, 0, 0);

  WS.shipX = wsClampShipX(WS.shipX || WS.width / 2);
  WS.shipY = WS.height - WS.shipH * 0.45 - 12;

  if (WS.bg && WS.bg._init) {
    WS.bg._lastW = WS.width;
    WS.bg._lastH = WS.height;
    WS.bg._stars = null;
  }
}

/* ── INPUT ────────────────────────────────── */

function wsGetCanvasPos(e) {
  const rect = WS.canvas.getBoundingClientRect();
  const clientX = e.clientX ?? (e.touches && e.touches[0]?.clientX);
  const clientY = e.clientY ?? (e.touches && e.touches[0]?.clientY);
  return {
    x: clientX - rect.left,
    y: clientY - rect.top,
  };
}

function wsShootAt(x, y) {
  const hit = WS.activeWords.find(w =>
    x >= w.x - w.w / 2 && x <= w.x + w.w / 2 &&
    y >= w.y - w.h / 2 && y <= w.y + w.h / 2
  );
  if (hit) wsShoot(hit.id);
}

function wsShoot(wordId) {
  const word = WS.activeWords.find(w => w.id === wordId);
  if (!word) return;

  WS_Audio.shoot();
  const ship = WS_SHIPS[WS.shipId] || WS_SHIPS.classic;
  wsAddBulletEffect(WS.shipX, WS.shipY - WS.shipH * 0.3, word.x, word.y, ship.shootEffect);

  if (WS.targetWord && word.wordId === WS.targetWord.id) {
    wsHandleHit(word);
  } else {
    wsHandleMiss(word);
  }
}

function wsHandleHit(word) {
  WS.combo += 1;
  WS.correctStreak += 1;
  WS.maxCombo = Math.max(WS.maxCombo, WS.combo);
  const pts = wsScoreForHit(WS.combo);
  WS.score += pts;

  wsAddExplosion(word.x, word.y, 'explosion_hit');
  wsAddFloatingText(word.x, word.y - 20, '+' + pts, WS.combo >= 3 ? '#ffd700' : '#4ade80');

  WS_Audio.hit();
  if (WS.combo >= 3) WS_Audio.combo();

  WS.activeWords = WS.activeWords.filter(w => w.id !== word.id);

  const xp = WORDSHOOTER_CONFIG.XP_PER_CORRECT;
  WS.totalXpEarned += xp;
  if (typeof awardFlashcardXP === 'function') {
    awardFlashcardXP(xp, 'Word Shooter', WS.topicTitle);
  }

  if (WS.correctStreak > 0 && WS.correctStreak % 5 === 0) {
    WS.level += 1;
    WS_Audio.levelUp();
  }

  WS.targetWord = wsPickTarget();
  // Force spawn ngay nếu target mới chưa trên màn hình
  if (WS.targetWord && !WS.activeWords.some(aw => aw.wordId === WS.targetWord.id)) {
    WS.lastSpawn = 0;
  }
  wsUpdateHUD();
}

function wsHandleMiss(word) {
  WS.combo = 0;
  WS.score = Math.max(0, WS.score - 5);
  wsAddExplosion(word.x, word.y, 'explosion_miss');
  wsAddFloatingText(word.x, word.y - 20, '-5', '#ef4444');
  WS_Audio.miss();
  wsUpdateHUD();
}

function wsCheckMiss() {
  const bottom = WS.shipY - WS.shipH * 0.2;
  const missed = [];
  WS.activeWords.forEach(word => {
    if (word.y + word.h / 2 >= bottom && !word.missed) {
      word.missed = true;
      missed.push(word);
    }
  });

  if (missed.length === 0) return;

  missed.forEach(word => {
    WS.lives -= 1;
    WS.combo = 0;
    WS_Audio.loseLife();
    // Nếu target bị miss → chọn target mới
    if (WS.targetWord && word.wordId === WS.targetWord.id) {
      WS.targetWord = wsPickTarget();
    }
    WS.shakeUntil = performance.now() + 300;
  });

  WS.activeWords = WS.activeWords.filter(w => !w.missed);
  wsUpdateHUD();
  if (WS.lives <= 0) wsGameOver();
}

/* ── EFFECTS ──────────────────────────────── */

function wsAddBulletEffect(x1, y1, x2, y2, effectId) {
  const fx = WS_EFFECTS[effectId] || WS_EFFECTS.bullet_green;
  WS.effects.push({
    type: 'bullet',
    fx,
    x1, y1, x2, y2,
    start: performance.now(),
    duration: fx.duration || 300,
  });
}

function wsAddExplosion(x, y, effectId) {
  const fx = WS_EFFECTS[effectId];
  if (!fx) return;
  WS.effects.push({
    type: 'explosion',
    fx,
    x, y,
    start: performance.now(),
    duration: fx.duration || 400,
  });
}

function wsAddFloatingText(x, y, text, color) {
  WS.effects.push({
    type: 'floatingText',
    x, y, text,
    color: color || '#4ade80',
    start: performance.now(),
    duration: 800,
  });
}

function wsUpdateEffects(now) {
  WS.effects = WS.effects.filter(eff => {
    const elapsed = now - eff.start;
    return elapsed < eff.duration;
  });
}

function wsDrawEffects(now) {
  const ctx = WS.ctx;
  WS.effects.forEach(eff => {
    const elapsed = now - eff.start;
    const progress = Math.min(1, elapsed / eff.duration);
    if (eff.type === 'bullet') {
      eff.fx.draw(ctx, eff.x1, eff.y1, eff.x2, eff.y2, progress);
    } else if (eff.type === 'explosion') {
      const frame = Math.floor(progress * (eff.fx.frames || 8));
      eff.fx.draw(ctx, eff.x, eff.y, frame);
    } else if (eff.type === 'floatingText') {
      const alpha = 1 - progress;
      const offsetY = progress * -40;
      const scale = 1 + progress * 0.3;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(eff.x, eff.y + offsetY);
      ctx.scale(scale, scale);
      ctx.font = '700 16px Quicksand, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = eff.color;
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 4;
      ctx.fillText(eff.text, 0, 0);
      ctx.restore();
    }
  });
}

/* ── SPAWN & UPDATE ───────────────────────── */

function wsSpawnWord() {
  const maxOnScreen = wsMaxWordsOnScreen(WS.level);
  if (WS.activeWords.length >= maxOnScreen) return;
  if (WS.words.length === 0) return;

  const available = WS.words.filter(w =>
    !WS.activeWords.some(aw => aw.wordId === w.id)
  );
  const targetOnScreen = WS.targetWord &&
    WS.activeWords.some(aw => aw.wordId === WS.targetWord.id);

  let src;
  if (WS.targetWord && !targetOnScreen) {
    src = WS.targetWord;
  } else {
    const pool = available.length > 0 ? available : WS.words;
    src = pool[Math.floor(Math.random() * pool.length)];
  }

  const ctx = WS.ctx;
  const size = wsMeasureWord(ctx, src.english);
  const padding = size.w / 2 + 12;

  // Anti-overlap: tìm vị trí X không chồng với từ ở gần đỉnh màn hình
  let x, attempts = 0;
  do {
    x = padding + Math.random() * (WS.width - padding * 2);
    attempts++;
  } while (attempts < 10 && WS.activeWords.some(aw =>
    Math.abs(aw.x - x) < (aw.w / 2 + size.w / 2 + 20) && aw.y < size.h * 3
  ));

  WS.activeWords.push({
    id: 'w_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
    wordId: src.id,
    english: src.english,
    vietnamese: src.vietnamese,
    x,
    y: -size.h,
    w: size.w,
    h: size.h,
    speed: wsFallSpeed(WS.level),
    missed: false,
  });
}

function wsUpdateWords(dt) {
  const factor = dt / 16.67;
  WS.activeWords.forEach(word => {
    word.y += word.speed * factor;
  });
}

/* ── RENDER ───────────────────────────────── */

function wsRender(timestamp) {
  const ctx = WS.ctx;
  if (!ctx) return;

  // Screen shake khi mất mạng
  const shaking = WS.shakeUntil && timestamp < WS.shakeUntil;
  if (shaking) {
    const intensity = ((WS.shakeUntil - timestamp) / 300) * 5;
    ctx.save();
    ctx.translate(
      (Math.random() - 0.5) * intensity,
      (Math.random() - 0.5) * intensity
    );
  }

  if (WS.bg) {
    WS.bg._lastW = WS.width;
    WS.bg._lastH = WS.height;
    WS.bg.draw(ctx, WS.width, WS.height, timestamp);
    if (WS.bg.update) WS.bg.update(timestamp);
  }

  WS.activeWords.forEach(word => {
    const isTarget = WS.targetWord && word.wordId === WS.targetWord.id;
    ctx.save();
    ctx.translate(word.x, word.y);

    ctx.beginPath();
    wsRoundRect(ctx, -word.w / 2, -word.h / 2, word.w, word.h, 10);
    ctx.fillStyle = isTarget ? 'rgba(74, 140, 92, 0.25)' : 'rgba(255,255,255,0.12)';
    ctx.fill();
    ctx.strokeStyle = isTarget ? '#4ade80' : 'rgba(255,255,255,0.35)';
    ctx.lineWidth = isTarget ? 2 : 1;
    ctx.stroke();

    ctx.font = '700 15px Quicksand, sans-serif';
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(word.english, 0, 1);
    ctx.restore();
  });

  wsDrawEffects(timestamp);

  // Vệt sáng dưới máy bay
  ctx.beginPath();
  ctx.ellipse(WS.shipX, WS.shipY + WS.shipH * 0.28, WS.shipW * 0.55, 10, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(74, 222, 128, 0.22)';
  ctx.fill();

  const ship = WS_SHIPS[WS.shipId] || WS_SHIPS.classic;
  ship.draw(ctx, WS.shipX, WS.shipY, WS.shipW, WS.shipH, timestamp);

  if (shaking) ctx.restore();
}

function wsUpdateHUD() {
  const livesEl = document.getElementById('ws-lives');
  const levelEl = document.getElementById('ws-level');
  const scoreEl = document.getElementById('ws-score');
  const comboEl = document.getElementById('ws-combo');
  const targetEl = document.getElementById('ws-target-word');

  if (livesEl) livesEl.textContent = '❤️'.repeat(Math.max(0, WS.lives)) + (WS.lives <= 0 ? '' : '');
  if (levelEl) levelEl.textContent = 'Lv.' + WS.level;
  if (scoreEl) scoreEl.textContent = WS.score.toLocaleString('vi-VN');
  if (comboEl) {
    comboEl.textContent = WS.combo >= 2 ? `🔥 x${WS.combo}` : '';
    comboEl.classList.toggle('ws-combo-active', WS.combo >= 2);
  }
  if (targetEl) {
    targetEl.textContent = WS.targetWord ? wsShortVi(WS.targetWord.vietnamese) : '---';
    targetEl.title = WS.targetWord ? WS.targetWord.vietnamese : '';
  }
}

/* ── ENGINE LOOP ──────────────────────────── */

function wsGameLoop(timestamp) {
  if (!WS.running) return;
  if (WS.paused) {
    WS.animFrame = requestAnimationFrame(wsGameLoop);
    return;
  }

  if (!WS.lastFrame) WS.lastFrame = timestamp;
  const dt = Math.min(timestamp - WS.lastFrame, 50);
  WS.lastFrame = timestamp;

  const cfg = WORDSHOOTER_CONFIG;
  const spawnInterval = Math.max(800, cfg.SPAWN_INTERVAL_MS - (WS.level - 1) * 80);
  const maxW = wsMaxWordsOnScreen(WS.level);

  // Nhịp độ spawn mượt mà hơn:
  // Nếu màn hình quá trống (dưới 60% số từ tối đa), spawn bù ngay lập tức (giới hạn giãn cách 350ms để không đè nhau)
  const isTooEmpty = WS.activeWords.length < Math.ceil(maxW * 0.6);
  const isTimeForSpawn = timestamp - WS.lastSpawn >= spawnInterval;

  if ((isTimeForSpawn || isTooEmpty) && WS.activeWords.length < maxW) {
    if (!WS.lastSpawnTime || timestamp - WS.lastSpawnTime >= 350) {
      wsSpawnWord();
      WS.lastSpawn = timestamp;
      WS.lastSpawnTime = timestamp;
    }
  }

  wsUpdateShip(dt);
  wsUpdateWords(dt);
  wsCheckMiss();
  wsUpdateEffects(timestamp);
  wsRender(timestamp);

  if (WS.running && !WS.paused) {
    WS.animFrame = requestAnimationFrame(wsGameLoop);
  }
}

/* ── GAME FLOW ────────────────────────────── */

function wsResetState() {
  WS.activeWords = [];
  WS.targetWord = null;
  WS.score = 0;
  WS.lives = WORDSHOOTER_CONFIG.LIVES;
  WS.level = 1;
  WS.combo = 0;
  WS.correctStreak = 0;
  WS.effects = [];
  WS.lastSpawn = 0;
  WS.lastSpawnTime = 0;
  WS.totalXpEarned = 0;
  WS.maxCombo = 0;
  WS.paused = false;
  WS.keys = { left: false, right: false };
  WS.pointer = null;
  WS.lastFrame = 0;
}

async function startWordShooterGame(topicId, skinId, bgId) {
  wsResetState();
  WS_Audio.init();
  WS.shipId = skinId || WORDSHOOTER_CONFIG.DEFAULT_SHIP;
  WS.bgId = bgId || WORDSHOOTER_CONFIG.DEFAULT_BG;
  WS.ship = WS_SHIPS[WS.shipId] || WS_SHIPS.classic;
  WS.bg = WS_BACKGROUNDS[WS.bgId] || WS_BACKGROUNDS.space;

  const topic = WS.topics.find(t => t.id === topicId);
  WS.topic = topic;
  WS.topicTitle = topic ? topic.title : 'Từ vựng';

  showPage('page-wordshooter-game');
  document.body.classList.add('ws-game-active');

  const overlay = document.getElementById('ws-gameover');
  if (overlay) overlay.style.display = 'none';
  const pauseEl = document.getElementById('ws-pause');
  if (pauseEl) pauseEl.style.display = 'none';

  wsInitCanvas();
  requestAnimationFrame(() => wsResizeCanvas());

  try {
    const res = await fetch(`./content/flashcards/${topicId}.json?t=${Date.now()}`);
    if (!res.ok) throw new Error('load failed');
    const raw = await res.json();
    WS.words = raw.map((item, i) => ({
      id: i,
      english: item.english,
      vietnamese: item.vietnamese,
    }));

    if (WS.words.length < WORDSHOOTER_CONFIG.WORD_MIN_COUNT) {
      alert(`Chủ đề này cần ít nhất ${WORDSHOOTER_CONFIG.WORD_MIN_COUNT} từ để chơi.`);
      showPage('page-wordshooter-topics');
      return;
    }

    WS.targetWord = wsPickTarget();
    WS.shipX = WS.width / 2;
    wsUpdateHUD();

    WS.running = true;
    WS.lastSpawn = performance.now() - WORDSHOOTER_CONFIG.SPAWN_INTERVAL_MS;
    WS.lastFrame = 0;
    if (WS.animFrame) cancelAnimationFrame(WS.animFrame);
    WS.animFrame = requestAnimationFrame(wsGameLoop);
  } catch (e) {
    alert('Không thể tải từ vựng. Vui lòng thử lại.');
    showPage('page-wordshooter-topics');
  }
}

function wsGameOver() {
  WS.running = false;
  WS_Audio.gameOver();
  if (WS.animFrame) {
    cancelAnimationFrame(WS.animFrame);
    WS.animFrame = null;
  }

  const bonusXp = Math.floor(WS.score / 10);
  if (bonusXp > 0 && typeof awardFlashcardXP === 'function') {
    awardFlashcardXP(bonusXp, 'Word Shooter Bonus', WS.topicTitle);
    WS.totalXpEarned += bonusXp;
  }

  const overlay = document.getElementById('ws-gameover');
  if (overlay) {
    document.getElementById('ws-go-score').textContent = WS.score.toLocaleString('vi-VN');
    document.getElementById('ws-go-level').textContent = 'Lv.' + WS.level;
    document.getElementById('ws-go-combo').textContent = WS.maxCombo >= 2 ? `Combo cao nhất: x${WS.maxCombo}` : '';
    document.getElementById('ws-go-xp').textContent = '+' + WS.totalXpEarned + ' XP';
    overlay.style.display = 'flex';
  }
}

function wsPause() {
  if (!WS.running) return;
  WS.paused = true;
  const el = document.getElementById('ws-pause');
  if (el) el.style.display = 'flex';
}

function wsResume() {
  WS.paused = false;
  const el = document.getElementById('ws-pause');
  if (el) el.style.display = 'none';
  if (WS.running) {
    WS.lastSpawn = performance.now();
    WS.lastFrame = 0;
    WS.animFrame = requestAnimationFrame(wsGameLoop);
  }
}

function wsQuit() {
  WS.running = false;
  WS.paused = false;
  WS.keys = { left: false, right: false };
  WS.pointer = null;
  if (WS.animFrame) {
    cancelAnimationFrame(WS.animFrame);
    WS.animFrame = null;
  }
  document.body.classList.remove('ws-game-active');
  const pauseEl = document.getElementById('ws-pause');
  if (pauseEl) pauseEl.style.display = 'none';
  const overlay = document.getElementById('ws-gameover');
  if (overlay) overlay.style.display = 'none';
  showPage('page-wordshooter-topics');
}

function wsReplay() {
  const overlay = document.getElementById('ws-gameover');
  if (overlay) overlay.style.display = 'none';
  if (WS.setup.topicId) {
    startWordShooterGame(WS.setup.topicId, WS.setup.shipId, WS.setup.bgId);
  }
}

/* ── SETUP SCREENS ────────────────────────── */

async function openWordShooterTopics() {
  WS.setup = { topicId: null, shipId: WORDSHOOTER_CONFIG.DEFAULT_SHIP, bgId: WORDSHOOTER_CONFIG.DEFAULT_BG };
  showPage('page-wordshooter-topics');

  const listContainer = document.getElementById('wordshooter-topics-list');
  const skinSelector = document.getElementById('wordshooter-skin-selector');
  const startBtn = document.getElementById('wordshooter-start-btn');
  if (skinSelector) skinSelector.style.display = 'none';
  if (startBtn) startBtn.style.display = 'none';

  if (!listContainer) return;
  listContainer.innerHTML = '<div class="units-loading"><div class="loader"></div>Đang tải các chủ đề...</div>';

  try {
    if (WS.topics.length === 0) {
      const res = await fetch(`./content/flashcards/topics-index.json?t=${Date.now()}`);
      if (!res.ok) throw new Error();
      WS.topics = await res.json();
    }
    wsRenderTopics();
  } catch (e) {
    listContainer.innerHTML = '<div class="units-loading" style="color:var(--c-danger);">⚠️ Không thể tải danh sách chủ đề.<br><span style="font-size:.78rem;color:var(--c-muted);font-weight:500;">Vui lòng kiểm tra file content/flashcards/topics-index.json</span></div>';
  }
}

function wsRenderTopics() {
  const listContainer = document.getElementById('wordshooter-topics-list');
  if (!listContainer) return;

  if (WS.topics.length === 0) {
    listContainer.innerHTML = '<div class="units-loading">📭 Chưa có chủ đề từ vựng nào.</div>';
    return;
  }

  listContainer.innerHTML = WS.topics.map((topic, index) => {
    const canPlay = (topic.cardCount || 0) >= WORDSHOOTER_CONFIG.WORD_MIN_COUNT;
    const disabled = canPlay ? '' : 'opacity:.55;pointer-events:none;';
    return `
    <div class="cat-card ws-topic-card${WS.setup.topicId === topic.id ? ' ws-selected' : ''}"
      style="animation-delay:${index * .08}s;${disabled}"
      onclick="wsSelectTopic('${topic.id}')">
      <div class="cat-icon">${topic.icon || '🎯'}</div>
      <div class="cat-info">
        <div class="cat-title">${topic.title}</div>
        <div class="cat-desc">${topic.description || ''}${canPlay ? '' : `<br><span style="color:var(--c-danger);font-size:.72rem;">Cần ≥ ${WORDSHOOTER_CONFIG.WORD_MIN_COUNT} từ</span>`}</div>
      </div>
      <div class="cat-badge">
        <div class="cat-badge-num">${topic.cardCount || 0}</div>
        <div class="cat-badge-label">từ</div>
      </div>
      <div class="cat-arrow">›</div>
    </div>`;
  }).join('');
}

function wsSelectTopic(topicId) {
  WS.setup.topicId = topicId;
  wsRenderTopics();
  wsRenderSkinSelector();
  const skinSelector = document.getElementById('wordshooter-skin-selector');
  const startBtn = document.getElementById('wordshooter-start-btn');
  if (skinSelector) skinSelector.style.display = 'block';
  if (startBtn) startBtn.style.display = 'block';
  skinSelector?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function wsRenderSkinSelector() {
  const container = document.getElementById('wordshooter-skin-selector');
  if (!container) return;

  const userLv = wsGetUserLevel();

  const shipCards = Object.values(WS_SHIPS).map(ship => {
    const unlocked = wsIsUnlocked(ship);
    const selected = WS.setup.shipId === ship.id;
    return `
      <button type="button" class="ws-skin-card${selected ? ' ws-skin-selected' : ''}${unlocked ? '' : ' ws-locked'}"
        ${unlocked ? `onclick="wsSelectShip('${ship.id}')"` : 'disabled'}
        title="${unlocked ? ship.name : 'Mở khóa ở Lv.' + ship.unlockLevel}">
        <span class="ws-skin-emoji">${ship.emoji}</span>
        <span class="ws-skin-name">${ship.name}</span>
        ${unlocked ? '' : `<span class="ws-lock-badge">Lv.${ship.unlockLevel}</span>`}
      </button>`;
  }).join('');

  const bgCards = Object.values(WS_BACKGROUNDS).map(bg => {
    const unlocked = wsIsUnlocked(bg);
    const selected = WS.setup.bgId === bg.id;
    return `
      <button type="button" class="ws-skin-card${selected ? ' ws-skin-selected' : ''}${unlocked ? '' : ' ws-locked'}"
        ${unlocked ? `onclick="wsSelectBg('${bg.id}')"` : 'disabled'}
        title="${unlocked ? bg.name : 'Mở khóa ở Lv.' + bg.unlockLevel}">
        <span class="ws-skin-emoji">${bg.emoji}</span>
        <span class="ws-skin-name">${bg.name}</span>
        ${unlocked ? '' : `<span class="ws-lock-badge">Lv.${bg.unlockLevel}</span>`}
      </button>`;
  }).join('');

  container.innerHTML = `
    <div class="ws-setup-section">
      <div class="ws-setup-label">🛸 Chọn máy bay <span class="ws-setup-hint">(Lv.${userLv})</span></div>
      <div class="ws-skin-grid">${shipCards}</div>
    </div>
    <div class="ws-setup-section">
      <div class="ws-setup-label">🌌 Chọn nền</div>
      <div class="ws-skin-grid">${bgCards}</div>
    </div>`;
}

function wsSelectShip(shipId) {
  WS.setup.shipId = shipId;
  wsRenderSkinSelector();
}

function wsSelectBg(bgId) {
  WS.setup.bgId = bgId;
  wsRenderSkinSelector();
}

function wsStartFromSetup() {
  if (!WS.setup.topicId) {
    alert('Vui lòng chọn chủ đề trước!');
    return;
  }
  startWordShooterGame(WS.setup.topicId, WS.setup.shipId, WS.setup.bgId);
}

/* ── INIT ─────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  wsInitCanvas();
});
