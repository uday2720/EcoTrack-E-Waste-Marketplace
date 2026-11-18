# EcoTrack – Student-Focused E-Waste Marketplace

**Turning E-Waste into Opportunities for Innovation.**

## About the Project
EcoTrack is a student-focused e-waste marketplace that connects students and researchers with people and recycling centres that have reusable electronic waste.

Students can access affordable components such as:
- Computer hard disks and SSDs
- Motherboards
- RAM modules
- Batteries
- Processors and chips
- Circuit boards and other electronic components

These components can be reused for academic projects, research, experimentation, learning and prototyping.

## Problem Statement
Students often struggle to find affordable electronic components for their university projects and research. At the same time, many usable electronic components are discarded as e-waste.

EcoTrack bridges this gap by connecting e-waste suppliers with students who can give these components a second life.

## Key Features
- **Dual-Mode Architecture**: Fully functional in offline/demo mode with mock catalog & in-memory simulation, and connects seamlessly to Supabase PostgreSQL when credentials are provided in `.env.local`.
- **Role-Based Authentication & Permissions**: Buyer, Seller, and Admin roles. Enforces role boundaries at frontend and Row Level Security (RLS) backend levels (buyers cannot list or delete items; normal users cannot elevate privileges).
- **Marketplace Browsing & Search**: Search by keywords, category filter pills, and price sorting (Featured, Low to High, High to Low).
- **Product Lifecycle (CRUD)**:
  - Sellers can publish listings with validation (title >= 3 chars, price > 0).
  - Sellers can edit their listings (specs, condition, description, asking price).
  - Sellers can delete their own listings.
  - Non-sellers are guided clearly when trying to list items.
- **Buyer–Seller Negotiation**:
  - Live messaging and real-time counter-offers.
  - Interactive negotiation flow with acceptance/rejection states.
- **Escrow & Order Management**:
  - Atomic server-side order creation via `create_escrow_order` RPC with `SELECT FOR UPDATE` product row locking to eliminate race conditions.
  - Server-side price validation against accepted offers to eliminate client-side price tampering.
  - Clamped delivery fee calculation (capped at ₹5,000) and ₹11 platform fee.
  - Dedicated "My Orders" tracking panel with buyer delivery approval.
- **Admin Control Center**:
  - Restricted to verified admin accounts.
  - Platform overview metrics, listing moderation, user management, and order monitoring.

## Technology Stack
- **Frontend**: React 18, Vite 8 (with native esbuild JSX transform & chunk splitting)
- **Icons**: Lucide React
- **Styling**: Modern responsive CSS with CSS variables, animations, and accessible focus states
- **Database & Auth**: Supabase PostgreSQL 15+
- **Security**: Row Level Security (RLS), PL/pgSQL security definer RPCs, anti-tampering triggers

## Getting Started

### 1. Prerequisites
- Node.js (v18+)
- npm

### 2. Installation
```bash
npm install
```

### 3. Local Development
```bash
# Starts the Vite development server on port 5173
npm run dev
```

### 4. Production Build
```bash
# Creates an optimized bundle in /dist with vendor and supabase code splitting
npm run build
npm run preview
```

### 5. Connecting Supabase (Optional)
EcoTrack works out-of-the-box in interactive preview mode without credentials. To connect a live Supabase backend:
1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Set your Supabase project URL and anon key in `.env.local`:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-key
   ```
3. Run the schema script `supabase/schema.sql` in your Supabase SQL Editor.

## Database Schema (`supabase/schema.sql`)
- `profiles`: User accounts linked with `auth.users`, role checking, and account status.
- `products`: E-waste device listings with category check constraints and seller relations.
- `conversations`: Unique 1-to-1 negotiations per product-buyer pair.
- `messages`: Threaded chat messages tied to conversations.
- `price_offers`: Audited offers with statuses (`pending`, `accepted`, `rejected`, `countered`).
- `orders`: Escrow records with fees, delivery tracking, and buyer approval state.
- `create_escrow_order`: Security-definer RPC that locks product row, validates prices on server, and prevents duplicate orders.
- `respond_to_price_offer`: Security-definer RPC that atomically accepts, rejects, or counters offers.
- `protect_profile_roles`: Security-definer trigger that prevents privilege escalation to admin.

## Project Team
- Uday Maheshwary – 1025150029
- Mohit Kumra – 1025150032
- Chaitanya Trikha – 1025150030

## Future Scope
- Student-specific component requests
- Research and project-based listings
- Verified component testing
- Recycling centre partnerships
- Live payment gateway integration (Razorpay / Stripe)

---

**EcoTrack: Reuse. Research. Reinvent.**
