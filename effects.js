/* ════════════════════════════════════════════
   UI HELPERS / EFFECTS
   ════════════════════════════════════════════ */

function setSyncBadge(state) {
  const b = document.getElementById('sync-badge');
  if (!b) return;
  b.className = 'sync-badge ' + state;
  b.textContent = state === 'synced' ? '✓ Đồng bộ' : state === 'syncing' ? '⏳ Đang đồng bộ...' : '✗ Mất kết nối';
}

function showXPToast(xp) {
  if (!xp) return;
  const t = document.getElementById('xp-toast');
  if (!t) return;
  document.getElementById('xp-toast-val').textContent = '+' + xp + ' XP';
  t.classList.add('show');
  setTimeout(() => {
    t.classList.remove('show');
  }, 2000);
}

function showLevelUp(cur) {
  const titleEl = document.getElementById('lu-title');
  const xpEl = document.getElementById('lu-xp');
  const descEl = document.getElementById('lu-desc');
  const overlayEl = document.getElementById('levelup-overlay');
  
  if (titleEl) titleEl.textContent = cur.title;
  if (xpEl) xpEl.textContent = `Cấp ${cur.lv}`;
  if (descEl) descEl.textContent = `Bạn đã thăng tiến vượt bậc! Hãy tiếp tục phát huy nhé! 🌿`;
  if (overlayEl) overlayEl.classList.add('show');
}

function closeLevelUp(e) {
  if (e && e.target !== e.currentTarget && !e.target.classList.contains('levelup-close-btn')) return;
  const overlayEl = document.getElementById('levelup-overlay');
  if (overlayEl) overlayEl.classList.remove('show');
  launchConfetti();
}

function launchConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  let particles = [];
  const colors = ['#4a8c5c', '#6bb07a', '#ff9500', '#ffcc00', '#0071e3', '#5ac8fa'];

  for (let i = 0; i < 80; i++) {
    particles.push({
      x: canvas.width / 2 + (Math.random() - 0.5) * 50,
      y: canvas.height + 20,
      vx: (Math.random() - 0.5) * 12,
      vy: -Math.random() * 12 - 12,
      r: Math.random() * 5 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: 1,
      dOpacity: Math.random() * 0.015 + 0.01
    });
  }

  function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let active = false;
    particles.forEach(p => {
      if (p.opacity > 0) {
        active = true;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35; // gravity
        p.vx *= 0.98;
        p.opacity -= p.dOpacity;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fill();
      }
    });
    if (active) {
      requestAnimationFrame(update);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  update();
}
