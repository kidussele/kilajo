# KILAJO — Production Deployment Guide

## 1. Vercel Deployment

KILAJO is engineered for zero-config native deployment on **Vercel**.

### Step 1: Connect GitHub Repository
1. Log into your Vercel dashboard.
2. Select **Add New → Project** and choose `kidussele/kilajo`.
3. Set Framework Preset to **Next.js**.

### Step 2: Configure Environment Variables
Configure the following environment variables in your Vercel project settings:
```ini
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
NEXT_PUBLIC_APP_URL=https://kilajo.app
```

### Step 3: Deploy
Click **Deploy**. Next.js App Router will compile all static and dynamic routes.

---

## 2. Supabase Database Setup

1. Create a project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in the Supabase Dashboard.
3. Run the initial schema migration script located at:
   `supabase/migrations/20261107000000_initial_schema.sql`
4. All tables, foreign key constraints, indexes, and Row Level Security policies will be established automatically.

