# Velvet Bytes — AI Assistant Rules

This file is read automatically by Claude Code, GitHub Copilot (via .github/copilot-instructions.md),
and any AI assistant used in this repo. Every team member's AI tool follows these rules.

> **Team rule:** Never override or ignore these rules mid-session. If you disagree with a rule,
> raise it in the group chat — don't just ask your AI to bypass it.

---

## Project overview

Velvet Bytes is a multi-role burger ordering platform.
- **Stack:** React 18 + Vite (client), Node.js + Express (server), MongoDB Atlas, Redis (Upstash), Socket.IO, BullMQ, Razorpay, Cloudinary
- **Roles:** CUSTOMER, OUTLET_MANAGER, ADMIN
- **Phase:** Phase 1 — Modular Monolith (do NOT introduce microservices patterns yet)

---

## 1. Absolute rules — AI must never break these

- Never hardcode secrets, API keys, passwords, or tokens. Always use `process.env.VAR_NAME`.
- Never use `console.log` in server code. Use the Winston logger: `import logger from '@/shared/utils/logger'`.
- Never hard-delete documents from the DB. Always soft-delete: set `isActive: false` or `isAvailable: false`.
- Never trust user input without Zod validation. Every route that accepts a body must have a Zod schema.
- Never use `skip/limit` for pagination. Use cursor-based pagination on `_id`.
- Never write a Mongoose query without `.lean()` on read-only routes (GET routes that don't call `.save()`).
- Never store the refresh token in localStorage. It goes in an HTTP-only cookie.
- Never use `any` type if TypeScript is introduced later.
- Never create a new npm package without checking it exists first with `npm info <package>`.
- Never write `// TODO` comments and leave them — either implement it or open a GitHub issue.

---

## 2. File structure — where everything goes

```
client/src/
  features/<feature>/         ← All code for one domain (auth, cart, orders, products, profile)
    components/               ← UI components used only in this feature
    hooks/                    ← React Query hooks + custom hooks for this feature
    services/                 ← Axios API call functions (no fetch logic in components)
    index.ts                  ← Public exports from this feature (barrel file)

  components/                 ← Truly shared, reusable UI components only
    ui/                       ← Primitives: Button, Input, Modal, Badge, Spinner
    layout/                   ← Header, Sidebar, PageWrapper, Footer
    forms/                    ← Shared form components: FormField, FormError
    feedback/                 ← Toast, Alert, EmptyState, LoadingState
    data-display/             ← Table, Card, Stat, Tag

  pages/                      ← One file per route. No business logic here — only layout + feature components
  store/                      ← Zustand stores only. One file per store: authStore.ts, cartStore.ts
  hooks/                      ← Truly global hooks: useSocket, useDebounce, useLocalStorage
  utils/                      ← Pure utility functions: formatPrice, formatDate, cn (classnames)
  router/                     ← React Router config. Route definitions + protected route wrapper

server/src/
  modules/<module>/           ← One folder per domain (auth, products, orders, users)
    <module>.routes.js        ← Express router. No logic — only route definitions + middleware chain
    <module>.controller.js    ← Calls service functions. Handles req/res. No DB queries here.
    <module>.service.js       ← All business logic. All DB queries. Testable without Express.
    <module>.schema.js        ← Zod schemas for request validation
    <module>.model.js         ← Mongoose model + schema definition

  shared/
    middleware/               ← authenticate.js, authorize.js, rateLimiter.js, errorHandler.js
    utils/                    ← logger.js, redis.js, cloudinary.js, email.js, cacheHelper.js
    constants/                ← roles.js, orderStatuses.js, errorMessages.js
    events/                   ← Socket.IO event name constants

  config/
    env.js                    ← Zod-validated env schema. App crashes on startup if any var is missing.
    db.js                     ← Mongoose connection
```

### Rules on where things go

- A component that is used in only ONE feature lives inside `features/<feature>/components/`. It does NOT go in `components/`.
- A component used in 2+ features gets moved to `components/` — not before.
- Business logic (DB queries, calculations, Redis calls) always goes in `*.service.js`. Never in controller or route.
- Controllers only do: call service → format response → return JSON. Max 10 lines per controller function.
- Route files only do: define path, attach middleware, call controller. No logic whatsoever.

---

## 3. Naming conventions

### Files
- React components: `PascalCase.tsx` — e.g. `ProductCard.tsx`, `OrderStatusBadge.tsx`
- Everything else (hooks, utils, services, stores): `camelCase.ts` — e.g. `useCart.ts`, `formatPrice.ts`
- Server files: `camelCase.js` — e.g. `auth.service.js`, `order.routes.js`
- Test files: same name as the file being tested + `.test.js` — e.g. `auth.service.test.js`
- Zod schemas: `camelCase.schema.js` on server, `camelCase.schema.ts` on client

### Variables and functions
- React components: `PascalCase`
- Everything else: `camelCase`
- Constants and enum-like values: `SCREAMING_SNAKE_CASE` — e.g. `ORDER_STATUS.PLACED`, `ROLES.CUSTOMER`
- Mongoose models: `PascalCase` singular — `User`, `Product`, `Order`
- Database collection names (auto from Mongoose): lowercase plural — `users`, `products`, `orders`
- Boolean variables: prefix with `is`, `has`, `can`, `should` — e.g. `isLoading`, `hasStock`, `canEdit`
- Event handler functions: prefix with `handle` — e.g. `handleSubmit`, `handleAddToCart`
- Async functions that fetch data: prefix with `fetch` or `get` — e.g. `fetchProducts`, `getOrderById`

### API endpoints
- Always lowercase, hyphen-separated: `/api/auth/refresh-token`, `/api/products/popular`
- Resource collections: plural — `/api/products`, `/api/orders`
- Actions on a resource: `POST /api/orders/:id/cancel`, `PATCH /api/orders/:id/status`
- Never use verbs in resource paths: NOT `/api/getProducts` — use `GET /api/products`

---

## 4. Import rules

### Server — use absolute imports from `src/`
```js
// Good
import logger from '@/shared/utils/logger';
import { authenticate } from '@/shared/middleware/authenticate';
import { ProductService } from '@/modules/products/product.service';

// Bad — relative hell
import logger from '../../../shared/utils/logger';
```
Set `@` as alias for `server/src/` in `jsconfig.json`.

### Client — use absolute imports from `src/`
```tsx
// Good
import { Button } from '@/components/ui/Button';
import { useCart } from '@/features/cart/hooks/useCart';
import { formatPrice } from '@/utils/formatPrice';

// Bad
import { Button } from '../../../components/ui/Button';
```
Set `@` as alias for `client/src/` in `vite.config.ts`.

### Import ordering (AI must always maintain this order, with blank lines between groups)
```js
// 1. Node built-ins
import path from 'path';

// 2. Third-party packages
import express from 'express';
import mongoose from 'mongoose';

// 3. Internal absolute imports (@/...)
import logger from '@/shared/utils/logger';
import { authenticate } from '@/shared/middleware/authenticate';

// 4. Relative imports (same module only)
import { validateProduct } from './product.schema';
```

---

## 5. Code style rules

### General
- Max function length: 30 lines. If longer, split into smaller functions.
- Max file length: 200 lines. If longer, split the file.
- No nested ternaries. Max one level: `condition ? a : b`. For complex logic, use if/else.
- No magic numbers. Use named constants: `const MAX_LOGIN_ATTEMPTS = 5` not `if (count > 5)`.
- Prefer `const` over `let`. Never use `var`.
- Always use `===` not `==`.
- Always handle promise rejections — use try/catch in async functions.

### React specific
- Never put business logic or API calls directly in a component. Use a hook or service.
- Never use useEffect to fetch data. Use TanStack Query (`useQuery`, `useMutation`).
- Never mutate Zustand state directly outside the store's defined actions.
- Props must be destructured in the function signature: `function Button({ label, onClick, disabled })`.
- Always add a `key` prop when rendering lists — use the document `_id`, never array index.
- Loading and error states must always be handled. No component should silently show nothing.

### Express specific
- Every route handler must be wrapped in try/catch or use an async wrapper utility.
- Always call `next(error)` in catch blocks — never `res.status(500).json(...)` directly.
- Middleware functions must call `next()` or send a response — never both, never neither.
- Validate request body with Zod before any service call: `const parsed = schema.safeParse(req.body)`.

---

## 6. Error handling pattern

### Server — standard error response shape
```js
// Always use this shape. Never return raw error messages in production.
res.status(400).json({
  success: false,
  message: 'Human-readable error message',
  errors: [] // Zod validation errors if applicable
});

// Success
res.status(200).json({
  success: true,
  data: result,
  message: 'Optional success message'
});
```

### Client — standard API call pattern (in service files, not components)
```ts
// In features/products/services/productService.ts
export const fetchProducts = async (params) => {
  const { data } = await api.get('/products', { params });
  return data.data; // unwrap the { success, data } envelope
};

// Never do this in a component
const res = await axios.get('/api/products'); // BAD — no error handling, in component
```

---

## 7. Environment variables

### Naming convention
- Server vars: `SCREAMING_SNAKE_CASE` — `MONGODB_URI`, `JWT_ACCESS_SECRET`
- Client vars (Vite): must be prefixed with `VITE_` — `VITE_API_URL`, `VITE_RAZORPAY_KEY_ID`

### Rules
- Every new env variable must be added to `.env.example` immediately (with a placeholder value, never the real value).
- Every new server env variable must be added to `server/src/config/env.js` Zod schema or the app will crash on startup — this is intentional.
- Never access `process.env` directly in application code. Always import from `config/env.js`.

```js
// Good
import { env } from '@/config/env';
const secret = env.JWT_ACCESS_SECRET;

// Bad
const secret = process.env.JWT_ACCESS_SECRET; // bypasses validation
```

---

## 8. Database rules

### Mongoose
- Always define indexes explicitly in the schema — never rely on Mongoose defaults.
- Always use `.lean()` on read-only queries.
- Always use `.select()` to project only needed fields on listing endpoints.
- Use `$inc` for numeric increments/decrements (stock, ratings count) — never read → modify → write.
- Use Mongoose sessions (transactions) when two collections must be updated atomically.
- Mongoose model names: singular PascalCase. Mongoose auto-pluralises the collection name.

```js
// Good — explicit index, lean, select
const products = await Product
  .find({ outletId, isAvailable: true })
  .select('name price imageUrl category stock')
  .sort({ _id: -1 })
  .lean();

// Bad
const products = await Product.find({}); // returns everything, no lean, full document
```

### Redis keys — must follow this exact naming convention
```
product:<productId>              ← single product cache
products:<outletId>:<queryHash>  ← product list cache
popular_products                 ← popular products cache
user_profile:<userId>            ← user profile cache
offers:<outletId>                ← active offers cache
refresh:<userId>                 ← refresh token store
login_fail:<ip>:<email>          ← brute force counter
rate_limit:<ip>                  ← API rate limit counter
bull:<queueName>:*               ← BullMQ (managed automatically)
```
Never create a Redis key outside this list without adding it here first.

---

## 9. Git and PR rules

### Branch naming
```
feature/<short-description>      ← new feature: feature/auth-signup
fix/<short-description>          ← bug fix: fix/cart-outlet-validation
chore/<short-description>        ← non-code: chore/update-readme
test/<short-description>         ← adding tests: test/order-service-unit
```

### Commit message format (Conventional Commits)
```
feat(auth): add refresh token rotation
fix(cart): prevent adding items from multiple outlets
chore(deps): update express to 4.19.2
test(orders): add unit tests for total calculation
docs(readme): add architecture diagram
refactor(products): extract cache logic to cacheHelper
```
Format: `type(scope): short description` — lowercase, no period, max 72 chars.

Types: `feat`, `fix`, `chore`, `test`, `docs`, `refactor`, `style`, `perf`

### PR rules
- No one merges their own PR. Minimum 1 teammate review required.
- PR title must follow the same Conventional Commits format as commit messages.
- PR description must include: what changed, why it changed, how to test it.
- All CI checks must pass before merging (lint + tests).
- Delete the feature branch after merging.

---

## 10. Testing rules

### What must be tested
- Every function in `*.service.js` files must have a unit test.
- Every API route must have at least one integration test (happy path + auth guard).
- Test files live in `server/tests/unit/` or `server/tests/integration/` — never next to the source file.

### Test naming convention
```js
describe('ProductService', () => {
  describe('getProducts', () => {
    it('should return paginated products for a valid outletId', async () => { ... });
    it('should return empty array when no products exist', async () => { ... });
    it('should throw NotFoundError when outletId does not exist', async () => { ... });
  });
});
```
Pattern: `describe(ClassName) → describe(methodName) → it(should + expected behaviour)`

### Mocking rules
- Mock external services (Mongoose, Redis, Cloudinary, Razorpay, Nodemailer) in unit tests.
- Use `mongodb-memory-server` for integration tests — never hit the real Atlas DB in tests.
- Never mock the function being tested itself.

---

## 11. Security rules AI must enforce

- Never log sensitive data: passwords, tokens, card numbers, full email addresses in logs.
- Never return `passwordHash` in any API response — always use `.select('-passwordHash')`.
- Always verify resource ownership before mutation: check `req.user.outletId === product.outletId`.
- Rate limiting is already configured — do not remove or bypass it.
- CORS is already configured for `CLIENT_URL` only — do not add wildcard origins.

---

## 12. What AI should NOT do

- Do not install new npm packages without asking in the group chat first — someone may have already solved it.
- Do not refactor working code unless the task is specifically a refactor task.
- Do not change the folder structure without team agreement.
- Do not add new environment variables without updating `.env.example` and `config/env.js`.
- Do not write commented-out code — delete it. Git history exists for a reason.
- Do not generate placeholder/lorem ipsum content in real component files.
- Do not add `eslint-disable` comments — fix the lint error instead.