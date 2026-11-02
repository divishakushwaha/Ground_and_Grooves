// Shows three favourite items on the home page. Owner: Member 1
(async function () {
  const box = document.getElementById('favourites');
  try {
    const menu = await api('/menu');
    const picks = [menu.find(i => i.name === 'Flat White'), menu.find(i => i.name === 'Almond Croissant'), menu.find(i => i.name === 'Avocado Sourdough')].filter(Boolean);
    box.innerHTML = picks.map(i => `
      <article class="fav">
        ${imgTag(i)}
        <div class="fav-body"><h3>${escapeHtml(i.name)}</h3><p>${escapeHtml(i.description)}</p></div>
        <div class="price">${rupees(i.price)}</div>
        <button class="btn ghost" data-id="${i.id}">Add to order</button>
      </article>`).join('');
    box.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-id]');
      if (b) { Cart.add(Number(b.dataset.id)); showToast('Added to your order'); }
    });
  } catch (err) {
    box.innerHTML = '<p class="alert error">We could not load the menu. Make sure the server is running.</p>';
  }
})();
