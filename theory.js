/* ════════════════════════════════════════════
   THEORY MODULE
   ════════════════════════════════════════════ */

async function loadTheory() {
  const b = document.getElementById('theory-body');
  if (!b) return;
  b.innerHTML = '<div class="loader" style="margin:2rem auto;"></div>';
  if (!currentUnit) {
    b.innerHTML = '<p style="color:var(--c-muted);text-align:center;padding:2rem;">📭 Chưa chọn bài học.</p>';
    return;
  }
  try {
    const r = await fetch(`./content/${currentUnit.id}/theory.md?t=${Date.now()}`);
    if (!r.ok) throw new Error();
    b.innerHTML = marked.parse(await r.text());
  } catch (e) { 
    b.innerHTML = '<p style="color:var(--c-muted);text-align:center;padding:2rem;">📭 Chưa có lý thuyết.</p>'; 
  }
}
