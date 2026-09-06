# Grounds & Groove — Cafe Website

A single-page website for **Grounds & Groove**, a fictional coffee bar & vinyl record shop in Koramangala, Bangalore. Built with plain HTML, CSS, and vanilla JavaScript — no frameworks, no build step.

## File Structure

```
├── index.html    → All page content and structure
├── style.css     → All visual styling (dark coffee/forest poster theme)
└── script.js     → Two independent interactive features (cart + reservations)
```

## Pages / Sections (all on one HTML page, linked via anchors)

| Section | ID | Purpose |
|---|---|---|
| Header/Nav | — | Sticky nav bar with logo and jump links |
| Hero | `#top` | Headline, tagline, CTA buttons, illustrated poster graphic |
| Our Story | `#about` | Cafe history + hours/location info box |
| Menu | `#menu` | 6 menu items (drinks + food) as cards with images, prices, "Add" buttons |
| Order | `#order` | Live shopping cart + delivery details form |
| Reserve | `#reserve` | Table reservation form |
| Footer | `#contact` | Address, phone, copyright |

## How It Works

### 1. Menu → Cart (delivery ordering)
- Each menu item (`.menu-item`) stores its name/price in `data-name` / `data-price` attributes.
- Clicking **Add** pushes that item into a `cart` array in memory (or increments quantity if already added).
- The cart list and total re-render automatically on every change (`renderCart()`).
- Each cart line has a **remove** link to take an item back out.
- Submitting the delivery form validates name, address, and a 10-digit phone number, then shows a fake confirmation (random order ID + estimated delivery time) and clears the cart/form.

### 2. Table Reservation
- Independent form — not connected to the cart.
- Validates all fields are filled, phone is 10 digits, and the chosen date/time is not in the past.
- On success, shows a fake confirmation (random reservation ID).

### 3. Shared helper
- `showMessage()` is used by both forms to display success/error text under the form (styled green/red via CSS classes).

## Important Notes / Limitations

- **This is a front-end demo only** — there is no backend, database, or payment processing. "Placing an order" or "confirming a reservation" just generates a random ID client-side; nothing is actually saved, sent, or persisted. Refreshing the page wipes everything.
- Menu images are pulled live from Unsplash URLs — an internet connection is required for them to load.
- Fonts (Anton, Fraunces, Work Sans) are loaded from Google Fonts via `<link>` tags in `index.html`.
- All styling is driven by CSS custom properties defined in `:root` in `style.css` (e.g. `--gold`, `--forest`, `--cream`) — change these to re-theme the whole site.
- Fully responsive: layout collapses to single columns below 800px, and menu grid drops to 1 column below 520px.

## To Run

Just open `index.html` in a browser — or serve the folder with any static file server (e.g. `npx serve .`) so relative paths resolve cleanly.

## To Extend

- Wire the delivery/reservation forms up to a real backend (e.g. a form endpoint, Firebase, or a Node/Express API) to actually store orders.
- Add persistence (e.g. `localStorage`, *not supported in Claude artifacts but fine in a real deployed site*) so the cart survives a page refresh.
- Add real payment integration (Razorpay/Stripe) if delivery orders should be paid for online.
