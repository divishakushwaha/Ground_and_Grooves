// Talks to the backend. If no backend is running (for example when index.html is opened directly),
// it quietly switches to the browser database in localdb.js so the whole site still works.
const API = location.protocol === 'file:' ? 'http://localhost:3000/api' : '/api';
let offline = false;

function goOffline() {
  offline = true;
  const note = document.getElementById('mode-note');
  if (note) note.hidden = false;
}

async function api(path, options = {}) {
  const method = options.method || 'GET';
  const headers = options.headers || {};
  if (!offline) {
    try {
      const res = await fetch(API + path, {
        method,
        headers: { 'Content-Type': 'application/json', ...headers },
        body: options.body ? JSON.stringify(options.body) : undefined,
      });
      if ((res.headers.get('content-type') || '').includes('application/json')) {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
        return data;
      }
      goOffline();                      // a server answered, but it is not our API
    } catch (e) {
      if (e instanceof TypeError) goOffline(); else throw e;   // TypeError = server not reachable
    }
  }
  return LocalAPI.handle(path, method, options.body || {}, headers);
}

const rupees = (n) => '₹' + Number(n).toLocaleString('en-IN');

function showToast(text) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.setAttribute('role', 'status');
  t.textContent = text;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2200);
}

function showAlert(el, kind, text) {
  el.className = 'alert ' + kind;
  el.textContent = text;
  el.hidden = false;
}

const escapeHtml = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Picture for a menu item. A real photo (assets/menu/<name>.jpg) is used when it exists;
// otherwise the site falls back to the illustration (<name>.svg).
function imageFor(item) {
  const root = document.body.dataset.root || '';
  const file = item.image || item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '.svg';
  return root + 'assets/menu/' + file.replace(/\.svg$/, '.jpg');
}
function imageFallback(item) { return imageFor(item).replace(/\.jpg$/, '.svg'); }
function imgTag(item) {
  return `<img src="${imageFor(item)}" data-fallback="${imageFallback(item)}" alt="${escapeHtml(item.name)}" loading="lazy" width="400" height="300">`;
}
document.addEventListener('error', (e) => {
  const img = e.target;
  if (img.tagName === 'IMG' && img.dataset.fallback && img.getAttribute('src') !== img.dataset.fallback) img.src = img.dataset.fallback;
}, true);
