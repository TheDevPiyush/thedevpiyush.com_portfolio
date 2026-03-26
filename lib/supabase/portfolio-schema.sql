-- ============================================================
-- Portfolio Database Schema
-- Run this in Supabase SQL Editor (top to bottom, safe order)
-- ============================================================

-- 1. Independent tables first (no foreign keys)

CREATE TABLE IF NOT EXISTS public.personal_info (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  title character varying NOT NULL,
  location character varying NOT NULL,
  email character varying NOT NULL,
  phone character varying,
  bio text NOT NULL,
  philosophy text,
  github_url character varying,
  linkedin_url character varying,
  twitter_url character varying,
  discord_handle character varying,
  image text,
  working_at text,
  about_me text DEFAULT 'Hey, I''m Piyush — a developer who loves solving real-world problems with clean, efficient code. When I''m not deep into backend logic or exploring new tech, you''ll probably find me with headphones on — singing, discovering new music, or immersed in a game. I believe that creativity fuels great code, and I bring that same curiosity and passion to everything I build.',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT personal_info_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.experiences (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title character varying NOT NULL,
  company character varying NOT NULL,
  location character varying,
  start_date date NOT NULL,
  end_date date,
  is_current boolean DEFAULT false,
  description text NOT NULL,
  technologies text[],
  achievements text[],
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT experiences_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.education (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  degree character varying NOT NULL,
  institution character varying NOT NULL,
  start_date date NOT NULL,
  end_date date,
  gpa character varying,
  coursework text[],
  activities text[],
  thesis character varying,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT education_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.skills (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  level integer NOT NULL CHECK (level >= 0 AND level <= 100),
  category character varying NOT NULL,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT skills_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.certifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  issuer character varying NOT NULL,
  issue_date date NOT NULL,
  expiry_date date,
  credential_url character varying,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT certifications_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.blog_posts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title character varying NOT NULL,
  excerpt text NOT NULL,
  content text,
  publish_date timestamp with time zone DEFAULT (now() AT TIME ZONE 'utc'),
  read_time character varying,
  tags text[],
  url character varying,
  image_url character varying,
  is_featured boolean DEFAULT false,
  is_trending boolean DEFAULT false,
  is_popular boolean DEFAULT false,
  is_published boolean DEFAULT true,
  view_count integer DEFAULT 0,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT blog_posts_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.portfolio_stats (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  stat_key character varying NOT NULL UNIQUE,
  stat_value character varying NOT NULL,
  display_name character varying,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT portfolio_stats_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.interests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  interest character varying NOT NULL,
  emoji character varying,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT interests_pkey PRIMARY KEY (id)
);

-- 2. projects (no FK dependencies)

CREATE TABLE IF NOT EXISTS public.projects (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title character varying NOT NULL,
  description text NOT NULL,
  long_description text,
  tech_stack text[] NOT NULL,
  features text[],
  stats jsonb,
  github_url character varying,
  live_url character varying,
  demo_url character varying,
  image_url character varying,
  is_featured boolean DEFAULT false,
  category character varying,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  is_sellable boolean DEFAULT false,
  price_inr numeric,
  download_file_path text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT projects_pkey PRIMARY KEY (id)
);

-- 3. users (depends on Supabase auth.uid())

CREATE TABLE IF NOT EXISTS public.users (
  id uuid NOT NULL DEFAULT auth.uid(),
  email text NOT NULL,
  username text,
  "isAdmin" boolean NOT NULL DEFAULT false,
  "isMod" boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id)
);

-- 4. project_purchases (depends on users + projects)

CREATE TABLE IF NOT EXISTS public.project_purchases (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  project_id uuid NOT NULL,
  amount_inr numeric NOT NULL,
  status text NOT NULL CHECK (status = ANY (ARRAY['created', 'paid', 'failed', 'expired'])),
  razorpay_order_id text UNIQUE,
  razorpay_payment_id text UNIQUE,
  paid_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT project_purchases_pkey PRIMARY KEY (id),
  CONSTRAINT project_purchases_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT project_purchases_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id)
);