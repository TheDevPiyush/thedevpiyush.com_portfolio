# Portfolio Project Setup Guide

Thanks for purchasing this project.
Follow this guide step by step to run it locally and deploy it safely.

## 1) Prerequisites

- Node.js `18+` (recommended `20+`)
- npm (comes with Node)
- A Supabase project
- A Razorpay account (for payment flow)

## 2) Extract the downloaded zip folder

## 3) Environment Variables

Create a `.env.local` file in project root and fill these values:

```env
NEXT_PUBLIC_BACKEND_URL="http://localhost:3000"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
NEXT_PUBLIC_SUPABASE_URL=""
NEXT_PUBLIC_SUPABASE_ANON_KEY=""

SUPABASE_URL=""
SUPABASE_SERVICE_ROLE_KEY=""
SUPABASE_PROJECTS_BUCKET="projects"
SUPABASE_PROJECTS_SETUP_GUIDES_BUCKET="projects"

RAZORPAY_KEY_ID=""
RAZORPAY_KEY_SECRET=""
RAZORPAY_WEBHOOK_SECRET=""
```

Notes:
- `NEXT_PUBLIC_BACKEND_URL` can be your app URL in most cases.
- Keep service role and payment secrets private.

## 4) Supabase Database Setup

Run this SQL file in your Supabase SQL Editor:

- `lib/supabase/portfolio-schema.sql`

If you are setting up on an existing DB, ensure these columns exist in `projects` table:

```sql
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS setup_guide_file_path text;

ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS screenshot_urls text[];
```

## 5) Supabase Storage Buckets

Create bucket:
- `projects` (or your custom `SUPABASE_PROJECTS_BUCKET`)

This project stores:
- ZIP source files
- Setup guide markdown files
- Cover images
- Screenshots

If using a separate setup-guide bucket, set:
- `SUPABASE_PROJECTS_SETUP_GUIDES_BUCKET`

## 6) Razorpay Setup

Add keys in env:
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`

Configure webhook in Razorpay dashboard:
- Endpoint: `https://your-domain.com/api/payments/webhook`
- Events: payment success/failure events used by your flow

## 7) Run the App

```bash
npm run dev
```

Open:
- `http://localhost:3000`

## 8) Admin Flow

Go to:
- `/admin/signin`
- then `/admin/projects`

You can:
- create a project
- edit existing project
- upload ZIP, cover image, screenshots, and setup guide `.md`

## 9) Buyer Flow

On `/projects`:
- Buyer clicks `Preview & Buy`
- Buyer sees modal with screenshots
- Buyer reads setup guide rendered from markdown
- Buyer proceeds to payment
- After successful payment, download starts

## 10) Common Issues

### Auth looks delayed after Google login

This project shows a login loading state while user session hydrates. Wait 1-2 seconds after redirect.

### Project media not showing

Check:
- bucket names in env
- uploaded file paths in `projects` table
- Supabase storage access and URL generation

### Payment order creation fails

Check:
- Razorpay keys
- server env is loaded
- `/api/payments/create-order` logs

## 11) Production Checklist

- Set production `NEXT_PUBLIC_SITE_URL`
- Use secure env management
- Add proper Supabase storage policies
- Verify webhook URL and secret
- Test full buy/download flow with real-like data

---