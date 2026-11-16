# Realtime events & push notifications

This is for the developers of the **customer app** and the **restaurant dashboard / cashier app**.

## 1. Socket.IO

- URL: `BASE_URL` + namespace `/realtime` (the socket.io path stays the default `/socket.io`, not under `/api/v1`)
- Auth: the same JWT used for the REST API

```js
import { io } from 'socket.io-client';

const socket = io(`${BASE_URL}/realtime`, {
  auth: { token: accessToken },
  transports: ['websocket'],
});
socket.on('connect_error', (err) => { /* err.message === 'Unauthorized' -> re-login */ });
```

After connecting, every user joins their own room. Admins and managers also join the `staff` room. Clients never pick rooms.

### Events

| Event | Who receives it | Payload | What the app should do |
|---|---|---|---|
| `order:new` | staff | `{ order, playSound: true }`. `order` is the full order: `customer {name, phone}`, `shippingAddress` (zone, details, building, floor, apartment, landmark, coordinates, locationUrl), `cartItems[]` with `notes`, `notes`, totals | Show the order with **Accept / Reject** and **play the alarm sound in a loop** until someone handles it |
| `orders:pending_count` | staff | `{ count }` | Badge on the orders tab. Stop the alarm when `count === 0` |
| `order:updated` | staff + the order's customer | `{ _id, orderNumber, status, estimatedDeliveryTime, remainingMinutes, rejectionReason, cancellationReason, cancelledBy, updatedAt }` (staff also get `previousStatus`, `actor`) | Customer: update the tracking screen and countdown. Staff: move the card on the board |
| `order:reviewed` | staff | `{ _id, orderNumber, review: {ratings, comment}, customer }` | Toast "new rating" |
| `notification:new` | the customer (or everyone for offers) | inbox item `{ _id, type, title, body, data }` | Increase the bell badge |
| `restaurant:status` | everyone | `{ isOpen, acceptingOrders, withinOpeningHours, message }` | Show or hide the "closed" banner and disable checkout |

### Countdown timer

When the restaurant accepts an order, it gets `estimatedDeliveryTime` (an absolute ISO date). Order responses also include `serverTime`, so the app can correct its own clock:

```
remainingMs = estimatedDeliveryTime - (Date.now() + (serverTime - receivedAt))
```

`remainingMinutes` is also computed by the server. It is `0` once delivered and `null` for rejected or cancelled orders.

## 2. Push notifications (Firebase Cloud Messaging)

The backend sends through FCM when `FIREBASE_*` is configured (see `.env.example`). Without it, push is skipped silently and everything else keeps working.

### Register the device

Call this after login and on every FCM token refresh:

```
POST /api/v1/notifications/devices
{ "token": "<fcm token>", "platform": "android" | "ios" | "web", "app": "customer" | "dashboard", "lang": "ar" }
```

- Use `app: "dashboard"` on cashier / manager devices. Only these devices receive the **new order alarm**.
- Customer devices are subscribed to the `customers` topic automatically, which is used for offers.
- On logout, call `DELETE /api/v1/notifications/devices/<token>`.

### Sounds and channels

| Notification | Android channel id | Android sound | iOS sound |
|---|---|---|---|
| New order (staff) | `new_orders` (importance HIGH) | `order_alarm` (put `res/raw/order_alarm.mp3` in the app) | `order_alarm.caf` (in the app bundle, ≤ 30s) |
| Everything else | `general` | default | default |

The Android app must create both channels at startup. A channel's sound can't be changed after it's created.

### `data` payload for deep links

| `data.type` / keys | Open |
|---|---|
| `{ type: "new_order", orderId }` | Dashboard: order details |
| `{ type: "order_cancelled", orderId }` | Dashboard: order details |
| `{ orderId, status }` | Customer: order tracking |
| `{ promotionId }` | Customer: offers screen |
| `{ type: "daily_report", date }` | Dashboard: report for `date` |

### What gets sent automatically

- **New order**: alarm push to staff devices, plus `order:new` on the socket
- **Accepted / preparing / on the way / delivered / rejected (with reason) / cancelled by the restaurant**: push and inbox entry to the customer, in Arabic
- **Customer cancelled**: push to staff
- **An offer starts** (each scheduled window, once): push to all customers and an inbox entry
- **23:59 restaurant time**: daily sales summary to staff
- **Manual announcement**: `POST /notifications/broadcast` (admin/manager)
