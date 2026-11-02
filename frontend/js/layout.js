// Builds the shared header and footer so every page stays consistent. Owner: Member 1
(function () {
  const page = document.body.dataset.page;
  const root = document.body.dataset.root || '';
  const link = (href, label, key) => `<a href="${root}${href}" ${page === key ? 'aria-current="page"' : ''}>${label}</a>`;

  document.getElementById('site-header').innerHTML = `
    <a class="skip" href="#main">Skip to content</a>
    <header class="site-header"><div class="wrap">
      <a class="brand" href="${root}index.html">Grounds <span>&amp;</span> Groves</a>
      <button class="nav-toggle" aria-expanded="false" aria-controls="nav" aria-label="Open menu"><span></span><span></span><span></span></button>
      <nav class="nav" id="nav" aria-label="Main">
        ${link('index.html', 'Home', 'home')}
        ${link('pages/menu.html', 'Menu', 'menu')}
        ${link('pages/reservation.html', 'Reserve a table', 'reservation')}
        ${link('pages/track.html', 'Track order', 'track')}
        ${link('pages/about.html', 'About', 'about')}
        ${link('pages/contact.html', 'Contact', 'contact')}
        <a class="cart-pill" href="${root}pages/order.html">Order <span id="cart-count">0</span></a>
      </nav>
    </div></header>`;

  document.getElementById('site-footer').innerHTML = `
    <footer class="site-footer"><div class="wrap">
      <div><h3>Grounds &amp; Groves</h3><p>Coffee roasted slowly, food made from scratch.</p></div>
      <div><h3>Open daily</h3><p>8:00 am to 10:00 pm</p><p>Delivery until 9:30 pm</p></div>
      <div><h3>Find us</h3><p>14 Garden Lane, Sector 7</p><p>hello@groundsandgroves.example</p></div>
      <small>Web Development group project. <a href="${root}pages/admin.html">Staff login</a>
        <span id="mode-note" hidden> | Demo mode: no server found, so data is saved in this browser only.</span></small>
    </div></footer>`;

  const toggle = document.querySelector('.nav-toggle'), nav = document.getElementById('nav');
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });

  const update = () => { document.getElementById('cart-count').textContent = Cart.count(); };
  document.addEventListener('cart:changed', update);
  update();
  if (typeof offline !== 'undefined' && offline) document.getElementById('mode-note').hidden = false;
})();
