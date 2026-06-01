/* ════════════════════════════════════════════
   UNITS MODULE
   ════════════════════════════════════════════ */

var allUnits = [];
var currentUnit = null;
var lastOpenCategory = null;

async function loadUnits() {
  const c = document.getElementById('units-container');
  if (!c) return;
  c.innerHTML = '<div class="units-loading"><div class="loader"></div>Đang tải bài học...</div>';
  try {
    const r = await fetch(CONFIG.UNITS_INDEX + '?t=' + Date.now());
    if (!r.ok) throw new Error();
    allUnits = await r.json();
    renderCategories();
  } catch (e) {
    c.innerHTML = '<div class="units-loading" style="color:var(--c-danger);">⚠️ Chưa có dữ liệu bài học.<br><span style="font-size:.78rem;color:var(--c-muted);">Thêm file content/units-index.json</span></div>';
  }
}

function renderCategories() {
  const c = document.getElementById('units-container');
  if (!c) return;
  if (!allUnits.length) { c.innerHTML = '<div class="units-loading">📭 Chưa có bài học nào.</div>'; return; }

  // Group units by category
  const grouped = {};
  allUnits.forEach(u => {
    const cat = u.category || 'other';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(u);
  });

  let html = '';
  let idx = 0;
  for (const [catKey, units] of Object.entries(grouped)) {
    const catMeta = CATEGORIES[catKey] || { icon: '📁', title: catKey, desc: '' };
    const totalQ = units.reduce((s, u) => s + (u.questionCount || 0), 0);
    html += `
      <div class="cat-card" style="animation-delay:${idx * .08}s" onclick="openCategory('${catKey}')">
        <div class="cat-icon">${catMeta.icon}</div>
        <div class="cat-info">
          <div class="cat-title">${catMeta.title}</div>
          <div class="cat-desc">${units.length} bài học · ${totalQ} câu hỏi</div>
        </div>
        <div class="cat-badge">
          <div class="cat-badge-num">${units.length}</div>
          <div class="cat-badge-label">bài</div>
        </div>
        <div class="cat-arrow">›</div>
      </div>`;
    idx++;
  }
  c.innerHTML = html;
}

function openCategory(catKey) {
  lastOpenCategory = catKey;
  const catMeta = CATEGORIES[catKey] || { icon: '📁', title: catKey, desc: '' };
  const units = allUnits.filter(u => (u.category || 'other') === catKey);

  const navTitle = document.getElementById('cat-nav-title');
  const headerIcon = document.getElementById('cat-header-icon');
  const headerTitle = document.getElementById('cat-header-title');
  const headerDesc = document.getElementById('cat-header-desc');
  const list = document.getElementById('cat-units-list');

  if (navTitle) navTitle.textContent = catMeta.title;
  if (headerIcon) headerIcon.textContent = catMeta.icon;
  if (headerTitle) headerTitle.textContent = catMeta.title;
  if (headerDesc) headerDesc.textContent = catMeta.desc;

  if (list) {
    list.innerHTML = units.map((u, i) => `
      <div class="unit-card" style="animation-delay:${i * .05}s" onclick="openUnit('${u.id}')">
        <div class="unit-icon">${u.icon || '📘'}</div>
        <div class="unit-info"><div class="unit-title">${u.title}</div><div class="unit-desc">${u.description || ''}</div></div>
        <div class="unit-badge">${u.questionCount || '?'} câu</div>
      </div>`).join('');
  }

  showPage('page-category');
}

// Legacy renderUnits - keep for backward compat
function renderUnits() { renderCategories(); }

async function openUnit(id) {
  currentUnit = allUnits.find(u => u.id === id);
  if (!currentUnit) return;
  // Track which category this unit belongs to
  if (!lastOpenCategory && currentUnit.category) lastOpenCategory = currentUnit.category;
  try {
    const r = await fetch(`./content/${id}/unit.json?t=${Date.now()}`);
    if (r.ok) currentUnit = { ...currentUnit, ...(await r.json()) };
  } catch (e) { }
  
  const detailIcon = document.getElementById('detail-icon');
  const detailNavTitle = document.getElementById('detail-nav-title');
  const detailTitle = document.getElementById('detail-title');
  const detailDesc = document.getElementById('detail-desc');
  
  if (detailIcon) detailIcon.textContent = currentUnit.icon || '📘';
  if (detailNavTitle) detailNavTitle.textContent = currentUnit.title;
  if (detailTitle) detailTitle.textContent = currentUnit.title;
  if (detailDesc) detailDesc.textContent = currentUnit.description || '';
  
  showPage('page-detail');
}

function goBackFromDetail() {
  if (lastOpenCategory) {
    openCategory(lastOpenCategory);
  } else {
    showPage('page-home');
  }
}
