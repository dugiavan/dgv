/* ════════════════════════════════════════════
   AUTHENTICATION & SESSION MODULE
   ════════════════════════════════════════════ */

const SESSION_KEY = 'dv_eng_session';
var currentUser = null;

function saveSession(user) {
  const data = { ...user, _expires: Date.now() + CONFIG.SESSION_HOURS * 3600 * 1000 };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
  currentUser = user;
}

function loadSession() {
  try {
    const d = JSON.parse(sessionStorage.getItem(SESSION_KEY));
    if (!d) return null;
    if (Date.now() > d._expires) { sessionStorage.removeItem(SESSION_KEY); return null; }
    delete d._expires;
    return d;
  } catch (e) { return null; }
}

function clearSession() { 
  sessionStorage.removeItem(SESSION_KEY); 
  currentUser = null; 
}

function togglePw() {
  const inp = document.getElementById('inp-password');
  const eye = document.getElementById('pw-eye');
  if (!inp || !eye) return;
  inp.type = inp.type === 'password' ? 'text' : 'password';
  eye.textContent = inp.type === 'password' ? '👁' : '🙈';
}

function setLoginLoading(on) {
  const spinner = document.getElementById('login-spinner');
  const btnText = document.getElementById('login-btn-text');
  const loginBtn = document.getElementById('btn-login');
  
  if (spinner) spinner.classList.toggle('show', on);
  if (btnText) btnText.textContent = on ? 'Đang xác thực...' : 'Đăng nhập ✨';
  if (loginBtn) loginBtn.disabled = on;
}

function setLoginError(msg) {
  const el = document.getElementById('login-error');
  if (el) el.textContent = msg;
  if (msg) {
    const usernameInput = document.getElementById('inp-username');
    const passwordInput = document.getElementById('inp-password');
    if (usernameInput) usernameInput.classList.add('input-error');
    if (passwordInput) passwordInput.classList.add('input-error');
    setTimeout(() => {
      if (usernameInput) usernameInput.classList.remove('input-error');
      if (passwordInput) passwordInput.classList.remove('input-error');
    }, 2000);
  }
}

async function doLogin() {
  const usernameInput = document.getElementById('inp-username');
  const passwordInput = document.getElementById('inp-password');
  const username = usernameInput ? usernameInput.value.trim() : '';
  const password = passwordInput ? passwordInput.value : '';
  
  if (!username) { setLoginError('Vui lòng nhập tên đăng nhập'); return; }
  if (!password) { setLoginError('Vui lòng nhập mật khẩu'); return; }
  if (!CONFIG.SHEETS_URL || CONFIG.SHEETS_URL.includes('YOUR_SCRIPT_ID')) {
    setLoginError('⚠️ Chưa cấu hình Google Sheets URL'); return;
  }
  setLoginLoading(true);
  setLoginError('');
  try {
    const url = CONFIG.SHEETS_URL + '?action=login'
      + '&username=' + encodeURIComponent(username)
      + '&password=' + encodeURIComponent(password);
    const res = await fetch(url);
    const json = await res.json();
    if (json.status === 'ok' && json.user) {
      const u = json.user;
      saveSession({
        student_id: u.student_id || '',
        username: u.username || username,
        full_name: u.full_name || username,
        role: u.role || '',
        department: u.department || '',
        level: Number(u.level) || 1,
        xp: Number(u.xp) || 0,
        streak: Number(u.streak) || 0,
        lastDate: u.lastDate || '',
      });
      updateStreakOnLogin();
      if (typeof initHome === 'function') initHome();
      showPage('page-home');
    } else {
      setLoginError(json.message || 'Sai tên đăng nhập hoặc mật khẩu');
    }
  } catch (e) {
    setLoginError('Lỗi kết nối. Kiểm tra mạng và thử lại.');
  } finally {
    setLoginLoading(false);
  }
}

function updateStreakOnLogin() {
  if (!currentUser) return;
  const today = new Date().toDateString();
  if (currentUser.lastDate !== today) {
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    currentUser.streak = currentUser.lastDate === yesterday ? currentUser.streak + 1 : 1;
    currentUser.lastDate = today;
    saveSession(currentUser);
  }
}

function doLogout() {
  if (CONFIG.DEMO_MODE) {
    // Demo: đăng xuất xong tự đăng nhập lại — khách không bị kẹt ở trang login
    clearSession();
    if (typeof clearHistoryCache === 'function') clearHistoryCache();
    // Tự reload lại trang → DOMContentLoaded chạy lại → tự login lại
    window.location.reload();
    return;
  }
  if (!confirm('Đăng xuất?')) return;
  clearSession();
  if (typeof clearHistoryCache === 'function') clearHistoryCache();
  const usernameInput = document.getElementById('inp-username');
  const passwordInput = document.getElementById('inp-password');
  if (usernameInput) usernameInput.value = '';
  if (passwordInput) passwordInput.value = '';
  showPage('page-login');
}
