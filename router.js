/* ════════════════════════════════════════════
   PAGE ROUTING MODULE
   ════════════════════════════════════════════ */

function showPage(id) {
  const pageEl = document.getElementById(id);
  if (!pageEl) return;
  
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  pageEl.classList.add('active');
  
  const nav = document.getElementById('bottom-nav');
  if (nav) {
    const hideNav = id === 'page-login' || id === 'page-wordshooter-game';
    hideNav ? nav.classList.remove('visible') : nav.classList.add('visible');
  }

  document.body.classList.toggle('ws-game-active', id === 'page-wordshooter-game');
  
  document.querySelectorAll('.bn-item').forEach(b => b.classList.remove('active'));
  if (id === 'page-home') {
    const homeBtn = document.getElementById('bn-home');
    if (homeBtn) homeBtn.classList.add('active');
  }
  if (id === 'page-leaderboard') {
    const lbBtn = document.getElementById('bn-lb');
    if (lbBtn) lbBtn.classList.add('active');
  }
  if (id === 'page-history') {
    const historyBtn = document.getElementById('bn-history');
    if (historyBtn) historyBtn.classList.add('active');
  }
  
  pageEl.scrollTop = 0;
  
  // Lazy loaders
  if (id === 'page-theory' && typeof loadTheory === 'function') loadTheory();
  if (id === 'page-setup' && typeof loadQuestions === 'function') loadQuestions();
  if (id === 'page-leaderboard' && typeof loadLeaderboard === 'function') loadLeaderboard();
  if (id === 'page-history' && typeof loadHistory === 'function') loadHistory();
  if (id === 'page-blog-list') { if (typeof openBlogList === 'function') openBlogList(); }
  if (id === 'page-video-topics') { if (typeof openVideoTopicsPage === 'function') openVideoTopicsPage(); }
}
