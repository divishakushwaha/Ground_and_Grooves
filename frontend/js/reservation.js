// Table booking and cancellation. Owner: Member 4
(function () {
  const form = document.getElementById('res-form');
  const msg = document.getElementById('res-msg');
  const guests = document.getElementById('guests');

  guests.innerHTML = Array.from({ length: 12 }, (_, i) => `<option value="${i + 1}" ${i === 1 ? 'selected' : ''}>${i + 1} ${i ? 'guests' : 'guest'}</option>`).join('');

  const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  form.elements.date.min = today;
  form.elements.date.value = today;

  const chips = document.getElementById('time-chips');
  chips.innerHTML = ['09:00', '11:00', '13:00', '16:00', '19:00', '20:30'].map(t => `<button type="button" class="chip" data-t="${t}">${t}</button>`).join('');
  chips.addEventListener('click', (e) => { const b = e.target.closest('[data-t]'); if (b) form.elements.time.value = b.dataset.t; });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    msg.hidden = true;
    try {
      const r = await api('/reservations', { method: 'POST', body: {
        name: form.elements.name.value, phone: form.elements.phone.value,
        date: form.elements.date.value, time: form.elements.time.value,
        guests: form.elements.guests.value, notes: form.elements.notes.value,
      }});
      const day = new Date(r.date + 'T00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
      showAlert(msg, 'ok', `Booked! ${r.name}, table for ${r.guests} on ${day} at ${r.time}. Your booking number is ${r.id}. Keep it in case you need to cancel.`);
      form.reset(); form.elements.date.value = today; form.elements.time.value = '19:00'; guests.value = '2';
    } catch (err) { showAlert(msg, 'error', err.message); }
  });

  const cancel = document.getElementById('cancel-form');
  const cmsg = document.getElementById('cancel-msg');
  cancel.addEventListener('submit', async (e) => {
    e.preventDefault();
    cmsg.hidden = true;
    try {
      await api(`/reservations/${encodeURIComponent(document.getElementById('c-id').value)}/cancel`, { method: 'POST', body: { phone: document.getElementById('c-phone').value } });
      showAlert(cmsg, 'ok', 'Your booking has been cancelled.');
      cancel.reset();
    } catch (err) { showAlert(cmsg, 'error', err.message); }
  });
})();
