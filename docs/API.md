# API reference

Base URL: `http://localhost:3000/api`. All bodies are JSON. Errors look like `{ "error": "message" }`.

| Method | Path | Purpose |
|---|---|---|
| GET | `/health` | Check that the server is running |
| GET | `/menu` | List available menu items |
| POST | `/orders` | Place an order |
| GET | `/orders/:id?phone=...` | Track an order (needs the phone used to order) |
| POST | `/reservations` | Book a table |
| POST | `/reservations/:id/cancel` | Cancel a booking (body: `phone`) |
| POST | `/contact` | Send a message to the cafe |

## POST /orders
```json
{ "name": "Asha", "phone": "9876543210", "type": "delivery",
  "address": "12 MG Road", "notes": "No sugar",
  "items": [ { "id": 1, "qty": 2 } ] }
```
Response `201`: `{ "id": 7, "subtotal": 240, "delivery_fee": 40, "total": 280, "status": "received" }`

## POST /reservations
```json
{ "name": "Asha", "phone": "9876543210", "date": "2026-11-02",
  "time": "19:00", "guests": 4, "notes": "Window seat" }
```
Response `201`: `{ "id": 3, "name": "Asha", "date": "2026-11-02", "time": "19:00", "guests": 4, "status": "confirmed" }`
Returns `409` when the slot is full.

## POST /contact
```json
{ "name": "Ravi", "email": "ravi@example.com", "message": "Do you host events?" }
```

## Staff endpoints
Send the header `x-admin-key: grove123` (or your `ADMIN_KEY`).

| Method | Path | Purpose |
|---|---|---|
| GET | `/admin/summary` | All orders, reservations and messages |
| POST | `/admin/orders/:id/status` | Body `{ "status": "preparing" }`. Allowed: received, preparing, out_for_delivery, ready, completed, cancelled |
| POST | `/admin/reservations/:id/status` | Body `{ "status": "cancelled" }`. Allowed: confirmed, cancelled |
