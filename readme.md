# Project Setup Guide

Follow these steps to run this project locally.

## 1) Install dependencies

```bash
npm install
```

## 2) Create environment file

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Then open `.env` and fill all values:

- `NEXT_PUBLIC_BACKEND_URL`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_PROJECTS_BUCKET`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`

## 3) Set up Supabase database schema

1. Open your Supabase project.
2. Go to **SQL Editor**.
3. Open `lib/supabase/portfolio-schema.sql` from this repo.
4. Copy all SQL and run it in Supabase SQL Editor.

## 4) Run the development server

```bash
npm run dev
```

## 5) Open in browser

Go to:

`http://localhost:3000`
