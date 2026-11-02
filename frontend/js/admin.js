// Staff dashboard: view orders, reservations and messages, and change their status. Owner: Member 5
(function () {
  const login = document.getElementById('login'), panel = document.getElementById('panel');
  const box = document.getElementById('table-box'), stats = document.getElementById('stats');
  const lmsg = document.getElementById('login-msg'), amsg = document.getElementById('admin-msg');
  const ORDER_STATUS = { received: 'Received', preparing: 'Preparing', out_for_delivery: 'Out for delivery', ready: 'Ready for pickup', completed: 'Completed', cancelled: 'Cancelled' };
  const RES_STATUS = { confirmed: 'Confirmed', cancelled: 'Cancelled' };
  let data = null, tab = 'orders';

  const key = () => sessionStorage.getItem('gg_admin_key') || '';
  const headers = () => ({ 'x-admin-key': key() });
  const select = (kind, id, current, options) =>
    `<select data-kind="${kind}" data-id="${id}" aria-label="Status">${Object.entries(options).map(([v, l]) => `<option value="${v}" ${v === current ? 'selected' : ''}>${l}</option>`).join('')}</select>`;
  const when = (iso) => new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

  function draw() {
    const open = data.orders.filter(o => !['completed', 'cancelled'].includes(o.status)).length;
    const todays = data.reservations.filter(r => r.status === 'confirmed' && r.date >= new Date().toISOString().slice(0, 10)).length;
    stats.innerHTML = `<div class="stat"><b>${open}</b>Open orders</div><div class="stat"><b>${todays}</b>Upcoming bookings</div>
      <div class="stat"><b>${rupees(data.orders.filter(o => o.status === 'completed').reduce((s, o) => s + o.total, 0))}</b>Completed sales</div>
      <div class="stat"><b>${data.messages.length}</b>Messages</div>`;

    const rows = {
      orders: [['#', 'When', 'Customer', 'Order', 'Total', 'Status'], data.orders.map(o => [o.id, when(o.created_at),
        `${escapeHtml(o.name)}<br>${escapeHtml(o.phone)}${o.type === 'delivery' ? '<br>' + escapeHtml(o.address) : '<br><em>Pickup</em>'}`,
        escapeHtml(o.items) + (o.notes ? `<br><em>Note: ${escapeHtml(o.notes)}</em>` : ''), rupees(o.total), select('orders', o.id, o.status, ORDER_STATUS)])],
      reservations: [['#', 'Date', 'Time', 'Name', 'Guests', 'Notes', 'Status'], data.reservations.map(r => [r.id, r.date, r.time,
        `${escapeHtml(r.name)}<br>${escapeHtml(r.phone)}`, r.guests, escapeHtml(r.notes || ''), select('reservations', r.id, r.status, RES_STATUS)])],
      messages: [['#', 'When', 'From', 'Message'], data.messages.map(m => [m.id, when(m.created_at), `${escapeHtml(m.name)}<br>${escapeHtml(m.email)}`, escapeHtml(m.message)])],
    }[tab];
    box.innerHTML = rows[1].length
      ? `<table><thead><tr>${rows[0].map(h => `<th scope="col">${h}</th>`).join('')}</tr></thead><tbody>${rows[1].map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`
      : `<p class="empty-row">Nothing here yet.</p>`;
  }

  async function load() {
    amsg.hidden = true;
    try { data = await api('/admin/summary', { headers: headers() }); login.hidden = true; panel.hidden = false; draw(); }
    catch (err) { sessionStorage.removeItem('gg_admin_key'); panel.hidden = true; login.hidden = false; showAlert(lmsg, 'error', err.message); }
  }

  login.addEventListener('submit', (e) => { e.preventDefault(); sessionStorage.setItem('gg_admin_key', document.getElementById('key').value); load(); });
  document.getElementById('refresh').addEventListener('click', load);
  document.getElementById('logout').addEventListener('click', () => { sessionStorage.removeItem('gg_admin_key'); location.reload(); });
  document.querySelector('.tabbar').addEventListener('click', (e) => {
    const b = e.target.closest('[data-tab]'); if (!b) return;
    tab = b.dataset.tab;
    document.querySelectorAll('[data-tab]').forEach(t => t.setAttribute('aria-pressed', t === b));
    draw();
  });
  box.addEventListener('change', async (e) => {
    const s = e.target.closest('select[data-id]'); if (!s) return;
    try { await api(`/admin/${s.dataset.kind}/${s.dataset.id}/status`, { method: 'POST', headers: headers(), body: { status: s.value } }); showToast('Status updated'); load(); }
    catch (err) { showAlert(amsg, 'error', err.message); }
  });

  if (key()) load();
})();
