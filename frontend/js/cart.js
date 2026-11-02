// The cart lives in the browser (localStorage) as { menuItemId: quantity }.
const Cart = {
  key: 'gg_cart',
  get() { try { return JSON.parse(localStorage.getItem(this.key)) || {}; } catch { return {}; } },
  save(c) { localStorage.setItem(this.key, JSON.stringify(c)); document.dispatchEvent(new Event('cart:changed')); },
  add(id) { const c = this.get(); c[id] = Math.min((c[id] || 0) + 1, 20); this.save(c); },
  setQty(id, q) { const c = this.get(); if (q <= 0) delete c[id]; else c[id] = Math.min(q, 20); this.save(c); },
  clear() { this.save({}); },
  count() { return Object.values(this.get()).reduce((a, b) => a + b, 0); },
};
