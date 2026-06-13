/* ════════════════════════════════════════════
   HISTORY MODULE
   ════════════════════════════════════════════ */

var _historyCache = null;
var _historyCacheTime = 0;
var _historyCacheUser = '';
var CACHE_TTL_MS = 30 * 1000; // cache 30 giây

function clearHistoryCache() {
  _historyCache = null;
  _historyCacheTime = 0;
  _historyCacheUser = '';
}

async function loadHistory() {
  const c = document.getElementById('history-container');
  if (!c) return;
  c.innerHTML = '<div class="units-loading"><div class="loader"></div>Đang tải lịch sử...</div>';

  if (!currentUser || !currentUser.username) {
    c.innerHTML = '<div class="units-loading">⚠️ Vui lòng đăng nhập để xem lịch sử.</div>';
    return;
  }

  const myUsername = currentUser.username.trim().toLowerCase();
  
  // Reset search box và dropdown lọc bài học
  const searchInput = document.getElementById('history-search');
  if (searchInput) searchInput.value = '';
  const filterSelect = document.getElementById('history-lesson-filter');
  if (filterSelect) filterSelect.value = 'all';

  if (!CONFIG.SHEETS_URL || CONFIG.SHEETS_URL.includes('YOUR_SCRIPT_ID')) {
    c.innerHTML = '<div class="units-loading">⚠️ Chưa cấu hình Google Sheets URL.</div>';
    return;
  }

  try {
    let records = [];
    const cacheValid = _historyCache
      && _historyCacheUser === myUsername
      && (Date.now() - _historyCacheTime) < CACHE_TTL_MS;
    if (cacheValid) {
      records = _historyCache;
    } else {
      const res = await fetch(
        CONFIG.SHEETS_URL + '?action=history&username=' + encodeURIComponent(currentUser.username)
      );
      const json = await res.json();
      if (json.status === 'success' || json.status === 'ok') {
        records = json.records || [];
        _historyCache = records;
        _historyCacheTime = Date.now();
        _historyCacheUser = myUsername;
      } else {
        throw new Error(json.message || 'Lỗi không xác định');
      }
    }
    
    // Parse recordJSON
    const parsedRecords = records.map(row => {
      let rec = {
        id: row.timestamp || ('row_' + Math.random()),
        date: row.date || '',
        timestamp: row.timestamp ? (new Date(row.timestamp).getTime()) : (row.date ? new Date(row.date).getTime() : 0),
        studentName: currentUser.full_name || row.username || 'Ẩn danh',
        lessonName: row.unit + ' - ' + row.difficulty,
        score: Number(row.score) || 0,
        total: Number(row.total) || 0,
        pct: Number(row.pct) || 0,
        answers: []
      };
      try {
        if (row.recordJSON && row.recordJSON.trim() !== "") {
          const parsed = JSON.parse(row.recordJSON);
          rec = {
            ...rec,
            ...parsed,
            date: parsed.date || row.date || '',
            timestamp: parsed.timestamp || (row.timestamp ? new Date(row.timestamp).getTime() : 0),
            studentName: currentUser.full_name || parsed.studentName || row.username || 'Ẩn danh',
            lessonName: parsed.lessonName || (row.unit + ' - ' + row.difficulty)
          };
        }
      } catch (e) {}
      return rec;
    });

    // Sắp xếp các bản ghi theo thời gian tăng dần (cũ nhất đến mới nhất) để tính lần làm bài
    parsedRecords.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

    // Tính lần làm bài
    const attemptCounts = {};
    parsedRecords.forEach(r => {
      const userKey = (r.studentName || 'Ẩn danh').trim();
      const lessonKey = (r.lessonName || '').trim();
      const key = `${userKey}_${lessonKey}`;
      if (!attemptCounts[key]) {
        attemptCounts[key] = 1;
      } else {
        attemptCounts[key]++;
      }
      r.attemptNumber = attemptCounts[key];
    });

    // Sắp xếp ngược lại cho hiển thị (mới nhất lên đầu)
    parsedRecords.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

    // Cập nhật bộ lọc bài học động
    if (filterSelect && typeof allUnits !== 'undefined' && allUnits && allUnits.length) {
      filterSelect.innerHTML = '<option value="all">📚 Tất cả bài học</option>';
      allUnits.forEach(unit => {
        const opt = document.createElement('option');
        opt.value = unit.title;
        opt.textContent = '📚 ' + unit.title;
        filterSelect.appendChild(opt);
      });
    }

    c._historyData = parsedRecords;
    renderHistoryList(parsedRecords);
  } catch (e) {
    c.innerHTML = `<div class="units-loading" style="color:var(--c-danger);">⚠️ Lỗi khi tải lịch sử làm bài.<br><span style="font-size:.78rem;color:var(--c-muted);">${e.message}</span></div>`;
  }
}

function renderHistoryList(records, filterKeyword = '', filterLesson = 'all') {
  const container = document.getElementById('history-container');
  if (!container) return;
  let history = records || [];

  if (history.length === 0) {
    container.innerHTML = `
      <div class="units-loading" style="padding: 2rem 0;">
        <div style="font-size:2.2rem;margin-bottom:.5rem;">🔍</div>
        <div style="font-weight:600;color:var(--c-muted);">Không tìm thấy lịch sử phù hợp</div>
      </div>`;
    return;
  }

  container.innerHTML = `<div style="display:flex; flex-direction:column; gap:.75rem;">` + 
    history.map((r, index) => {
      const isGood = r.pct >= 80;
      const isPass = r.pct >= 50;
      const col = isGood ? 'var(--c-success)' : isPass ? 'var(--c-warning)' : 'var(--c-danger)';
      const emoji = isGood ? '🏆' : isPass ? '👍' : '💪';
      return `
      <div class="unit-card" style="margin-bottom:0; padding:1rem; cursor:pointer;" onclick="viewHistoryDetail('${r.id}')">
        <div class="unit-icon" style="font-size:1.4rem; width:38px; height:38px; border-radius:10px;">${emoji}</div>
        <div class="unit-info">
          <div class="unit-title" style="font-size:.88rem; margin-bottom:.1rem;">📚 ${r.lessonName}</div>
          <div class="unit-desc" style="font-size:.75rem; display:flex; align-items:center; gap:.35rem;">
            <span>${r.pct}% đúng</span>
            <span class="profile-tag" style="background:var(--c-accent-light); color:var(--c-accent); padding: .05rem .35rem; font-size: .6rem; border-radius:4px; font-weight:700;">Lần ${r.attemptNumber}</span>
          </div>
          <div style="font-size:.65rem; color:var(--c-muted); margin-top:.15rem;">🕐 ${r.date}</div>
        </div>
        <div style="text-align:right; font-weight:800; font-size:.9rem; color:${col}; line-height:1.2;">
          ${r.score}/${r.total}<br>
          <span style="font-size:.68rem; font-weight:600; color:var(--c-muted);">${r.pct}%</span>
        </div>
      </div>`;
    }).join('') + `</div>`;
}

function filterHistory() {
  const keyword = document.getElementById('history-search').value.trim().toLowerCase();
  const lesson = document.getElementById('history-lesson-filter').value;
  const container = document.getElementById('history-container');
  if (!container) return;
  const allData = container._historyData || [];
  
  let filtered = allData;
  if (keyword) {
    filtered = filtered.filter(r =>
      (r.lessonName || '').toLowerCase().includes(keyword)
    );
  }
  if (lesson !== 'all') {
    filtered = filtered.filter(r => 
      (r.lessonName || '').includes(lesson)
    );
  }
  
  renderHistoryList(filtered, keyword, lesson);
}

function viewHistoryDetail(id) {
  const container = document.getElementById('history-container');
  if (!container) return;
  const allData = container._historyData || [];
  const record = allData.find(r => String(r.id) === String(id));
  if (!record) return;

  // Lấy danh sách các lần làm bài khác của cùng học sinh và cùng bài học này để vẽ timeline tiến độ
  const studentKey = (record.studentName || 'Ẩn danh').trim();
  const otherAttempts = allData
    .filter(r => (r.studentName || 'Ẩn danh').trim() === studentKey && r.lessonName === record.lessonName)
    .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0)); // Sắp xếp cũ -> mới
  
  let progressTimelineHtml = '';
  if (otherAttempts.length > 1) {
    progressTimelineHtml = `
      <div class="setup-card" style="margin-bottom: 1rem; padding: 1.1rem;">
        <h4 style="font-size: .75rem; font-weight: 800; text-transform: uppercase; color: var(--c-muted); margin-bottom: .6rem; letter-spacing: .05em;">📈 Tiến bộ qua các lần làm bài</h4>
        <div style="display: flex; flex-direction: column; gap: .45rem; font-size: .8rem;">
          ${otherAttempts.map(att => {
            const isCurrent = att.timestamp === record.timestamp;
            const textCol = att.pct >= 80 ? 'var(--c-success)' : att.pct >= 50 ? 'var(--c-warning)' : 'var(--c-danger)';
            return `
              <div style="display: flex; justify-content: space-between; align-items: center; padding: .35rem .6rem; border-radius: 10px; ${isCurrent ? 'background: var(--c-accent-light); font-weight: 700; border: 1px solid var(--c-glass-border);' : ''}">
                <span>Lần ${att.attemptNumber} (${att.date})</span>
                <span style="color: ${textCol}; font-weight: 700;">${att.score}/${att.total} (${att.pct}%) ${isCurrent ? '👈 Hiện tại' : ''}</span>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  let det = '';
  const TYPE_LBL = { multiple_choice: '🔘 Trắc nghiệm', fill_blank: '✍️ Điền từ' };
  
  (record.answers || []).forEach((ans, i) => {
    const isCorrect = ans.correct;
    det += `
    <div class="result-card" style="margin-bottom: .75rem; padding: 1rem;">
      <div class="rc-head">
        <span class="rc-badge ${isCorrect ? 'c' : 'w'}">${isCorrect ? '✅ Đúng' : '❌ Sai'}</span>
        <span style="font-size:.68rem; color:var(--c-muted); font-weight:600;">Câu ${i + 1} (${TYPE_LBL[ans.q.type] || ans.q.type})</span>
      </div>
      <div class="rc-q" style="font-size:.84rem; font-weight:600; margin-top:.4rem; color:var(--c-text);">${ans.q.q}</div>
      <div class="rc-ans" style="font-size:.8rem; margin-top:.3rem;">Bạn trả lời: <strong class="${isCorrect ? 'ca' : 'wa'}">${ans.userAns || '(Bỏ trống)'}</strong></div>
      ${!isCorrect ? `<div class="rc-ans" style="font-size:.8rem;">Đáp án đúng: <strong class="ca">${ans.q.a}</strong></div>` : ''}
    </div>`;
  });

  if (!det) {
    det = `<div style="text-align:center; padding:2rem; color:var(--c-muted); font-size:.8rem;">
      <div style="font-size:2rem; margin-bottom:.5rem;">📄</div>
      Không có dữ liệu chi tiết từng câu cho bài làm này.
    </div>`;
  }

  container.innerHTML = `
    <div style="margin-bottom: 1rem;">
      <button onclick="renderHistoryList(document.getElementById('history-container')._historyData)" 
        class="btn-back" style="width: auto; height: auto; padding: .4rem .8rem; border-radius: 20px; font-size: .8rem; display: inline-flex; align-items: center; gap: .3rem; font-weight: bold;">
        ‹ Quay lại danh sách
      </button>
    </div>
    <div class="setup-card" style="margin-bottom: 1rem; padding: 1.2rem;">
      <h3 style="font-size: 1.05rem; font-weight: 800; margin-bottom: .4rem; color:var(--c-text);">📋 Chi tiết bài làm</h3>
      <div style="font-size: .82rem; color: var(--c-text2); line-height: 1.5;">
        <div>👤 Học sinh: <b>${record.studentName}</b></div>
        <div>📚 Bài học: <b>${record.lessonName}</b></div>
        <div>🕐 Thời gian: <b>${record.date}</b></div>
        <div style="margin-top: .4rem; font-size: .9rem;">
          Kết quả: <b style="color: ${record.pct >= 80 ? 'var(--c-success)' : record.pct >= 50 ? 'var(--c-warning)' : 'var(--c-danger)'}">${record.score}/${record.total} câu đúng (${record.pct}%)</b>
        </div>
      </div>
    </div>
    ${progressTimelineHtml}
    <div class="section-title">📋 Chi tiết từng câu</div>
    <div id="history-details-list">${det}</div>
  `;
}
