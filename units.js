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
    if (!supabaseClient) {
      throw new Error('Supabase client chưa được khởi tạo');
    }
    // Tải dữ liệu danh mục cùng với danh sách bài học thuộc danh mục đó
    const { data: categoriesData, error } = await supabaseClient
      .from('categories')
      .select('*, units(*)');
      
    if (error) throw error;

    // Map về đúng format cũ mà app đang dùng và sắp xếp theo sort_order của unit
    allUnits = categoriesData.flatMap(cat =>
      (cat.units || [])
        .filter(u => u.is_published !== false)
        .map(u => ({
          id: u.id,
          category: cat.id,
          title: u.title,
          description: u.description || '',
          icon: u.icon || '📘',
          questionCount: u.question_count || 0,
          sort_order: u.sort_order || 0
        }))
    ).sort((a, b) => a.sort_order - b.sort_order);

    // Cập nhật cấu hình danh mục động
    categoriesData.forEach(cat => {
      CATEGORIES[cat.id] = {
        icon: cat.icon || '📁',
        title: cat.title,
        desc: cat.description || ''
      };
    });

    renderCategories();
  } catch (e) {
    console.error('Lỗi tải bài học từ Supabase:', e);
    c.innerHTML = '<div class="units-loading" style="color:var(--c-danger);">⚠️ Lỗi tải dữ liệu bài học từ Server.<br><span style="font-size:.78rem;color:var(--c-muted);">Vui lòng kiểm tra lại kết nối Database.</span></div>';
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
