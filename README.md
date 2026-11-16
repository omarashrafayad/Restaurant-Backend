# Restaurant & E-Commerce Backend (NestJS)

A complete, production-ready, enterprise-grade E-Commerce & Restaurant backend built with **NestJS**, **TypeScript**, and **MongoDB (Mongoose)**, architected 1:1 following the clean use-case and repository pattern from the reference architecture (`backend/nestjsairbnb`).

---

## 🌟 Key Features & Domain Modules

The backend implements all **52 endpoints** across **15 domain modules** from the original e-commerce system with zero omissions:

1. **Authentication & Authorization (`/api/v1/auth`)**
   - User registration (signup) with password hashing (bcryptjs)
   - User login with JWT token issuance
   - Forgot password & 6-digit verification code generation (crypto-hashed, 10-minute expiry)
   - Email dispatch via SMTP / Nodemailer
   - Reset code verification & secure password reset
   - Role-Based Access Control (RBAC): `USER`, `ADMIN`, `MANAGER`
   - Global `JwtAuthGuard` & `RolesGuard` with `@Public()` and `@Authorize()` decorators

2. **User Management (`/api/v1/user`)**
   - Admin CRUD for user accounts
   - Admin password override
   - Customer profile (`getMe`, `updateMe`, `changeMyPassword`, `deleteMe` soft deactivation)
   - Profile avatar image uploads with Sharp resizing and formatting

3. **Categories (`/api/v1/categories`)**
   - Category CRUD with automated slug generation
   - Single image upload & Sharp processing
   - Pagination, search, and sorting

4. **Subcategories (`/api/v1/subcategories`)**
   - Subcategory CRUD with category association
   - Nested subcategory listing under category: `GET /api/v1/categories/:categoryId/subcategories`
   - Nested subcategory creation under category: `POST /api/v1/categories/:categoryId/subcategories`

5. **Brands (`/api/v1/brands`)**
   - Brand CRUD with slug generation
   - Brand logo image upload with Sharp optimization
   - Pagination, search, and sorting

6. **Products Catalog (`/api/v1/products`)**
   - Product catalog management with Category, Subcategory, and Brand relationships
   - Image cover and multi-image gallery uploads
   - Advanced search (name, description regex)
   - Dynamic MongoDB operators: `$gte`, `$gt`, `$lte`, `$lt` price/rating filtering
   - Sorting, field selection, and pagination
   - Stock management and sold counter tracking

7. **Homepage (`/api/v1/home`)**
   - Aggregated homepage endpoint returning active banners/promotions, featured categories, popular brands, and new arrival products in a single performant payload

8. **Reviews & Ratings (`/api/v1/review`)**
   - Product reviews and ratings (1 to 5 scale)
   - Nested routes: `GET /api/v1/products/:productId/reviews` and `POST /api/v1/products/:productId/reviews`
   - Mongoose aggregation pipeline computing `ratingsAverage` and `ratingsQuantity` on the product upon review creation, update, or deletion
   - Authorization: Users can only modify/delete their own reviews; Admins/Managers can moderate

9. **Wishlist (`/api/v1/wishlist`)**
   - Add product to wishlist (`$addToSet`)
   - Remove product from wishlist (`$pull`)
   - View logged-in user wishlist with populated product details

10. **Delivery Addresses (`/api/v1/addresses`)**
    - Multi-address customer notebook (alias, details, phone, postal code)
    - Add, remove, and list addresses

11. **Coupons & Discounts (`/api/v1/coupon`)**
    - Coupon creation, listing, update, and expiration checks
    - Percentage discounts and validity date constraints

12. **Shopping Cart (`/api/v1/cart`)**
    - Add items with color, price, quantity
    - Update item quantities and remove items
    - Coupon application with price recalculation (`totalPriceAfterDiscount`)
    - Empty/clear cart

13. **Delivery Zones (`/api/v1/delivery-zones`)**
    - Zone name, delivery fee, minimum order amount, estimated delivery minutes, active toggle
    - Zone fee validation endpoint: `POST /api/v1/delivery-zones/validate`

14. **Orders & Checkout (`/api/v1/order`)**
    - Cash-on-delivery and Card checkout: validates cart, delivery zone, minimum order amounts
    - Atomic product stock decrement and sold count increment
    - Dynamic status workflow: `pending` -> `accepted` -> `preparing` -> `on_the_way` -> `delivered` / `rejected`
    - Virtual countdown and remaining cancellation window
    - Order cancellation with stock restoration
    - Daily sales and sales summary business analytics

15. **Promotions & Banners (`/api/v1/promotions`)**
    - Promotional campaign banners with start/end dates and discount percentages
    - Quick apply/remove promotion to specific products
    - Public active deals endpoint

---

## 🏗️ Architecture & Blueprint

The project strictly follows the architecture of `nestJs-airbnb`:

```
restaurant-backend/
├── src/
│   ├── common/
│   │   ├── configuration/          # Joi-validated environment config and typed interfaces
│   │   ├── constants/              # System constants and Roles enum
│   │   ├── data-accsess/           # BaseRepository<T>, ModelNames, PaginationDto
│   │   ├── error-handling/         # Custom exceptions and global CustomExceptionFilter
│   │   ├── interceptors/           # LoggerInterceptor, TransformResponseInterceptor
│   │   ├── swagger/                # Swagger setup, APi_TAGS, constants
│   │   └── files/                  # Multer configs and Sharp image processing utilities
│   ├── mail/                       # Nodemailer SMTP email service
│   ├── auth/                       # JWT authentication, guards, RBAC, use cases
│   ├── users/                      # User schemas, repository, use cases, controller
│   ├── categories/                 # Category schemas, repository, use cases, controller
│   ├── subcategories/              # Subcategory schemas, repository, use cases, controller
│   ├── brands/                     # Brand schemas, repository, use cases, controller
│   ├── products/                   # Product catalog, repository, use cases, controller
│   ├── home/                       # Home aggregated service & controller
│   ├── reviews/                    # Review schemas, repository, aggregation, controller
│   ├── wishlist/                   # User wishlist service & controller
│   ├── addresses/                  # User address notebook service & controller
│   ├── coupons/                    # Coupon management, repository, controller
│   ├── cart/                       # Cart calculations, coupon discounts, controller
│   ├── delivery-zones/             # Delivery zone validation, repository, controller
│   ├── orders/                     # Order lifecycle, stock transactions, analytics
│   ├── promotions/                 # Campaign promotions & banners, controller
│   ├── core.module.ts              # Core infrastructure module (Config, Mongoose, Global Filters)
│   ├── app.module.ts               # Root application module wiring all 15 domains & global guards
│   └── main.ts                     # Bootstrap entry point with CORS, validation, and Swagger
├── uploads/                        # Static uploads storage (/user, /categories, /brands, /products)
├── .env.example                    # Template environment variables
├── nest-cli.json                   # Nest CLI configuration
├── package.json                    # ESM package configuration ("type": "module")
├── tsconfig.json                   # NodeNext ESM TypeScript configuration
└── README.md
```

### Architectural Patterns

- **ESM Native**: `"type": "module"` with NodeNext resolution and explicit `.js` import specifiers.
- **BaseRepository Pattern**: All database interactions are encapsulated behind `BaseRepository<T>`, providing unified pagination, lean queries, populates, and custom projections.
- **Use-Case Segregation**: Complex actions (e.g., Create, Update, Delete, FindById, FindAll) are separated into individual single-responsibility use cases.
- **Dedicated Swagger Decorators**: Every single controller action has an isolated composite Swagger decorator in a `swagger/` subfolder documenting response types, parameters, tags, and status codes.
- **Global Interceptors & Filters**: Standardized JSON responses via `TransformResponseInterceptor` (`{ data, pagination }`) and unified error envelopes via `CustomExceptionFilter` (`{ errors: [...] }`).
- **Global Security**: `JwtAuthGuard` and `RolesGuard` applied globally across all routes; unauthenticated access is granted via `@Public()`, and role restrictions are declared via `@Authorize(Roles.ADMIN, Roles.MANAGER)`.

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: `v20.x` or `v22.x`+
- **MongoDB**: Local MongoDB instance or MongoDB Atlas cluster

### 2. Installation
```bash
cd restaurant-backend
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `.env` and fill in your values:
```bash
cp .env.example .env
```

Ensure the following variables are set:
```ini
PORT=5000
NODE_ENV=development
BASE_URL=http://localhost:5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/ecommerce?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

### 4. Build & Run

**Build the TypeScript project:**
```bash
npm run build
```

**Run in Development Mode (with hot-reload):**
```bash
npm run start:dev
```

**Run in Production Mode:**
```bash
npm run start:prod
```

---

## 📚 API Documentation (Swagger)

Once the application is running, the interactive Swagger UI documentation is available at:
- **`http://localhost:5000/api/docs`**
- **`http://localhost:5000/api-docs`**

The Swagger UI provides interactive request execution, schema specifications, authentication headers, and parameter documentation for all 52 endpoints.

---

## 🛡️ License

UNLICENSED
