# Main API flows

Base URL: `/api/v1`. Full reference: Swagger at `/api/docs`.
Responses are wrapped as `{ data }` (lists: `{ data, meta }`). Errors are `{ errors: [{ field?, message }] }`.

## Customer app

| Step | Request |
|---|---|
| Start-up: restaurant info, phone numbers, open/closed | `GET /settings` |
| Home screen | `GET /home`: `restaurant`, `offers`, `categories`, `bestSellers`, `newArrivals`, `topRated` |
| Area picker (signup / address form) | `GET /delivery-zones/active`: name, fee, minimum order, ETA |
| Sign up (phone required, optional first address) | `POST /auth/signup` `{ name, email, password, phone, address?: { zone, details, building?, floor?, apartment?, landmark?, coordinates?: {lat,lng}, locationUrl? } }` |
| Menu | `GET /products?category=&keyword=&page=&limit=`. Each item has `price`, `finalPrice`, `activePromotion` |
| Running offers | `GET /promotions/active` |
| Cart | `POST /cart { productId, quantity?, notes? }` · `PATCH /cart/:itemId { quantity?, notes? }` · `DELETE /cart/:itemId` · `PATCH /cart/applyCoupon { coupon }` · `DELETE /cart/applyCoupon` · `GET /cart` |
| Addresses | `GET/POST /addresses` · `PATCH/DELETE /addresses/:id` (`isDefault: true` to switch) |
| Checkout screen | `POST /order/preview { addressId? | address? }`: `subtotal`, `couponDiscount`, `deliveryFee`, `taxPrice`, `total`, `canPlaceOrder`, `issues[]` |
| Place order (cash) | `POST /order { addressId?, notes? }`: the order with `orderNumber`, `restaurant {phone, whatsapp}`, `canCancel` |
| Tracking banner | `GET /order/active` (also includes `restaurant` phone numbers) |
| Order details / tracking | `GET /order/:id`: `status`, `statusHistory`, `estimatedDeliveryTime`, `remainingMinutes`, `serverTime`, `restaurant` |
| Cancel (only while pending) | `PATCH /order/:id/cancel { reason? }` |
| Rate after delivery | `POST /order/:id/review { ratings: 1-5, comment? }` (allowed when `canReview` is true) |
| Order again | `POST /order/:id/reorder` |
| Order history | `GET /order?scope=history` |
| Notifications | `GET /notifications` · `GET /notifications/unread-count` · `PATCH /notifications/:id/read` · `PATCH /notifications/read-all` |

## Restaurant dashboard (admin / manager)

| Task | Request |
|---|---|
| Live board | Socket `order:new` / `order:updated`, plus `GET /order?scope=active` |
| Search an order | `GET /order?keyword=1024` (order number, phone or name) · `GET /order?date=2026-11-16&status=delivered` |
| Accept with ETA | `PATCH /order/:id/accept { estimatedDeliveryMinutes? }` |
| Reject with reason | `PATCH /order/:id/reject { reason }`. Ready-made reasons are in `GET /settings/admin` → `rejectionReasons` |
| Move forward | `PATCH /order/:id/status { status: "preparing" | "on_the_way" | "delivered" | "cancelled", reason? }` |
| Pause / resume orders | `PATCH /settings/accepting-orders { acceptingOrders, pausedMessage? }` |
| Restaurant profile, phones, hours, tax | `PATCH /settings` (admin) |
| Delivery areas and fees | `POST/PATCH/DELETE /delivery-zones` `{ name, nameAr, deliveryFee, minOrderAmount, estimatedDeliveryMinutes, isActive }` |
| Menu | `POST/PATCH /products` (multipart, `isAvailable` toggles "sold out"), `GET /products/manage` lists hidden items too |
| Schedule an offer | `POST /promotions { title, discountPercentage, target: all|category|products, categories?, products?, daysOfWeek?, startTime?, endTime?, startDate?, endDate?, notifyCustomers? }` |
| One-tap offer now / stop | `POST /promotions/quick-apply` · `POST /promotions/quick-remove` |
| Daily sales (end of day) | `GET /reports/daily?date=YYYY-MM-DD` |
| Period report | `GET /reports/range?from=&to=` (per-day series) · `GET /reports/summary` |
| Ratings follow-up | `GET /reports/reviews?maxRating=2` |
| Announcement to all customers | `POST /notifications/broadcast { title, body }` |

### Order statuses

```
pending ──accept──▶ accepted ──▶ preparing ──▶ on_the_way ──▶ delivered
   │                   │             │
   ├─reject (reason)   └──────cancel─┴──▶ cancelled
   └─cancel (customer, while pending)
```

Any other transition returns `400`. Two cashiers clicking at the same moment can't both succeed. Rejecting or cancelling puts stock back for items that track stock.
