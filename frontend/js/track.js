// Order tracking. Owner: Member 3
(function () {
  const form = document.getElementById('track-form'), msg = document.getElementById('track-msg'), out = document.getElementById('result');
  let timer = null;

  const flow = {
    delivery: [['received', 'Order received'], ['preparing', 'Being prepared'], ['out_for_delivery', 'Out for delivery'], ['completed', 'Delivered']],
    pickup:   [['received', 'Order received'], ['preparing', 'Being prepared'], ['ready', 'Ready at the counter'], ['completed', 'Collected']],
  };

  function draw(o) {
    const steps = flow[o.type], at = steps.findIndex(s => s[0] === o.status);
    const bill = o.items.map(i => `<div><span>${i.quantity} x ${escapeHtml(i.name)}</span><span>${rupees(i.quantity * i.unit_price)}</span></div>`).join('');
    out.innerHTML = `<div class="card">
      <h2>Order #${o.id}</h2>
      <p>${o.type === 'delivery' ? 'Home delivery' : 'Pickup'} for ${escapeHtml(o.customer_name)}</p>
      ${o.status === 'cancelled' ? '<p class="alert error">This order was cancelled. Please call us if this is a mistake.</p>' : `
      <ol class="steps">${steps.map((s, i) => `<li class="${i < at || o.status === 'completed' ? 'done' : i === at ? 'now' : ''}">${s[1]}</li>`).join('')}</ol>`}
      <div class="bill">${bill}
        ${o.delivery_fee ? `<div><span>Delivery fee</span><span>${rupees(o.delivery_fee)}</span></div>` : ''}
        <div><strong>Total</strong><strong>${rupees(o.total)}</strong></div></div></div>`;
  }

  async function check() {
    msg.hidden = true;
    try {
      const o = await api(`/orders/${encodeURIComponent(form.elements.oid.value.trim())}?phone=${encodeURIComponent(form.elements.ophone.value.trim())}`);
      draw(o);
      clearInterval(timer);
      if (!['completed', 'cancelled'].includes(o.status)) timer = setInterval(() => check().catch(() => {}), 15000);  // refresh automatically
    } catch (err) { out.innerHTML = ''; clearInterval(timer); showAlert(msg, 'error', err.message); }
  }

  form.addEventListener('submit', (e) => { e.preventDefault(); check(); });

  try {   // prefill with the order just placed on this device
    const last = JSON.parse(localStorage.getItem('gg_last_order'));
    if (last) { form.elements.oid.value = last.id; form.elements.ophone.value = last.phone; check(); }
  } catch (e) { /* nothing saved */ }
})();
