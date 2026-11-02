// Contact form. Owner: Member 5
(function () {
  const form = document.getElementById('contact-form');
  const msg = document.getElementById('contact-msg');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    msg.hidden = true;
    try {
      await api('/contact', { method: 'POST', body: {
        name: form.elements.name.value, email: form.elements.email.value, message: form.elements.message.value,
      }});
      showAlert(msg, 'ok', 'Thanks for writing to us. We will reply within a day.');
      form.reset();
    } catch (err) { showAlert(msg, 'error', err.message); }
  });
})();
