// Loads the menu from the API, groups it by category and lets people add items to the cart. Owner: Member 2
(async function () {
  const list = document.getElementById('menu-list');
  const filters = document.getElementById('filters');
  let menu = [], active = 'All', query = '', vegOnly = false;

  function render() {
    const shown = menu.filter(i => (!vegOnly || i.veg) && (i.name + ' ' + i.description).toLowerCase().includes(query));
    const cats = [...new Set(shown.map(i => i.category))].filter(c => active === 'All' || c === active);
    if (cats.length === 0) { list.innerHTML = '<p class="alert error">Nothing matches that. Clear the search or the filters to see the full menu.</p>'; return; }
    list.innerHTML = cats.map(cat => `
      <section class="menu-cat">
        <h2>${cat}</h2>
        <div class="items">
          ${shown.filter(i => i.category === cat).map(i => `
            <article class="item">
              ${imgTag(i)}
              <div class="body">
                <h3><span class="dot ${i.veg ? '' : 'nonveg'}" title="${i.veg ? 'Vegetarian' : 'Non-vegetarian'}"></span>${escapeHtml(i.name)}</h3>
                <p>${escapeHtml(i.description)}</p>
              </div>
              <div class="foot"><span class="price">${rupees(i.price)}</span>
                <button class="btn ghost" data-id="${i.id}" aria-label="Add ${escapeHtml(i.name)} to order">Add</button></div>
            </article>`).join('')}
        </div>
      </section>`).join('');
  }

  function renderFilters() {
    const names = ['All', ...new Set(menu.map(i => i.category))];
    filters.innerHTML = names.map(n => `<button class="chip" aria-pressed="${n === active}" data-cat="${n}">${n}</button>`).join('');
  }

  filters.addEventListener('click', (e) => {
    const b = e.target.closest('[data-cat]');
    if (!b) return;
    active = b.dataset.cat; renderFilters(); render();
  });
  document.getElementById('search').addEventListener('input', (e) => { query = e.target.value.trim().toLowerCase(); render(); });
  document.getElementById('veg-only').addEventListener('change', (e) => { vegOnly = e.target.checked; render(); });
  list.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-id]');
    if (b) { Cart.add(Number(b.dataset.id)); showToast('Added to your order'); }
  });

  try { menu = await api('/menu'); renderFilters(); render(); }
  catch (err) { list.innerHTML = `<p class="alert error">${err.message} Make sure the server is running.</p>`; }
})();
