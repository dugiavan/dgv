/* ════════════════════════════════════════════
   GAMIFICATION MODULE
   ════════════════════════════════════════════ */

function getLevelInfo(xp) {
  if (typeof LEVELS === 'undefined') return { cur: { lv: 1, title: 'Bắt đầu' }, next: null };
  let cur = LEVELS[0], next = LEVELS[1];
  for (let i = 0; i < LEVELS.length; i++) {
    if (xp >= LEVELS[i].xp) { cur = LEVELS[i]; next = LEVELS[i + 1] || null; } else break;
  }
  return { cur, next };
}

function refreshGamiCard() {
  if (!currentUser) return;
  const { cur, next } = getLevelInfo(currentUser.xp);
  
  const gamiLv = document.getElementById('gami-lv');
  const titleEl = document.getElementById('gami-lv-title');
  const streakEl = document.getElementById('gami-streak');
  const xpCurEl = document.getElementById('gami-xp-cur');
  const xpNextEl = document.getElementById('gami-xp-next');
  const barEl = document.getElementById('gami-bar');
  const nextLabel = document.getElementById('gami-next-label');

  if (gamiLv) gamiLv.textContent = cur.lv;
  if (titleEl) {
    titleEl.textContent = cur.title;
    titleEl.title = cur.title;
  }
  if (streakEl) streakEl.textContent = currentUser.streak;
  if (xpCurEl) xpCurEl.textContent = currentUser.xp.toLocaleString('vi-VN');
  
  if (next) {
    if (xpNextEl) xpNextEl.textContent = next.xp.toLocaleString('vi-VN');
    const pct = Math.min(100, ((currentUser.xp - cur.xp) / (next.xp - cur.xp)) * 100);
    if (barEl) barEl.style.width = pct + '%';
    const need = next.xp - currentUser.xp;
    if (nextLabel) nextLabel.textContent = `Cần ${need.toLocaleString('vi-VN')} XP để lên Lv.${next.lv}`;
  } else {
    if (xpNextEl) xpNextEl.textContent = '∞';
    if (barEl) barEl.style.width = '100%';
    if (nextLabel) nextLabel.textContent = 'Cấp độ tối đa! 🎉';
  }
}

function initHome() {
  if (!currentUser) return;
  const nameEl = document.getElementById('profile-name');
  const avatarEl = document.getElementById('profile-avatar');
  const roleEl = document.getElementById('profile-role');
  const deptEl = document.getElementById('profile-dept');
  const idEl = document.getElementById('profile-id');
  
  if (nameEl) nameEl.textContent = currentUser.full_name;
  
  const avatarMap = { 'lớp trưởng': '👑', 'giám thị': '🎓', 'học sinh': '🌿', 'default': '🌿' };
  const key = (currentUser.role || '').toLowerCase();
  if (avatarEl) avatarEl.textContent = avatarMap[key] || avatarMap['default'];
  
  if (roleEl) {
    if (currentUser.role) {
      roleEl.textContent = currentUser.role;
      roleEl.style.display = '';
    } else {
      roleEl.style.display = 'none';
    }
  }
  
  if (deptEl) {
    if (currentUser.department) {
      deptEl.textContent = currentUser.department;
      deptEl.style.display = '';
    } else {
      deptEl.style.display = 'none';
    }
  }
  
  if (idEl) idEl.textContent = currentUser.student_id ? 'ID: ' + currentUser.student_id : '';
  
  refreshGamiCard();
  if (typeof loadUnits === 'function') loadUnits();
  if (typeof blogInitHome === 'function') blogInitHome();
  if (typeof videoInitHome === 'function') videoInitHome();
}
