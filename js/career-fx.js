/* roLERbot · Mod carieră: mișcare discretă (pauză când pagina e ascunsă, intrări eșalonate). */
(() => {
  const root = document.documentElement, app = document.getElementById('app');
  const idle = () => root.classList.toggle('fx-idle', document.hidden); document.addEventListener('visibilitychange', idle); idle();
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !app) return;
  const SEL = '.cr-main .pick-card, .cr-main .tier, .cr-main .shop-card, .cr-main .sp, .cr-main .goal, .cr-main .ap-row, .cr-main tbody tr';
  let q = 0;
  function pass() {
    q = 0; const main = document.querySelector('.cr-main'); if (!main) return;
    if (main.classList.contains('enter')) main.querySelectorAll(SEL).forEach((n, i) => n.style.setProperty('--i', Math.min(i, 14)));
  }
  new MutationObserver(() => { if (!q) q = requestAnimationFrame(pass); }).observe(app, { childList: true, subtree: true });
})();
