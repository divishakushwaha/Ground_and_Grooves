# Database design

```mermaid
erDiagram
  customers ||--o{ orders : places
  orders ||--|{ order_items : contains
  menu_items ||--o{ order_items : "is ordered as"
  customers { int id PK  text name  text phone  text email  text address }
  orders { int id PK  int customer_id FK  text type  text status  int subtotal  int delivery_fee  int total  text notes  text created_at }
  order_items { int id PK  int order_id FK  int menu_item_id FK  int quantity  int unit_price }
  menu_items { int id PK  text name  text category  text description  int price  int veg  int available }
  reservations { int id PK  text name  text phone  text date  text time  int guests  text notes  text status }
  messages { int id PK  text name  text email  text message  text created_at }
```

`order_items.unit_price` stores the price at the time of the order, so old orders stay correct if the menu prices change.
The full SQL is in `database/schema.sql`; sample data is in `database/seed.sql`.
