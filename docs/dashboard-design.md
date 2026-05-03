# FoodFlow Dashboard Design

## Overview

FoodFlow currently supports signup, login, restaurant browsing, menu browsing, cart management, and checkout. The frontend is functional but very task-oriented: after login, users mainly see a restaurant selector and menu cards.

This feature adds a proper dashboard experience after login so users land on a more useful home screen instead of jumping straight into a menu list.

The dashboard should help users answer three questions quickly:

1. What should I do next?
2. What is in my cart right now?
3. Which restaurants or menu items should I explore first?

## Product Goals

- Give authenticated users a clear landing page after login.
- Surface the most important information without forcing users into the cart or menu first.
- Reuse the existing backend domain where possible.
- Fit cleanly into the current React + Spring Boot architecture.
- Create a foundation for richer order-history and recommendation features later.

## Non-Goals

- Redesigning the entire ordering flow.
- Building a full admin analytics portal.
- Adding advanced personalization or recommendations in v1.
- Introducing a new frontend framework or major state management library.

## Current State

### Frontend

- `frontend/src/App.js` switches between login and food browsing.
- `frontend/src/components/FoodList.js` loads restaurants and menu items.
- `frontend/src/components/MyCart.js` shows the current cart in a drawer.

### Backend

- `MenuController` exposes restaurant and menu endpoints.
- `CartController` exposes cart and checkout endpoints.
- `RestaurantService` builds restaurant/menu DTOs.
- `CartService` manages cart contents and totals.

### Important Constraint

Checkout currently clears the cart, but there is no persistent order history model yet. That means a first dashboard should avoid promising "recent orders" unless we add new backend tables and flows.

## Recommended Dashboard Scope

### V1 Dashboard

The first dashboard should be a customer dashboard for logged-in users.

Recommended sections:

- Welcome header with the user name if available
- Cart summary card
- Restaurant quick-access section
- Featured or popular menu items section
- Recently viewed or last selected restaurant section if stored locally

### V2 Dashboard

- Persistent recent orders
- Reorder shortcuts
- Personalized restaurant recommendations
- Saved favorites

## UX Proposal

Instead of sending authenticated users directly to the current `FoodList` view, the app should route them to a dashboard page first.

Recommended flow:

- Logged out user sees login form
- Logged in user sees dashboard
- From dashboard, user can:
  - open the cart
  - jump into a restaurant
  - browse featured items

### Suggested Layout

- Top header: product name, cart button, account area
- Hero section: welcome message and primary action
- Summary row: cart total, item count, restaurant count
- Restaurant section: cards or list of available restaurants
- Featured items section: a few highlighted menu items across restaurants

### Suggested Primary Actions

- `Continue Shopping`
- `Open Cart`
- `Browse Restaurants`

## Architecture Proposal

### Frontend Changes

Add a new dashboard page and split the current post-login flow into two layers:

- Dashboard view
- Restaurant/menu browsing view

Suggested structure:

- `frontend/src/pages/DashboardPage.js`
- `frontend/src/pages/BrowsePage.js`
- `frontend/src/components/dashboard/DashboardHero.js`
- `frontend/src/components/dashboard/CartSummaryCard.js`
- `frontend/src/components/dashboard/RestaurantCard.js`
- `frontend/src/components/dashboard/FeaturedItemsPanel.js`

### Backend Changes

The backend can support a useful v1 dashboard with mostly existing data.

Recommended approach:

- Keep existing restaurant and cart endpoints
- Add one dashboard summary endpoint for convenience
- Optionally add a featured items endpoint if we want tighter payloads

Suggested additions:

- `controller/DashboardController.java`
- `service/DashboardService.java`
- `model/DashboardDto.java`

## API Design

### Option A: Compose in the Frontend

Reuse:

- `GET /restaurants/menu`
- `GET /cart`

Pros:

- Minimal backend work
- Faster to ship

Cons:

- Frontend needs to merge multiple payloads
- Less flexible if dashboard grows

### Option B: Add a Dashboard Endpoint

Recommended endpoint:

- `GET /dashboard`

Example response:

```json
{
  "cart_summary": {
    "total_price": 24.57,
    "item_count": 3
  },
  "restaurants": [
    {
      "id": 1,
      "name": "Burger King",
      "image_url": "...",
      "menu_count": 8
    }
  ],
  "featured_items": [
    {
      "id": 5,
      "restaurant_id": 1,
      "restaurant_name": "Burger King",
      "name": "Whopper",
      "price": 6.39,
      "image_url": "..."
    }
  ]
}
```

Recommended v1 behavior:

- `cart_summary` comes from the authenticated user cart
- `restaurants` comes from existing restaurant/menu data
- `featured_items` can be a simple curated slice such as the first 6 menu items

## Backend Design Details

### `DashboardService`

Responsibilities:

- Load the current user cart
- Load restaurants
- Derive summary counts
- Select featured items

Suggested output fields:

- `firstName`
- `cartSummary`
- `restaurants`
- `featuredItems`
- `restaurantCount`

### DTOs

Suggested DTOs:

- `DashboardDto`
- `CartSummaryDto`
- `FeaturedMenuItemDto`
- `RestaurantSummaryDto`

### Security

The dashboard should be authenticated like the cart endpoint.

Recommended rule:

- `GET /dashboard` requires a logged-in user

## Frontend Design Details

### Routing

Suggested app states:

- unauthenticated: show login
- authenticated + current view = dashboard
- authenticated + current view = browse

If the app is not using React Router yet, v1 can use local state in `App.js` to switch between dashboard and browse views.

### Data Loading

Recommended utilities:

- `getDashboard()`
- `getCart()`
- `getRestaurants()`

If we add `GET /dashboard`, the dashboard page can render from one request and remain simple.

### Component Responsibilities

- `DashboardHero`
  - welcome copy and primary CTA
- `CartSummaryCard`
  - total price, item count, open-cart action
- `RestaurantCard`
  - restaurant image, name, address, browse action
- `FeaturedItemsPanel`
  - highlighted menu items with add-to-cart action

## Data Strategy

The current schema is enough for a first dashboard.

Existing reusable tables:

- `customers`
- `carts`
- `restaurants`
- `menu_items`
- `order_items`

### If We Want "Recent Orders"

That requires new persistence because checkout currently deletes cart line items.

Future schema ideas:

- `orders`
- `order_line_items`

This should be treated as a follow-up project, not a hidden dependency for the dashboard MVP.

## Rollout Plan

### Phase 1: MVP Dashboard

- Add dashboard UI after login
- Show welcome section
- Show cart summary
- Show restaurant quick access
- Show featured menu items

### Phase 2: Better Navigation

- Add explicit browse page
- Preserve selected restaurant between dashboard and browsing
- Improve empty states and loading states

### Phase 3: History and Personalization

- Add persistent orders model
- Add recent orders and reorder shortcuts
- Add favorites or recommendations

## Testing Strategy

Frontend:

- Render dashboard loading state
- Render dashboard success state
- Verify cart CTA opens cart drawer
- Verify restaurant CTA navigates to browse view
- Verify add-to-cart from featured items works

Backend:

- Dashboard endpoint returns authenticated user cart summary
- Dashboard endpoint includes restaurants
- Featured items payload is stable and non-empty when menu data exists

## Risks and Tradeoffs

- Without React Router, navigation may become harder to maintain if the app grows.
- Without persistent orders, the dashboard cannot yet feel fully personalized.
- If `GET /restaurants/menu` returns large nested payloads, frontend composition could become wasteful.

## Recommended First Implementation Slice

The best first slice is:

1. Add a `DashboardPage` in the frontend.
2. Add a simple `GET /dashboard` backend endpoint.
3. Show cart summary, restaurant cards, and featured items.
4. Let users move from dashboard into the existing browsing flow.

This gives FoodFlow a real post-login home screen without forcing a larger data-model redesign first.
