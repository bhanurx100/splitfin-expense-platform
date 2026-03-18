# Spendwise - Modern Expense Tracking Dashboard

[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg?style=flat&logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-18-blue.svg?style=flat&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg?style=flat&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4-blue.svg?style=flat&logo=tailwind)](https://tailwindcss.com)

Spendwise is a full-stack personal finance management dashboard built with Next.js 14 App Router. Track your income and expenses, manage accounts and categories, visualize spending patterns with interactive charts, and analyze summaries with powerful filters and data tables.

## ✨ Features

- **Multi-user support** with Clerk authentication
- **CRUD operations** for Accounts, Categories, and Transactions via intuitive shadcn/ui sheets and forms
- **Interactive Charts** (Pie, Bar, Line, Area, Radar, Radial) powered by Recharts with custom tooltips and filters (date range, accounts)
- **Data Tables** with TanStack Table, sorting, pagination
- **Advanced Filters**: Date picker, account/category selectors, amount inputs
- **Demo Data**: CSV import via seed script (`bun run db:seed`)
- **Responsive UI** with Tailwind CSS and shadcn/ui components
- **Type-safe API** with TanStack Query hooks, Zod validation, Drizzle ORM
- **Dark/Light mode** support

![Dashboard Screenshot](https://via.placeholder.com/1200x600/1e3a8a/ffffff?text=Spendwise+Dashboard) <!-- Replace with actual screenshot -->

## 📁 File Structure

```
spendwise-expense-platform/
├── app/                     # Next.js 14 App Router
│   ├── (auth)/              # Auth routes
│   ├── (dashboard)/         # Protected dashboard routes
│   ├── api/[[...route]]/    # API catch-all (Hono?)
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/              # Shared UI components
│   ├── ui/                  # shadcn/ui primitives (button, card, table, etc.)
│   ├── chart.tsx            # Chart wrappers/variants
│   └── data-*.tsx           # Data cards, grids, tables
├── features/                # Feature-sliced organization
│   ├── accounts/            # Accounts CRUD (api hooks, forms, sheets)
│   ├── categories/          # Categories CRUD
│   ├── summary/             # Summary data
│   └── transactions/        # Transactions CRUD (bulk ops)
├── db/                      # Drizzle ORM
│   ├── schema.ts            # Accounts, Categories, Transactions tables
│   └── drizzle.ts
├── lib/                     # Utilities
│   ├── utils.ts
│   └── hono.ts              # API router?
├── providers/               # React providers (QueryClient, Theme)
├── config/                  # App config
├── drizzle/                 # Generated migrations
├── scripts/seed.ts          # Demo data seeding
├── package.json             # Bun + deps
├── tailwind.config.ts
├── drizzle.config.ts
├── next.config.mjs
└── tsconfig.json
```

## 🏗️ Project Architecture

```
User (Clerk Auth)
  ↓
App Router (Next.js 14)
├── Client Components (RSC boundaries)
│   ├── shadcn/ui + Custom (charts, forms, tables)
│   ├── TanStack Query (mutations/queries)
│   └── Zustand (state?)
├── Server Actions / API Routes (Hono?)
│   └── Drizzle ORM (Neon Postgres)
└── Providers (QueryClient, Theme)

Data Flow:
- Queries/Mutations → features/*/api/use-*.ts → Drizzle
- UI → React Hook Form + Zod → Mutations
- Charts → Recharts + Aggregated data from summary queries
```

- **Frontend**: Feature-sliced (accounts/transactions/etc.), TanStack Query for optimistic updates/caching.
- **Backend**: Drizzle for schema/migrations/queries, Zod for validation.
- **Styling**: Tailwind + shadcn/ui + class-variance-authority (cva).
- **Data**: Per-user tables, transactions link accounts/categories.

## 🛠️ Tech Stack

| Category         | Technologies                                                                                                                                                                    |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework        | [Next.js 14](https://nextjs.org), [React 18](https://react.dev), [TypeScript 5](https://typescriptlang.org)                                                                     |
| UI/Styling       | [Tailwind CSS](https://tailwindcss.com), [shadcn/ui](https://ui.shadcn.com), [Radix UI](https://radix-ui.com), [Lucide Icons](https://lucide.dev), [Sonner](https://sonner.dev) |
| Data Fetching    | [@tanstack/react-query](https://tanstack.com/query), [@tanstack/react-table](https://tanstack.com/table)                                                                        |
| Forms/Validation | [React Hook Form](https://react-hook-form.com), [Zod](https://zod.dev)                                                                                                          |
| Database/ORM     | [Drizzle ORM](https://orm.drizzle.team), [Neon Postgres](https://neon.tech), [pg](https://node-postgres.com)                                                                    |
| Auth             | [Clerk](https://clerk.com)                                                                                                                                                      |
| Charts           | [Recharts](https://recharts.org)                                                                                                                                                |
| Utils            | [date-fns](https://date-fns.org), [class-variance-authority](https://cva.style), [clsx](https://clsx.com), [Hono](https://hono.dev)                                             |
| Other            | [Bun](https://bun.sh) (lockfile/scripts), [react-countup](https://react-countup.js.org)                                                                                         |

Full deps in `package.json`.

## 🚀 Quick Start

1. **Prerequisites**: Git, [Bun](https://bun.sh) (recommended) or Node.js 20+.

2. **Clone & Install**:

   ```bash
   git clone <repo> spendwise-expense-platform
   cd spendwise-expense-platform
   bun install  # or npm install
   ```

3. **Environment** (`.env.local`):

   ```env
   NEXT_TELEMETRY_DISABLED=1
   # Clerk (sign up at https://clerk.com)
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   # Neon Postgres (https://neon.tech) or local PG
   DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Database**:

   ```bash
   bunx drizzle-kit generate:pg
   bunx drizzle-kit migrate
   bun run db:seed  # Loads demo data from public/data.csv
   # Optional: bun run db:studio (Drizzle Studio UI)
   ```

5. **Run**:
   ```bash
   bun run dev  # http://localhost:3000
   ```

## 🐳 Local Development (No Neon)

Use [Turso](https://turso.tech) libSQL or Docker Postgres:

```bash
docker run -p 5432:5432 -e POSTGRES_PASSWORD=pass -d postgres
DATABASE_URL=postgresql://postgres:pass@localhost:5432/spendwise
```

## ☁️ Deployment

- **Frontend**: Vercel (auto-deploys from GitHub)
- **DB**: Neon or Supabase Postgres
- **Auth**: Clerk (dev/prod keys)

## 🤝 Contributing

1. Fork & PR
2. Follow ESLint/Prettier
3. Update deps with `bun add`

See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

## 📄 License

[MIT](LICENSE)

---

⭐ Star on GitHub if useful!
