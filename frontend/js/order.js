// Cart, delivery/pickup choice and order submission. Owner: Member 3
(async function () {
  const FEE = 40, FREE_ABOVE = 600;     // must match backend/controllers/orders.controller.js
  const box = document.getElementById('cart-box');
  const form = document.getElementById('order-form');
  const msg = document.getElementById('order-msg');
  let menu = [];

  const type = () => form.elements.type.value;

  function render() {
    const cart = Cart.get();
    const lines = Object.entries(cart).map(([id, qty]) => ({ item: menu.find(m => m.id === Number(id)), qty })).filter(l => l.item);
    if (lines.length === 0) {
      box.innerHTML = '<div class="empty"><p>Your cart is empty.</p><a class="btn" href="menu.html">Browse the menu</a></div>';
      document.getElementById('place-btn').disabled = true;
      return;
    }
    document.getElementById('place-btn').disabled = false;
    const subtotal = lines.reduce((s, l) => s + l.item.price * l.qty, 0);
    const fee = type() === 'delivery' && subtotal < FREE_ABOVE ? FEE : 0;
    box.innerHTML = lines.map(l => `
      <div class="cart-line">
        <div><strong>${l.item.name}</strong><br><small>${rupees(l.item.price)} each</small></div>
        <div class="qty" role="group" aria-label="Quantity of ${l.item.name}">
          <button data-act="dec" data-id="${l.item.id}" aria-label="Fewer">−</button><span>${l.qty}</span><button data-act="inc" data-id="${l.item.id}" aria-label="More">+</button>
        </div>
        <div>${rupees(l.item.price * l.qty)}</div>
      </div>`).join('') + `
      <div class="totals">
        <div><span>Subtotal</span><span>${rupees(subtotal)}</span></div>
        <div><span>Delivery fee</span><span>${fee ? rupees(fee) : 'Free'}</span></div>
        <div class="grand"><span>Total</span><span>${rupees(subtotal + fee)}</span></div>
      </div>`;
  }

  function toggleAddress() {
    const delivery = type() === 'delivery';
    document.getElementById('address-field').hidden = !delivery;
    render();
  }

  box.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-act]');
    if (!b) return;
    const id = Number(b.dataset.id), cur = Cart.get()[id] || 0;
    Cart.setQty(id, b.dataset.act === 'inc' ? cur + 1 : cur - 1);
  });
  document.addEventListener('cart:changed', render);
  form.addEventListener('change', (e) => { if (e.target.name === 'type') toggleAddress(); });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    msg.hidden = true;
    const items = Object.entries(Cart.get()).map(([id, qty]) => ({ id: Number(id), qty }));
    try {
      const order = await api('/orders', { method: 'POST', body: {
        name: form.elements.name.value, phone: form.elements.phone.value,
        address: form.elements.address.value, notes: form.elements.notes.value,
        type: type(), items,
      }});
      Cart.clear();
      localStorage.setItem('gg_last_order', JSON.stringify({ id: order.id, phone: form.elements.phone.value }));
      const when = type() === 'delivery' ? 'It will reach you in about 45 minutes.' : 'It will be ready at the counter in about 15 minutes.';
      document.querySelector('.order-grid').innerHTML = `
        <div class="card done"><h2>Thank you, order #${order.id} is confirmed</h2>
        <p>${when} Total to pay: <strong>${rupees(order.total)}</strong>.</p>
        <p><a class="btn" href="track.html">Track this order</a> <a class="btn ghost" href="menu.html">Order something else</a></p></div>`;
    } catch (err) { showAlert(msg, 'error', err.message); }
  });

  try { menu = await api('/menu'); toggleAddress(); }
  catch (err) { box.innerHTML = `<p class="alert error">${err.message}</p>`; }
})();
