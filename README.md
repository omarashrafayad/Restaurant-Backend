# Take Five Backend

Backend for the **Take Five** restaurant: the customer ordering app and the restaurant dashboard.
Built with NestJS 12, TypeScript (ESM) and MongoDB (Mongoose 9).

## What it does

**Customers**
- Account with phone number and saved addresses (delivery area, building/floor/apartment, landmark, GPS location / maps link)
- Menu with live prices, so scheduled offers show up automatically
- Cart with per-item kitchen notes ("no onions") and coupons
- Checkout preview: delivery fee per area, minimum order, open/closed status
- Cash-on-delivery orders with a short order number (#1001…)
- Live tracking and a countdown once the restaurant accepts; restaurant phone/WhatsApp included in every order
- Cancel while the order is still pending, rate it (stars + comment) after delivery, reorder
- Push notifications plus an in-app inbox for order updates and offers

**Restaurant**
- New orders arrive instantly with the customer's details and an alarm (Socket.IO + high-priority push)
- Accept with an ETA, or reject with a reason (ready-made reasons included); strict status workflow with a full timeline
- Delivery limited to configured areas, each with its own fee, minimum order and ETA
- Opening hours (including after-midnight closing) plus a one-tap "pause orders" switch
- Scheduled offers on the whole menu, categories or specific items, by date range, day of week and time window
- Daily and period sales reports in Cairo time (orders, sales, top items, areas, hours, rejection reasons, ratings), plus an end-of-day summary push

See [docs/API-FLOWS.md](docs/API-FLOWS.md) for the endpoint flows and [docs/REALTIME.md](docs/REALTIME.md) for socket events and push setup.
Swagger UI: `http://localhost:5000/api/docs`.

## Quick start

Requirements: Node.js ≥ 20.11 and MongoDB **with a replica set**. Atlas works out of the box; for local development use the docker compose file. Transactions are used for checkout.

```bash
cp .env.example .env          # fill in MONGO_URI and JWT_SECRET at minimum
npm ci                        # on machines with a system libvips: SHARP_IGNORE_GLOBAL_LIBVIPS=1 npm ci
npm run build
ADMIN_EMAIL=owner@example.com ADMIN_PASSWORD='a-strong-password' npm run seed
npm run start:dev
```

`npm run seed` creates the admin account, the default restaurant settings and two starter areas (Madinaty, El Shorouk). The areas are created **inactive with a 0 fee**: set the real fees from the dashboard before activating them.

### With Docker

```bash
cp .env.example .env
docker compose up -d --build
docker compose exec -e ADMIN_EMAIL=owner@example.com -e ADMIN_PASSWORD='a-strong-password' api npm run seed
```

## Configuration

Every variable is documented in [.env.example](.env.example). The important ones:

| Variable | Notes |
|---|---|
| `MONGO_URI` | `DATABASE` is accepted as an alias |
| `JWT_SECRET` | **Required**, at least 32 random characters. The app refuses to start otherwise |
| `BASE_URL` | Public API URL, used to build image URLs |
| `CORS_ORIGINS` | Comma-separated allowed origins (set this in production) |
| `EMAIL_USER` / `EMAIL_PASSWORD` | Gmail address + App Password, for password reset codes |
| `FIREBASE_*` | Enables push notifications (optional, the API works without it) |
| `RESTAURANT_TIMEZONE` | Defaults to `Africa/Cairo` (used for opening hours, offers and reports) |

## Tests

End-to-end tests boot the real app against a throw-away database on a local replica set:

```bash
docker run -d --name takefive_mongo --ulimit nofile=64000:64000 -p 27027:27017 mongo:7 --replSet rs0 --bind_ip_all
docker exec takefive_mongo mongosh --quiet --eval 'rs.initiate({_id:"rs0",members:[{_id:0,host:"localhost:27017"}]})'
npm run test:e2e
```

Set `TEST_MONGO_URL` to use another server. CI runs the same suite on every push (`.github/workflows/ci.yml`).

## Project layout

```
src/
  auth/            signup, login, password reset, JWT + role guards
  users/ addresses/  profiles and delivery addresses (linked to delivery zones)
  categories/ subcategories/ brands/ products/   menu
  pricing/         single source of truth for prices (sale price + running offers)
  cart/            cart with per-item notes and coupons
  orders/          checkout (transactional), status machine, tracking, reviews, reorder
  delivery-zones/  areas, fees, minimum order, ETA
  promotions/      scheduled offers + "offer started" notifier (cron)
  notifications/   FCM push, device tokens, inbox, order notification listener
  realtime/        Socket.IO gateway (/realtime)
  reports/         daily / range / summary reports + end-of-day push
  settings/        restaurant profile, phones, opening hours, pause switch
  common/          config, errors, interceptors, utils (time zones, money, regex)
```

Security defaults: helmet, per-IP rate limiting (stricter on auth routes), whitelisted request validation, escaped search input, password hashes and reset codes never selected, image uploads limited to 5 MB JPEG/PNG/WEBP, and timing-safe forgot-password responses.
