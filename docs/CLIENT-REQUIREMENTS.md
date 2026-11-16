# Client requirements → implementation

Every requirement from the Take Five brief, with the API the apps use and the e2e test that proves it works.
Request/response details are in Swagger (`/api/docs`). Socket and push details are in [REALTIME.md](REALTIME.md), and step-by-step flows are in [API-FLOWS.md](API-FLOWS.md).

Status legend: ✅ done and covered by tests · ⚙️ done in code but needs credentials or assets before it works in production

## Customer app

| # | Requirement (client's words) | Status | How it works | Customer app uses | Test |
|---|---|---|---|---|---|
| C1 | يعمل حساب يحفظ فيه عنوانه ورقمه ولوكيشن بتاعه | ✅ | Phone is required at signup (Egyptian mobile, normalised to `01XXXXXXXXX`). An address can be saved at signup or later. Each address is linked to a delivery **zone** and holds building / floor / apartment / landmark, `coordinates {lat,lng}` and `locationUrl`. One address is the default | `POST /auth/signup`, `GET /delivery-zones/active` (area picker), `GET/POST/PATCH/DELETE /addresses` | `02-settings-zones` |
| C2 | تايمر ظاهر من وقت استلام الأوردر هيستلم امتى | ✅ | When the restaurant accepts, the order gets `estimatedDeliveryTime`. Every order response also has `remainingMinutes` and `serverTime` (to correct clock drift). Live updates arrive over the socket | `GET /order/active`, `GET /order/:id`, socket `order:updated` | `03-orders`, `04-realtime` |
| C3 | كومنت وهو بيطلب (مش عايز بصل / مشروم) | ✅ | `notes` on every cart line (kitchen instruction per item) plus `notes` on the whole order (for the driver). The same product with different notes stays as separate lines | `POST /cart { productId, quantity, notes }`, `PATCH /cart/:itemId { notes }`, `POST /order { notes }` | `01-security` (cart), `03-orders` |
| C4 | بعد ما يستلم يقيّم بنجوم وكومنت | ✅ | Only after `delivered`, only once, only by the order owner. `canReview` in the order response tells the app when to show the form | `POST /order/:id/review { ratings 1-5, comment }` | `03-orders` |
| C5 | لو فيه خصومات في يوم يجيله إشعار | ⚙️ | When an offer's window opens, every customer gets one push and one inbox entry (no duplicates). The restaurant can also send a manual announcement. **Needs Firebase credentials** | `POST /notifications/devices` after login, `GET /notifications`, `GET /promotions/active` | `05-promotions`, `04-realtime` |
| C6 | رقم المطعم ظاهر في وجه الطلب دايماً | ✅ | Every order response includes `restaurant { name, phone, secondaryPhone, whatsapp }`, and so does `GET /order/active`. The numbers are edited in settings | `GET /order/:id`, `GET /order/active`, `GET /settings` | `03-orders` |

## Restaurant

| # | Requirement (client's words) | Status | How it works | Dashboard uses | Test |
|---|---|---|---|---|---|
| R1 | التوصيل مقتصر على مدن معينة | ✅ | Orders are accepted only for **active** delivery zones. Inactive zones are hidden from customers, and checkout explains why an order is blocked | `POST/PATCH/DELETE /delivery-zones` | `02-settings-zones`, `03-orders` |
| R2 | أول ما عميل يطلب تظهر بياناته وأقدر أقبل أو أرفض بسبب | ✅ | The new order carries customer name and phone, the full address with location, items with notes and totals. Accept takes an optional ETA, reject requires a reason. Ready-made reasons ("خارج نطاق التوصيل", "لا يوجد مناديب متاحين حالياً", …) live in settings. Status changes follow a strict state machine, so two cashiers clicking at once is safe | socket `order:new`, `GET /order?scope=active`, `PATCH /order/:id/accept`, `PATCH /order/:id/reject { reason }`, `PATCH /order/:id/status` | `03-orders`, `04-realtime` |
| R3 | إشعار صوتي (ألارم) لما ييجي أوردر | ⚙️ | The socket event `order:new` carries `playSound: true` and `orders:pending_count` (stop the alarm at 0). Staff devices also get a high-priority push on the `new_orders` channel with the `order_alarm` sound. **Needs Firebase credentials, and the sound file inside the dashboard app** | socket `order:new`, `orders:pending_count`, `POST /notifications/devices { app: "dashboard" }` | `04-realtime` |
| R4 | أحط خصومات بسهولة في الأيام اللي عايزها على المنيو كله أو أصناف معينة | ✅ | A promotion targets the whole menu, categories or specific items, with a date range, days of the week and an optional daily time window (works past midnight). Times are in Cairo time. Prices update everywhere automatically. There is also a one-tap "discount now" / "stop" | `POST /promotions`, `POST /promotions/quick-apply`, `POST /promotions/quick-remove` | `05-promotions`, `07-review-fixes` |
| R5 | مبيعات يومية آخر اليوم وعدد الأوردرات | ✅ | The daily report is computed in Cairo time: sales, number of orders by status, best sellers, sales by zone and by hour, rejection reasons, ratings and average times. A summary push goes to staff at 23:59 (⚙️ Firebase) | `GET /reports/daily?date=`, `GET /reports/range`, `GET /reports/summary` | `06-reports` |
| R6 | رسوم التوصيل مختلفة حسب المكان (مدينتي سعر والشروق سعر) | ✅ | Each zone has its own `deliveryFee`, `minOrderAmount` and `estimatedDeliveryMinutes`. The checkout preview shows the fee before the customer confirms | `GET /delivery-zones/active`, `POST /order/preview` | `03-orders` |

## Added on top of the brief

| Feature | Why | API |
|---|---|---|
| Opening hours + "pause orders" switch | Stops orders when the kitchen is closed or overloaded | `PATCH /settings`, `PATCH /settings/accepting-orders`, socket `restaurant:status` |
| Item available / sold-out toggle | Hide an item for today without deleting it | `PATCH /products/:id { isAvailable }`, `GET /products/manage` |
| Short order number (#1001…) | Easy to say on the phone | `orderNumber` on every order; search with `GET /order?keyword=1001` |
| Customer cancel while pending | Fewer phone calls for mistakes | `PATCH /order/:id/cancel` |
| Status timeline | Who changed what and when | `statusHistory` on every order |
| Checkout preview with reasons | The app can explain why an order can't be placed (closed, below minimum, out of area…) | `POST /order/preview` → `issues[]` |
| Reorder | One tap to repeat a past order | `POST /order/:id/reorder` |
| Notification inbox | Customers can see past updates and offers | `GET /notifications`, `unread-count`, `read-all` |
| Low-rating follow-up | Call unhappy customers | `GET /reports/reviews?maxRating=2` |

## Needed from the client before launch

1. **Firebase project** (service account) → enables C5, R3 and the R5 push. See `.env.example`.
2. **Alarm sound file** in the dashboard app (`order_alarm`, see REALTIME.md).
3. **Restaurant data**: phone / WhatsApp, opening hours, delivery fee per area, and the menu with photos.
4. **Gmail App Password** for password-reset emails.
5. **Hosting with a persistent disk** (or a move to cloud image storage), HTTPS domain, and `CORS_ORIGINS` / `TRUST_PROXY` set.

## Not in scope (possible next phase)

- Item sizes / extras (single/double, extra cheese)
- Online card payment (only cash on delivery today)
- Driver app / driver tracking
- SMS verification of the phone number
- The dashboard and mobile UIs themselves (this repository is the backend only)
