/* TripTrail — micro-animation helpers. Uses Motion One (window.Motion) when present,
   else falls back to the native Web Animations API. All gated by prefers-reduced-motion.
   Loads AFTER format.js (which defines TT.anim.countUp); augments the same TT.anim object. */
window.TT = window.TT || {};
TT.anim = TT.anim || {};

(function () {
  const reduce = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const M = () => window.Motion;
  const toList = (els) => (els == null ? [] : (els instanceof Element ? [els] : [...els]));

  /** Staggered fade + slide-in for a set of elements (list rows, cards). */
  TT.anim.enter = function (els) {
    if (reduce()) return;
    const list = toList(els);
    if (!list.length) return;
    const motion = M();
    if (motion && motion.animate) {
      try {
        motion.animate(list,
          { opacity: [0, 1], transform: ['translateY(8px)', 'translateY(0)'] },
          { delay: motion.stagger ? motion.stagger(0.04) : 0, duration: 0.35, easing: 'ease-out' });
        return;
      } catch (e) { /* fall through to WAAPI */ }
    }
    list.forEach((el, i) => el.animate && el.animate(
      [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }],
      { duration: 300, delay: i * 40, easing: 'ease-out', fill: 'backwards' }));
  };

  /** Brief ring pulse to draw the eye to a changed value (e.g. totals). */
  TT.anim.pulse = function (el) {
    if (!el || reduce() || !el.animate) return;
    el.animate(
      [{ boxShadow: '0 0 0 0 rgba(37,99,235,0.45)' }, { boxShadow: '0 0 0 10px rgba(37,99,235,0)' }],
      { duration: 600, easing: 'ease-out' });
  };
})();
