# Meal Dash - Online Food Ordering System

## Overview

Full-stack food ordering platform focused on Ibadan, Nigeria. Built with React + Vite frontend and Express backend in a pnpm monorepo.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Features

- Restaurant browsing (Top Restaurants: Item 7, Kilimanjaro, Chicken Republic, KFC | Campus: Tasty Vine, Marigold, Chills)
- Menu browsing with categories, add to cart
- Cart with quantity controls, dynamic pricing
- Checkout with delivery details
- Order confirmation with status tracker (Pending → Preparing → On the Way → Delivered)
- Order history
- Meal search across restaurants
- Careers page with job application form (Chef, Delivery Rider, Manager)
- Admin dashboard (restaurant CRUD, menu item CRUD, view applications, stats)
- Dark mode toggle
- Responsive design

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/scripts run seed` — seed database with restaurants and menu items

## Database Tables

- `restaurants` — restaurant info (name, category, rating, delivery times, tags)
- `menu_items` — food items per restaurant (name, price, category, popularity)
- `orders` — customer orders with items, status tracking
- `applications` — job applications from careers page

## Architecture

- `artifacts/meal-dash/` — React + Vite frontend (served at `/`)
- `artifacts/api-server/` — Express API server (served at `/api`)
- `lib/api-spec/` — OpenAPI specification
- `lib/api-client-react/` — Generated React Query hooks
- `lib/api-zod/` — Generated Zod validation schemas
- `lib/db/` — Drizzle ORM schema and database connection
- `scripts/` — Utility scripts (seeding)

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
