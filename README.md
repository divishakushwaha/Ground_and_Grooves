# Grounds & Groves

A full-stack cafe website built as a group web development project. Customers can browse the menu, order for **home delivery or pickup**, **reserve a table**, and contact the cafe.

| Layer | Technology |
|---|---|
| Frontend | HTML, CSS, vanilla JavaScript |
| Backend | Node.js + Express (REST API) |
| Database | SQLite (via `better-sqlite3`) |

## Run it

**Option A: just open the website (no install).** Double-click `frontend/index.html`. Every feature works; data is saved in your browser (demo mode, shown in the footer).

**Option B: full stack with the real database.**

You need [Node.js](https://nodejs.org) 18 or newer.

```bash
cd backend
npm install
npm start
```

Open **http://localhost:3000**. The server creates the database and loads the sample menu on first run. It also serves the frontend, so there is nothing else to start.

Run the API checks with `npm test` (inside `backend/`).

## Project structure

```
grounds-and-groves/
├── frontend/
│   ├── index.html              Home page
│   ├── pages/                  menu, order, track, reservation, about, contact, admin
│   ├── css/                    global.css (shared theme) + one file per page
│   ├── js/                     api.js, localdb.js (offline mode), cart.js, layout.js + one file per page
│   └── assets/menu/            illustrated pictures for every menu item (SVG)
├── backend/
│   ├── server.js               Express app
│   ├── config/db.js            database connection and setup
│   ├── routes/                 URL definitions
│   ├── controllers/            request logic and validation
│   └── test.js                 API tests
├── database/
│   ├── schema.sql              table definitions
│   └── seed.sql                sample menu items (with picture file names)
├── docs/
│   ├── API.md                  all endpoints
│   └── DATABASE.md             ER diagram
├── CONTRIBUTING.md             Git workflow for the team
└── README.md
```

## Who built what

Each member owns one area end to end. Replace the names below with your team.

| Area | Owner | Files |
|---|---|---|
| Home, theme, About, Contact, docs | Member 1: _name_ | `index.html`, `pages/about.html`, `pages/contact.html`, `css/global.css`, `css/home.css`, `css/about.css`, `css/contact.css`, `js/layout.js`, `js/home.js`, `js/contact.js`, `backend/*/contact.*`, `docs/`, `README.md`, `CONTRIBUTING.md` |
| Menu, reservations, database | Member 2: _name_ | `pages/menu.html`, `pages/reservation.html`, `assets/menu/`, `css/menu.css`, `css/reservation.css`, `js/menu.js`, `js/menu-data.js`, `js/reservation.js`, `backend/*/menu.*`, `backend/*/reservations.*`, `database/` |
| Orders, tracking, staff dashboard, server | Member 3: _name_ | `pages/order.html`, `pages/track.html`, `pages/admin.html`, `css/order.css`, `css/track.css`, `css/admin.css`, `js/order.js`, `js/track.js`, `js/admin.js`, `js/cart.js`, `js/api.js`, `js/localdb.js`, `backend/server.js`, `backend/config/`, `backend/test.js`, `backend/*/orders.*`, `backend/*/admin.*`, `backend/package.json` |

## Features

- Dark theme (forest green and amber) across every page
- Menu loaded from the database, with a picture for each dish, search, category filters, a vegetarian-only switch and vegetarian markers
- Cart saved in the browser, with quantity controls
- Delivery or pickup ordering; the server recalculates prices so totals cannot be tampered with
- Delivery fee of ₹40, free above ₹600
- Table reservations with date, time and guest validation, a limit of 8 bookings per time slot, and cancellation by booking number and phone
- **Order tracking:** enter the order number and phone to see live progress (auto-refreshes)
- **Staff dashboard** (`pages/admin.html`, demo key `grove123`): see orders, bookings and messages, and update statuses. Set `ADMIN_KEY` in the environment to change the key.
- Contact form saved to the database
- Works with or without the backend: if no server is found, the site uses a browser database (`js/localdb.js`) that follows the same rules
- Responsive layout with a mobile menu, skip link, keyboard focus styles, and reduced-motion support

## Ideas for future work

Online payments, user accounts, and email or SMS confirmations.
