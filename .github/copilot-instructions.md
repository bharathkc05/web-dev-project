# Velvet Bytes — GitHub Copilot Instructions

This file is automatically read by GitHub Copilot in every file in this repository.
Follow all rules below when generating or suggesting code.

The full rules are in `/CLAUDE.md` at the repo root. This file is a Copilot-specific
summary — when in conflict, CLAUDE.md is the source of truth.

---

## Project context

Multi-role burger ordering platform. Stack: React 18 + Vite, Node.js + Express,
MongoDB Atlas + Mongoose, Redis (Upstash) + BullMQ, Socket.IO, Razorpay, Cloudinary.
Three user roles: CUSTOMER, OUTLET_MANAGER, ADMIN.

---

## Never do these things

- Never use `console.log` on the server. Use `logger.info/warn/error` from `@/shared/utils/logger`.
- Never hardcode secrets or API keys. Use `env.VARIABLE_NAME` from `@/config/env`.
- Never use `skip/limit` for pagination. Use cursor-based pagination on `_id`.
- Never hard-delete DB documents. Soft-delete only: set `isActive: false` or `isAvailable: false`.
- Never put DB queries in controllers or route files. Service files only.
- Never fetch data inside a React component directly. Use TanStack Query hooks.
- Never use `useEffect` for data fetching. Use `useQuery` from `@tanstack/react-query`.
- Never use array index as React `key`. Use document `_id`.
- Never import with long relative paths (`../../..`). Use `@/` absolute imports.
- Never return `passwordHash` in any API response.
- Never add `eslint-disable` comments.
- Never write commented-out code.

---

## Always do these things

### Server
- Validate all request bodies with Zod before calling any service.
- Use `.lean()` on all read-only Mongoose queries.
- Use `.select()` to project only needed fields on listing endpoints.
- Wrap all async route handlers in try/catch and call `next(error)` in catch.
- Use `$inc` for atomic numeric updates (stock, counters).
- Check ownership before any mutation: `req.user.outletId === resource.outletId`.

### Client
- Destructure props in function signature.
- Handle loading and error states in every component that fetches data.
- Keep components under 150 lines. Extract sub-components if longer.
- Business logic and API calls belong in hooks or service files, not components.

---

## File placement — quick reference

| What you're creating | Where it goes |
|---|---|
| Component used in one feature | `client/src/features/<feature>/components/` |
| Component used in 2+ features | `client/src/components/<category>/` |
| TanStack Query hook for a feature | `client/src/features/<feature>/hooks/` |
| Axios API call function | `client/src/features/<feature>/services/` |
| Zustand store | `client/src/store/<name>Store.ts` |
| Global reusable hook | `client/src/hooks/` |
| Express route definitions | `server/src/modules/<module>/<module>.routes.js` |
| Business logic + DB queries | `server/src/modules/<module>/<module>.service.js` |
| req/res handling | `server/src/modules/<module>/<module>.controller.js` |
| Zod request schemas | `server/src/modules/<module>/<module>.schema.js` |
| Mongoose model | `server/src/modules/<module>/<module>.model.js` |
| Unit tests | `server/tests/unit/<module>.service.test.js` |
| Integration tests | `server/tests/integration/<module>.routes.test.js` |

---

## Naming — quick reference

| Thing | Convention | Example |
|---|---|---|
| React component file | PascalCase.tsx | `ProductCard.tsx` |
| Hook / util / service / store | camelCase.ts | `useCart.ts` |
| Server file | camelCase.js | `auth.service.js` |
| React component | PascalCase | `ProductCard` |
| Variable / function | camelCase | `fetchProducts` |
| Constant / enum value | SCREAMING_SNAKE_CASE | `ORDER_STATUS.PLACED` |
| Boolean variable | is/has/can/should prefix | `isLoading`, `hasStock` |
| Event handler | handle prefix | `handleSubmit` |
| API endpoint | lowercase, hyphenated, plural noun | `/api/products` |

---

## Standard response shapes

```js
// Success (server)
res.status(200).json({ success: true, data: result });

// Error (server)
res.status(400).json({ success: false, message: 'What went wrong', errors: [] });
```

---

## Commit message format

```
feat(auth): add brute force protection on login
fix(orders): correct GST calculation on discounted total
test(products): add unit tests for soft delete
```
Format: `type(scope): lowercase description` — no period, under 72 chars.