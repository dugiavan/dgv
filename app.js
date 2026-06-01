/* ════════════════════════════════════════════
   ENTRY POINT (app.js)
   ════════════════════════════════════════════ */

window.addEventListener('DOMContentLoaded', async () => {
  // ── Chế độ demo: tự động đăng nhập tài khoản thật ──
  if (typeof CONFIG !== 'undefined' && CONFIG.DEMO_MODE) {
    const userInp = document.getElementById('inp-username');
    const passInp = document.getElementById('inp-password');
    if (userInp) userInp.value = CONFIG.DEMO_USERNAME;
    if (passInp) passInp.value = CONFIG.DEMO_PASSWORD;
    if (typeof doLogin === 'function') {
      await doLogin(); // Gọi đúng hàm đăng nhập thật — kết nối Google Sheets bình thường
    }
    return;
  }

  // ── Bình thường: kiểm tra session rồi quyết định ──
  if (typeof loadSession === 'function') {
    currentUser = loadSession();
  }
  
  if (currentUser) {
    if (typeof initHome === 'function') initHome();
    if (typeof showPage === 'function') showPage('page-home');
  } else {
    if (typeof showPage === 'function') showPage('page-login');
  }
});
