/* =========================================================
   GROUNDS & GROOVE — SCRIPT
   Two independent features:
   1. Delivery cart (add items from menu, place order)
   2. Table reservation form (validate + confirm)
   ========================================================= */

/* ---------- 1. DELIVERY CART ---------- */

// Cart is just an array of objects: { name, price, qty }
let cart = [];

const cartList = document.getElementById('cart-list');
const cartEmptyMsg = document.getElementById('cart-empty-msg');
const cartTotalEl = document.getElementById('cart-total');
const deliveryForm = document.getElementById('delivery-form');
const deliveryMsg = document.getElementById('delivery-msg');

// Attaching a click handler to every "Add" button on the menu
document.querySelectorAll('.add-btn').forEach(function (button) {
  button.addEventListener('click', function () {
    const menuItem = button.closest('.menu-item');
    const name = menuItem.dataset.name;
    const price = Number(menuItem.dataset.price);
    addToCart(name, price);
  });
});

function addToCart(name, price) {
  // If the item is already in the cart, it increases its quantity
  const existing = cart.find(function (item) { return item.name === name; });
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ name: name, price: price, qty: 1 });
  }
  renderCart();
}

function removeFromCart(name) {
  cart = cart.filter(function (item) { return item.name !== name; });
  renderCart();
}

function renderCart() {
  // Clearing the current list
  cartList.innerHTML = '';

  if (cart.length === 0) {
    cartList.appendChild(cartEmptyMsg);
    cartTotalEl.textContent = '₹0';
    return;
  }

  let total = 0;

  cart.forEach(function (item) {
    const lineTotal = item.price * item.qty;
    total += lineTotal;

    const li = document.createElement('li');
    li.innerHTML =
      '<span>' + item.name + ' x' + item.qty + '</span>' +
      '<span>₹' + lineTotal +
      '<button class="cart-item-remove" data-name="' + item.name + '">remove</button></span>';
    cartList.appendChild(li);
  });

  cartTotalEl.textContent = '₹' + total;

  // Wires up the newly created "remove" buttons
  document.querySelectorAll('.cart-item-remove').forEach(function (btn) {
    btn.addEventListener('click', function () {
      removeFromCart(btn.dataset.name);
    });
  });
}

// Handles placing the delivery order
deliveryForm.addEventListener('submit', function (e) {
  e.preventDefault();

  const name = document.getElementById('d-name').value.trim();
  const phone = document.getElementById('d-phone').value.trim();
  const address = document.getElementById('d-address').value.trim();

  if (cart.length === 0) {
    showMessage(deliveryMsg, 'Add at least one item to your cart before ordering.', 'error');
    return;
  }
  if (name === '' || address === '') {
    showMessage(deliveryMsg, 'Please fill in your name and address.', 'error');
    return;
  }
  if (!/^\d{10}$/.test(phone)) {
    showMessage(deliveryMsg, 'Please enter a valid 10-digit phone number.', 'error');
    return;
  }

  // "Place" the order: generates a fake order ID and estimated time
  const orderId = 'GG-' + Math.floor(1000 + Math.random() * 9000);
  const estMinutes = 30 + Math.floor(Math.random() * 15); // 30-45 minutes

  showMessage(
    deliveryMsg,
    'Order ' + orderId + ' confirmed! Estimated delivery to ' + name + ' in ' + estMinutes + ' minutes.',
    'success'
  );

  // Resets cart and forms after a successful order
  cart = [];
  renderCart();
  deliveryForm.reset();
});

/* ---------- 2. TABLE RESERVATION ---------- */

const reservationForm = document.getElementById('reservation-form');
const reservationMsg = document.getElementById('reservation-msg');

reservationForm.addEventListener('submit', function (e) {
  e.preventDefault();

  const name = document.getElementById('r-name').value.trim();
  const phone = document.getElementById('r-phone').value.trim();
  const date = document.getElementById('r-date').value;
  const time = document.getElementById('r-time').value;
  const guests = document.getElementById('r-guests').value;

  if (name === '' || date === '' || time === '' || guests === '') {
    showMessage(reservationMsg, 'Please fill in every field to reserve a table.', 'error');
    return;
  }
  if (!/^\d{10}$/.test(phone)) {
    showMessage(reservationMsg, 'Please enter a valid 10-digit phone number.', 'error');
    return;
  }

  // Checks if Reservation date is in the past
  const chosenDate = new Date(date + 'T' + time);
  if (chosenDate < new Date()) {
    showMessage(reservationMsg, 'Please choose a date and time in the future.', 'error');
    return;
  }

  const reservationId = 'RES-' + Math.floor(1000 + Math.random() * 9000);

  showMessage(
    reservationMsg,
    'Table reserved! Confirmation ' + reservationId + ' for ' + guests + ' guest(s) on ' + date + ' at ' + time + '.',
    'success'
  );

  reservationForm.reset();
});

/* ---------- SHARED HELPER ---------- */

function showMessage(element, text, type) {
  element.textContent = text;
  element.className = 'form-msg ' + type; // 'success' or 'error'
}
