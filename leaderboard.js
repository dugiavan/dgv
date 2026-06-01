/* ════════════════════════════════════════════
   LEADERBOARD MODULE
   ════════════════════════════════════════════ */

async function loadLeaderboard() {
  const c = document.getElementById('lb-container');
  if (!c) return;
  c.innerHTML = '<div class="units-loading"><div class="loader"></div>Đang tải...</div>';
  if (!CONFIG.SHEETS_URL || CONFIG.SHEETS_URL.includes('YOUR_SCRIPT_ID')) {
    renderLBFallback(c); return;
  }
  try {
    const res = await fetch(CONFIG.SHEETS_URL + '?action=leaderboard');
    const json = await res.json();
    renderLB(c, json.data || []);
  } catch (e) { renderLBFallback(c); }
}

function renderLBFallback(c) {
  const u = currentUser;
  const deptStr = u && u.department ? u.department : '';
  const roleStr = u && u.role ? u.role : '';
  const metaExtra = [deptStr, roleStr].filter(Boolean).join(' - ');

  c.innerHTML = `<div style="text-align:center;padding:1.5rem;color:var(--c-muted);font-size:.84rem;line-height:1.7;">
📊 Chưa kết nối Google Sheets.<br>Cấu hình <code>SHEETS_URL</code> để xem bảng xếp hạng lớp.</div>
  <div class="lb-item lb-me">
<div class="lb-rank gold">🥇</div>
<div class="lb-info"><div class="lb-name">${u ? u.full_name : ''}</div>
  <div class="lb-meta">Lv.${u ? getLevelInfo(u.xp).cur.lv : 1} · ${u ? u.streak : 0}🔥 ${metaExtra ? '· ' + metaExtra : ''}</div></div>
<div class="lb-xp">${u ? u.xp : 0} XP</div>
  </div>`;
}

function renderLB(c, rows) {
  if (!rows.length) { renderLBFallback(c); return; }
  const ranks = ['🥇', '🥈', '🥉'];
  const cls = ['gold', 'silver', 'bronze'];
  c.innerHTML = rows.map((r, i) => {
    const deptStr = r.department ? r.department : '';
    const roleStr = r.role ? r.role : '';
    const metaExtra = [deptStr, roleStr].filter(Boolean).join(' - ');
    return `
<div class="lb-item ${currentUser && r.student_id === currentUser.student_id ? 'lb-me' : ''}">
  <div class="lb-rank ${cls[i] || ''}">${ranks[i] || i + 1}</div>
  <div class="lb-info"><div class="lb-name">${r.full_name || r.username || ''}</div>
    <div class="lb-meta">Lv.${getLevelInfo(r.xp || 0).cur.lv} · ${r.streak || 0}🔥 ${metaExtra ? '· ' + metaExtra : ''}</div></div>
  <div class="lb-xp">${r.xp || 0} XP</div>
</div>`;
  }).join('');
}
