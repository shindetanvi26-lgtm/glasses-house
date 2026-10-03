# Repository instructions

## Build, lint, and test

- `npm run dev` starts the Vite development server.
- `npm run build` creates the production build in `dist/`.
- `npm run preview` serves the production build locally.
- `npm run lint` runs ESLint across the repository. To lint one file, run `npx eslint src/App.jsx`.
- There is currently no test runner or test suite configured, so there is no single-test command.

## Architecture

This is a client-rendered React 19 storefront bundled with Vite. `src/main.jsx` mounts `App` and imports the global stylesheet. `src/App.jsx` owns the storefront's route state, shared cart and wishlist state, and page-level components for the home page, catalog, product details, cart/checkout, order history, admin orders, and contact. `src/App.css` contains the storefront component styles; `src/index.css` establishes global styles and base tokens.

Navigation is implemented in `App` with `history.pushState` and a `popstate` listener rather than a routing library. Page selection is based on `location.pathname`; use the shared `navigate` helper for in-app links so route state and the mobile/search UI stay in sync.

The catalog combines the base product list in `src/App.jsx` with additional products provided by `window.productsData` in `index.html`. That HTML file also supplies the browser globals used for store contact and checkout integrations, including QR generation and mobile UPI handoff. Keep those integrations and their consumers coordinated when changing their data or behavior.

There is no backend: the cart (`gh-cart`), wishlist (`gh-saved`), and orders (`gh-orders`) are stored in browser `localStorage`. Checkout creates order records that are subsequently read and updated by both the customer order-history page and the admin dashboard. Preserve the shared order fields and status values when changing checkout or order-management behavior. WhatsApp and UPI are order-request/payment handoff flows; online card processing is not connected.

## Codebase conventions

- Keep storefront pages and their small, related components in `src/App.jsx`; add corresponding styles in `src/App.css`. Global resets and design tokens belong in `src/index.css`.
- Preserve the existing path-based route mapping in `App` when adding pages, and use `navigate` instead of assigning `location` for internal navigation.
- Use the shared catalog and product helpers for product rendering and detail lookup. Product prices are INR, and product images may be either local root-relative paths or Unsplash photo IDs handled by `photo`.
- Reuse the existing CSS design tokens and class naming patterns. Icons are provided by `lucide-react`.
- `index.html` currently defines browser globals and supplemental catalog entries consumed during `App.jsx` module initialization; do not move or rename these without updating their consumers.
