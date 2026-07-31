-- ============================================================
-- Venti-Ate Admin Panel — Initial Schema Migration
-- ============================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name    TEXT,
  last_name     TEXT,
  email         TEXT NOT NULL,
  phone         TEXT,
  avatar_url    TEXT,
  user_type     TEXT NOT NULL DEFAULT 'customer' CHECK (user_type IN ('customer','admin','super_admin')),
  status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive','banned')),
  last_login_at TIMESTAMPTZ,
  last_login_ip TEXT,
  email_verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROLES & PERMISSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.roles (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL UNIQUE,
  label       TEXT NOT NULL,
  description TEXT,
  is_system   BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.permissions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  module      TEXT NOT NULL,
  action      TEXT NOT NULL,
  label       TEXT NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(module, action)
);

CREATE TABLE IF NOT EXISTS public.role_permissions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role_id       UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS public.user_roles (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role_id    UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id),
  UNIQUE(user_id, role_id)
);

-- ============================================================
-- LOGIN LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_login_logs (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  email            TEXT,
  user_type        TEXT,
  login_at         TIMESTAMPTZ DEFAULT NOW(),
  logout_at        TIMESTAMPTZ,
  ip_address       TEXT,
  user_agent       TEXT,
  browser          TEXT,
  operating_system TEXT,
  device_type      TEXT,
  country          TEXT,
  city             TEXT,
  session_id       TEXT,
  auth_provider    TEXT DEFAULT 'email',
  login_status     TEXT NOT NULL CHECK (login_status IN ('success','failed','blocked')),
  failure_reason   TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ADMIN ACTIVITY LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.admin_activity_logs (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  actor_email   TEXT,
  action        TEXT NOT NULL,
  entity_type   TEXT NOT NULL,
  entity_id     TEXT,
  old_values    JSONB,
  new_values    JSONB,
  request_ip    TEXT,
  user_agent    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CATEGORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id   UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url   TEXT,
  icon        TEXT,
  sort_order  INTEGER DEFAULT 0,
  is_active   BOOLEAN DEFAULT TRUE,
  show_in_menu BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  seo_title   TEXT,
  seo_desc    TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  created_by  UUID REFERENCES public.profiles(id),
  deleted_at  TIMESTAMPTZ
);

-- ============================================================
-- BRANDS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.brands (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  logo_url    TEXT,
  website     TEXT,
  is_active   BOOLEAN DEFAULT TRUE,
  seo_title   TEXT,
  seo_desc    TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  created_by  UUID REFERENCES public.profiles(id),
  deleted_at  TIMESTAMPTZ
);

-- ============================================================
-- PRODUCTS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.products (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                TEXT NOT NULL,
  slug                TEXT NOT NULL UNIQUE,
  short_description   TEXT,
  description         TEXT,
  brand_id            UUID REFERENCES public.brands(id) ON DELETE SET NULL,
  category_id         UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  product_type        TEXT DEFAULT 'physical' CHECK (product_type IN ('physical','digital')),
  sku                 TEXT UNIQUE,
  barcode             TEXT,
  price               NUMERIC(10,2) NOT NULL DEFAULT 0,
  compare_at_price    NUMERIC(10,2),
  cost_price          NUMERIC(10,2),
  tax_rate            NUMERIC(5,2) DEFAULT 0,
  weight              NUMERIC(8,2),
  width               NUMERIC(8,2),
  height              NUMERIC(8,2),
  length              NUMERIC(8,2),
  shipping_class      TEXT,
  main_image_url      TEXT,
  is_active           BOOLEAN DEFAULT TRUE,
  is_featured         BOOLEAN DEFAULT FALSE,
  is_new              BOOLEAN DEFAULT FALSE,
  is_bestseller       BOOLEAN DEFAULT FALSE,
  has_variants        BOOLEAN DEFAULT FALSE,
  track_inventory     BOOLEAN DEFAULT TRUE,
  allow_backorder     BOOLEAN DEFAULT FALSE,
  warranty_info       TEXT,
  return_policy       TEXT,
  published_at        TIMESTAMPTZ,
  seo_title           TEXT,
  seo_desc            TEXT,
  seo_keywords        TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW(),
  created_by          UUID REFERENCES public.profiles(id),
  updated_by          UUID REFERENCES public.profiles(id),
  deleted_at          TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.product_images (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  url        TEXT NOT NULL,
  alt        TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.product_variants (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id   UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  sku          TEXT UNIQUE,
  barcode      TEXT,
  price        NUMERIC(10,2),
  compare_at_price NUMERIC(10,2),
  cost_price   NUMERIC(10,2),
  image_url    TEXT,
  is_active    BOOLEAN DEFAULT TRUE,
  sort_order   INTEGER DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.product_attributes (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL UNIQUE,
  label      TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.product_attribute_values (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attribute_id UUID NOT NULL REFERENCES public.product_attributes(id) ON DELETE CASCADE,
  product_id   UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  value        TEXT NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tags (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL UNIQUE,
  slug       TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.product_tags (
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  tag_id     UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, tag_id)
);

-- ============================================================
-- WAREHOUSES & INVENTORY
-- ============================================================
CREATE TABLE IF NOT EXISTS public.warehouses (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL,
  address    TEXT,
  is_active  BOOLEAN DEFAULT TRUE,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.inventory (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id          UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id          UUID REFERENCES public.product_variants(id) ON DELETE CASCADE,
  warehouse_id        UUID NOT NULL REFERENCES public.warehouses(id) ON DELETE CASCADE,
  quantity            INTEGER NOT NULL DEFAULT 0,
  reserved_quantity   INTEGER NOT NULL DEFAULT 0,
  critical_level      INTEGER DEFAULT 5,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, variant_id, warehouse_id)
);

CREATE TABLE IF NOT EXISTS public.inventory_movements (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id   UUID NOT NULL REFERENCES public.products(id),
  variant_id   UUID REFERENCES public.product_variants(id),
  warehouse_id UUID NOT NULL REFERENCES public.warehouses(id),
  type         TEXT NOT NULL CHECK (type IN ('in','out','transfer','adjustment','damage','return')),
  quantity     INTEGER NOT NULL,
  reference_id TEXT,
  reference_type TEXT,
  note         TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  created_by   UUID REFERENCES public.profiles(id)
);

-- ============================================================
-- SUPPLIERS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.suppliers (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         TEXT NOT NULL,
  email        TEXT,
  phone        TEXT,
  address      TEXT,
  tax_number   TEXT,
  website      TEXT,
  is_active    BOOLEAN DEFAULT TRUE,
  notes        TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW(),
  deleted_at   TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.purchase_orders (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id         UUID NOT NULL REFERENCES public.suppliers(id),
  warehouse_id        UUID NOT NULL REFERENCES public.warehouses(id),
  status              TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','ordered','partial','completed','cancelled')),
  total_amount        NUMERIC(10,2) DEFAULT 0,
  expected_at         DATE,
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW(),
  created_by          UUID REFERENCES public.profiles(id)
);

CREATE TABLE IF NOT EXISTS public.purchase_order_items (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  purchase_order_id UUID NOT NULL REFERENCES public.purchase_orders(id) ON DELETE CASCADE,
  product_id        UUID NOT NULL REFERENCES public.products(id),
  variant_id        UUID REFERENCES public.product_variants(id),
  quantity          INTEGER NOT NULL,
  received_quantity INTEGER DEFAULT 0,
  unit_cost         NUMERIC(10,2) NOT NULL,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CUSTOMERS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.customers (
  id               UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  customer_number  TEXT UNIQUE,
  group_name       TEXT DEFAULT 'standard',
  loyalty_points   INTEGER DEFAULT 0,
  gift_balance     NUMERIC(10,2) DEFAULT 0,
  total_spent      NUMERIC(10,2) DEFAULT 0,
  order_count      INTEGER DEFAULT 0,
  notes            TEXT,
  is_blocked       BOOLEAN DEFAULT FALSE,
  marketing_email  BOOLEAN DEFAULT TRUE,
  marketing_sms    BOOLEAN DEFAULT FALSE,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.customer_addresses (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id  UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  label        TEXT DEFAULT 'Ev',
  first_name   TEXT NOT NULL,
  last_name    TEXT NOT NULL,
  phone        TEXT,
  address_line TEXT NOT NULL,
  city         TEXT NOT NULL,
  district     TEXT,
  postal_code  TEXT,
  country      TEXT DEFAULT 'TR',
  is_default   BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ORDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.orders (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number     TEXT NOT NULL UNIQUE,
  customer_id      UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  status           TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','payment_pending','preparing','shipped','delivered','cancelled','refunded','failed')),
  payment_status   TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending','paid','failed','refunded','partial')),
  subtotal         NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount_amount  NUMERIC(10,2) DEFAULT 0,
  coupon_code      TEXT,
  coupon_discount  NUMERIC(10,2) DEFAULT 0,
  tax_amount       NUMERIC(10,2) DEFAULT 0,
  shipping_cost    NUMERIC(10,2) DEFAULT 0,
  total            NUMERIC(10,2) NOT NULL DEFAULT 0,
  payment_method   TEXT,
  shipping_company TEXT,
  tracking_number  TEXT,
  customer_note    TEXT,
  admin_note       TEXT,
  ip_address       TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW(),
  created_by       UUID REFERENCES public.profiles(id)
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id     UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id   UUID REFERENCES public.products(id) ON DELETE SET NULL,
  variant_id   UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  variant_name TEXT,
  sku          TEXT,
  price        NUMERIC(10,2) NOT NULL,
  quantity     INTEGER NOT NULL,
  total        NUMERIC(10,2) NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.order_addresses (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id     UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  type         TEXT NOT NULL CHECK (type IN ('billing','shipping')),
  first_name   TEXT NOT NULL,
  last_name    TEXT NOT NULL,
  phone        TEXT,
  email        TEXT,
  address_line TEXT NOT NULL,
  city         TEXT NOT NULL,
  district     TEXT,
  postal_code  TEXT,
  country      TEXT DEFAULT 'TR'
);

CREATE TABLE IF NOT EXISTS public.order_status_history (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id   UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status     TEXT NOT NULL,
  note       TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id)
);

-- ============================================================
-- PAYMENTS & REFUNDS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.payments (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id       UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  amount         NUMERIC(10,2) NOT NULL,
  method         TEXT NOT NULL,
  status         TEXT NOT NULL CHECK (status IN ('pending','success','failed','refunded')),
  transaction_id TEXT,
  provider       TEXT,
  commission     NUMERIC(10,2) DEFAULT 0,
  net_amount     NUMERIC(10,2),
  fraud_status   TEXT DEFAULT 'ok',
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.refunds (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id     UUID NOT NULL REFERENCES public.orders(id),
  payment_id   UUID REFERENCES public.payments(id),
  amount       NUMERIC(10,2) NOT NULL,
  reason       TEXT,
  status       TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','completed')),
  notes        TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW(),
  created_by   UUID REFERENCES public.profiles(id)
);

CREATE TABLE IF NOT EXISTS public.return_requests (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id       UUID NOT NULL REFERENCES public.orders(id),
  customer_id    UUID REFERENCES public.customers(id),
  type           TEXT NOT NULL DEFAULT 'return' CHECK (type IN ('return','exchange')),
  status         TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','completed')),
  reason         TEXT,
  customer_note  TEXT,
  admin_note     TEXT,
  cargo_code     TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SHIPPING
-- ============================================================
CREATE TABLE IF NOT EXISTS public.shipping_companies (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL,
  code       TEXT NOT NULL UNIQUE,
  tracking_url TEXT,
  is_active  BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.shipping_rates (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id         UUID NOT NULL REFERENCES public.shipping_companies(id) ON DELETE CASCADE,
  name               TEXT NOT NULL,
  min_weight         NUMERIC(8,2) DEFAULT 0,
  max_weight         NUMERIC(8,2),
  min_cart           NUMERIC(10,2) DEFAULT 0,
  max_cart           NUMERIC(10,2),
  price              NUMERIC(10,2) NOT NULL,
  free_shipping_over NUMERIC(10,2),
  is_active          BOOLEAN DEFAULT TRUE,
  created_at         TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CAMPAIGNS & COUPONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.campaigns (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  description     TEXT,
  type            TEXT NOT NULL CHECK (type IN ('percent','fixed','free_shipping','buy_x_get_y')),
  value           NUMERIC(10,2) NOT NULL DEFAULT 0,
  min_cart        NUMERIC(10,2) DEFAULT 0,
  max_discount    NUMERIC(10,2),
  usage_limit     INTEGER,
  used_count      INTEGER DEFAULT 0,
  starts_at       TIMESTAMPTZ,
  ends_at         TIMESTAMPTZ,
  is_active       BOOLEAN DEFAULT TRUE,
  priority        INTEGER DEFAULT 0,
  customer_group  TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  created_by      UUID REFERENCES public.profiles(id)
);

CREATE TABLE IF NOT EXISTS public.coupons (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code          TEXT NOT NULL UNIQUE,
  campaign_id   UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  type          TEXT NOT NULL CHECK (type IN ('percent','fixed','free_shipping')),
  value         NUMERIC(10,2) NOT NULL,
  min_cart      NUMERIC(10,2) DEFAULT 0,
  max_discount  NUMERIC(10,2),
  usage_limit   INTEGER,
  per_user_limit INTEGER DEFAULT 1,
  used_count    INTEGER DEFAULT 0,
  starts_at     TIMESTAMPTZ,
  ends_at       TIMESTAMPTZ,
  is_active     BOOLEAN DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  created_by    UUID REFERENCES public.profiles(id)
);

CREATE TABLE IF NOT EXISTS public.coupon_usages (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coupon_id   UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  order_id    UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id),
  discount    NUMERIC(10,2) NOT NULL,
  used_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- REVIEWS & Q&A
-- ============================================================
CREATE TABLE IF NOT EXISTS public.reviews (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id   UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  customer_id  UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  order_id     UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  rating       INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title        TEXT,
  body         TEXT,
  status       TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','spam')),
  admin_reply  TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.product_questions (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id   UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  customer_id  UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  question     TEXT NOT NULL,
  answer       TEXT,
  status       TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','answered','hidden')),
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CONTENT
-- ============================================================
CREATE TABLE IF NOT EXISTS public.pages (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title      TEXT NOT NULL,
  slug       TEXT NOT NULL UNIQUE,
  content    TEXT,
  is_active  BOOLEAN DEFAULT TRUE,
  seo_title  TEXT,
  seo_desc   TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id)
);

CREATE TABLE IF NOT EXISTS public.blog_posts (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title         TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,
  excerpt       TEXT,
  content       TEXT,
  cover_url     TEXT,
  author_id     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status        TEXT DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
  published_at  TIMESTAMPTZ,
  seo_title     TEXT,
  seo_desc      TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.media (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         TEXT NOT NULL,
  url          TEXT NOT NULL,
  bucket       TEXT NOT NULL,
  path         TEXT NOT NULL,
  mime_type    TEXT,
  size         INTEGER,
  alt          TEXT,
  title        TEXT,
  description  TEXT,
  uploaded_by  UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.banners (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title        TEXT NOT NULL,
  description  TEXT,
  image_url    TEXT,
  mobile_image_url TEXT,
  button_text  TEXT,
  button_url   TEXT,
  position     TEXT DEFAULT 'hero',
  sort_order   INTEGER DEFAULT 0,
  starts_at    TIMESTAMPTZ,
  ends_at      TIMESTAMPTZ,
  is_active    BOOLEAN DEFAULT TRUE,
  click_count  INTEGER DEFAULT 0,
  view_count   INTEGER DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW(),
  created_by   UUID REFERENCES public.profiles(id)
);

-- ============================================================
-- SEO
-- ============================================================
CREATE TABLE IF NOT EXISTS public.seo_metadata (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type   TEXT NOT NULL,
  entity_id     UUID NOT NULL,
  seo_title     TEXT,
  seo_desc      TEXT,
  seo_keywords  TEXT,
  canonical_url TEXT,
  og_title      TEXT,
  og_desc       TEXT,
  og_image      TEXT,
  robots        TEXT DEFAULT 'index,follow',
  schema_type   TEXT,
  schema_data   JSONB,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(entity_type, entity_id)
);

CREATE TABLE IF NOT EXISTS public.redirects (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_path   TEXT NOT NULL UNIQUE,
  to_path     TEXT NOT NULL,
  type        INTEGER DEFAULT 301 CHECK (type IN (301,302)),
  is_active   BOOLEAN DEFAULT TRUE,
  hit_count   INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  type        TEXT NOT NULL,
  title       TEXT NOT NULL,
  body        TEXT,
  data        JSONB,
  is_read     BOOLEAN DEFAULT FALSE,
  read_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- SETTINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.settings (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key        TEXT NOT NULL UNIQUE,
  value      JSONB,
  group_name TEXT NOT NULL DEFAULT 'general',
  label      TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES public.profiles(id)
);

-- ============================================================
-- INVOICES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.invoices (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id     UUID NOT NULL REFERENCES public.orders(id),
  invoice_no   TEXT NOT NULL UNIQUE,
  type         TEXT DEFAULT 'sale' CHECK (type IN ('sale','return')),
  status       TEXT DEFAULT 'draft' CHECK (status IN ('draft','sent','cancelled')),
  total        NUMERIC(10,2) NOT NULL,
  tax_total    NUMERIC(10,2) DEFAULT 0,
  pdf_url      TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  created_by   UUID REFERENCES public.profiles(id)
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_products_slug         ON public.products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category     ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_brand        ON public.products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active    ON public.products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_deleted_at   ON public.products(deleted_at);
CREATE INDEX IF NOT EXISTS idx_orders_customer       ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status         ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at     ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_product     ON public.inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_warehouse   ON public.inventory(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product       ON public.reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status        ON public.reviews(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user    ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_admin_logs_actor      ON public.admin_activity_logs(actor_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created    ON public.admin_activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_login_logs_user       ON public.user_login_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_coupons_code          ON public.coupons(code);

-- ============================================================
-- TRIGGERS — auto updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ DECLARE t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY['profiles','products','categories','brands','orders','coupons','campaigns','inventory','customers','settings','banners','blog_posts']) LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_%s_updated_at ON public.%s', t, t);
    EXECUTE format('CREATE TRIGGER trg_%s_updated_at BEFORE UPDATE ON public.%s FOR EACH ROW EXECUTE FUNCTION public.set_updated_at()', t, t);
  END LOOP;
END $$;

-- ============================================================
-- TRIGGER — auto create profile on auth.users insert
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, user_type)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'customer')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- RLS — Enable on all tables
-- ============================================================
DO $$ DECLARE t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'profiles','roles','permissions','role_permissions','user_roles',
    'user_login_logs','admin_activity_logs',
    'categories','brands','products','product_images','product_variants',
    'product_attributes','product_attribute_values','tags','product_tags',
    'warehouses','inventory','inventory_movements',
    'suppliers','purchase_orders','purchase_order_items',
    'customers','customer_addresses',
    'orders','order_items','order_addresses','order_status_history',
    'payments','refunds','return_requests',
    'shipping_companies','shipping_rates',
    'campaigns','coupons','coupon_usages',
    'reviews','product_questions',
    'pages','blog_posts','media','banners','seo_metadata','redirects',
    'notifications','settings','invoices'
  ]) LOOP
    EXECUTE format('ALTER TABLE public.%s ENABLE ROW LEVEL SECURITY', t);
  END LOOP;
END $$;

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- Helper function: check if user is admin/super_admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND user_type IN ('admin','super_admin')
    AND status = 'active'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND user_type = 'super_admin'
    AND status = 'active'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- profiles
CREATE POLICY "profiles_own_select" ON public.profiles FOR SELECT USING (id = auth.uid() OR public.is_admin());
CREATE POLICY "profiles_own_update" ON public.profiles FOR UPDATE USING (id = auth.uid() OR public.is_admin());
CREATE POLICY "profiles_admin_insert" ON public.profiles FOR INSERT WITH CHECK (public.is_admin() OR auth.uid() = id);
CREATE POLICY "profiles_super_delete" ON public.profiles FOR DELETE USING (public.is_super_admin());

-- products, categories, brands — public read, admin write
CREATE POLICY "products_public_read"  ON public.products FOR SELECT USING (is_active = TRUE AND deleted_at IS NULL OR public.is_admin());
CREATE POLICY "products_admin_write"  ON public.products FOR ALL USING (public.is_admin());
CREATE POLICY "categories_public_read" ON public.categories FOR SELECT USING (TRUE);
CREATE POLICY "categories_admin_write" ON public.categories FOR ALL USING (public.is_admin());
CREATE POLICY "brands_public_read"    ON public.brands FOR SELECT USING (TRUE);
CREATE POLICY "brands_admin_write"    ON public.brands FOR ALL USING (public.is_admin());

-- orders — customer sees own, admin sees all
CREATE POLICY "orders_customer_select" ON public.orders FOR SELECT USING (customer_id IN (SELECT id FROM public.customers WHERE id = auth.uid()) OR public.is_admin());
CREATE POLICY "orders_admin_write"     ON public.orders FOR ALL USING (public.is_admin());

-- customers — own profile only
CREATE POLICY "customers_own_select" ON public.customers FOR SELECT USING (id = auth.uid() OR public.is_admin());
CREATE POLICY "customers_own_update" ON public.customers FOR UPDATE USING (id = auth.uid() OR public.is_admin());
CREATE POLICY "customers_admin_all"  ON public.customers FOR ALL USING (public.is_admin());

-- customer_addresses
CREATE POLICY "addresses_own" ON public.customer_addresses FOR ALL USING (customer_id = auth.uid() OR public.is_admin());

-- notifications
CREATE POLICY "notif_own" ON public.notifications FOR ALL USING (user_id = auth.uid() OR public.is_admin());

-- admin-only tables
CREATE POLICY "admin_activity_logs_admin" ON public.admin_activity_logs FOR ALL USING (public.is_admin());
CREATE POLICY "user_login_logs_admin"     ON public.user_login_logs FOR ALL USING (public.is_admin());
CREATE POLICY "settings_admin"            ON public.settings FOR ALL USING (public.is_admin());
CREATE POLICY "inventory_admin"           ON public.inventory FOR ALL USING (public.is_admin());
CREATE POLICY "warehouses_admin"          ON public.warehouses FOR ALL USING (public.is_admin());
CREATE POLICY "campaigns_admin"           ON public.campaigns FOR ALL USING (public.is_admin());
CREATE POLICY "coupons_admin_write"       ON public.coupons FOR INSERT USING (public.is_admin());
CREATE POLICY "coupons_admin_update"      ON public.coupons FOR UPDATE USING (public.is_admin());
CREATE POLICY "coupons_admin_delete"      ON public.coupons FOR DELETE USING (public.is_admin());
CREATE POLICY "coupons_public_read"       ON public.coupons FOR SELECT USING (TRUE);
CREATE POLICY "suppliers_admin"           ON public.suppliers FOR ALL USING (public.is_admin());
CREATE POLICY "purchase_orders_admin"     ON public.purchase_orders FOR ALL USING (public.is_admin());
CREATE POLICY "purchase_order_items_admin" ON public.purchase_order_items FOR ALL USING (public.is_admin());
CREATE POLICY "payments_admin"            ON public.payments FOR ALL USING (public.is_admin());
CREATE POLICY "refunds_admin"             ON public.refunds FOR ALL USING (public.is_admin());
CREATE POLICY "invoices_admin"            ON public.invoices FOR ALL USING (public.is_admin());
CREATE POLICY "banners_public_read"       ON public.banners FOR SELECT USING (is_active = TRUE);
CREATE POLICY "banners_admin_write"       ON public.banners FOR ALL USING (public.is_admin());
CREATE POLICY "media_admin"               ON public.media FOR ALL USING (public.is_admin());
CREATE POLICY "redirects_admin"           ON public.redirects FOR ALL USING (public.is_admin());
CREATE POLICY "roles_admin"               ON public.roles FOR ALL USING (public.is_admin());
CREATE POLICY "permissions_admin"         ON public.permissions FOR ALL USING (public.is_admin());
CREATE POLICY "role_permissions_admin"    ON public.role_permissions FOR ALL USING (public.is_admin());
CREATE POLICY "user_roles_admin"          ON public.user_roles FOR ALL USING (public.is_admin());
CREATE POLICY "reviews_public_read"       ON public.reviews FOR SELECT USING (status = 'approved' OR public.is_admin());
CREATE POLICY "reviews_admin_write"       ON public.reviews FOR ALL USING (public.is_admin());
CREATE POLICY "shipping_companies_read"   ON public.shipping_companies FOR SELECT USING (TRUE);
CREATE POLICY "shipping_companies_admin"  ON public.shipping_companies FOR ALL USING (public.is_admin());
CREATE POLICY "shipping_rates_read"       ON public.shipping_rates FOR SELECT USING (TRUE);
CREATE POLICY "shipping_rates_admin"      ON public.shipping_rates FOR ALL USING (public.is_admin());
CREATE POLICY "pages_public_read"         ON public.pages FOR SELECT USING (is_active = TRUE OR public.is_admin());
CREATE POLICY "pages_admin_write"         ON public.pages FOR ALL USING (public.is_admin());
CREATE POLICY "blog_posts_public_read"    ON public.blog_posts FOR SELECT USING (status = 'published' OR public.is_admin());
CREATE POLICY "blog_posts_admin_write"    ON public.blog_posts FOR ALL USING (public.is_admin());
CREATE POLICY "product_questions_read"    ON public.product_questions FOR SELECT USING (status = 'answered' OR public.is_admin());
CREATE POLICY "product_questions_admin"   ON public.product_questions FOR ALL USING (public.is_admin());
CREATE POLICY "product_images_read"       ON public.product_images FOR SELECT USING (TRUE);
CREATE POLICY "product_images_admin"      ON public.product_images FOR ALL USING (public.is_admin());
CREATE POLICY "product_variants_read"     ON public.product_variants FOR SELECT USING (TRUE);
CREATE POLICY "product_variants_admin"    ON public.product_variants FOR ALL USING (public.is_admin());
CREATE POLICY "tags_read"                 ON public.tags FOR SELECT USING (TRUE);
CREATE POLICY "tags_admin"                ON public.tags FOR ALL USING (public.is_admin());
CREATE POLICY "product_tags_read"         ON public.product_tags FOR SELECT USING (TRUE);
CREATE POLICY "product_tags_admin"        ON public.product_tags FOR ALL USING (public.is_admin());
CREATE POLICY "product_attributes_read"   ON public.product_attributes FOR SELECT USING (TRUE);
CREATE POLICY "product_attributes_admin"  ON public.product_attributes FOR ALL USING (public.is_admin());
CREATE POLICY "product_attribute_values_read"  ON public.product_attribute_values FOR SELECT USING (TRUE);
CREATE POLICY "product_attribute_values_admin" ON public.product_attribute_values FOR ALL USING (public.is_admin());
CREATE POLICY "seo_metadata_admin"        ON public.seo_metadata FOR ALL USING (public.is_admin());
CREATE POLICY "coupon_usages_admin"       ON public.coupon_usages FOR ALL USING (public.is_admin());
CREATE POLICY "order_items_admin"         ON public.order_items FOR ALL USING (public.is_admin());
CREATE POLICY "order_addresses_admin"     ON public.order_addresses FOR ALL USING (public.is_admin());
CREATE POLICY "order_status_history_admin" ON public.order_status_history FOR ALL USING (public.is_admin());
CREATE POLICY "return_requests_admin"     ON public.return_requests FOR ALL USING (public.is_admin());
CREATE POLICY "inventory_movements_admin" ON public.inventory_movements FOR ALL USING (public.is_admin());

-- ============================================================
-- SEED DATA — Roles & Permissions
-- ============================================================
INSERT INTO public.roles (name, label, description, is_system) VALUES
  ('super_admin',     'Super Admin',       'Tüm yetkiler', TRUE),
  ('admin',           'Admin',             'Genel yönetim', TRUE),
  ('store_manager',   'Mağaza Yöneticisi', 'Mağaza yönetimi', TRUE),
  ('product_manager', 'Ürün Yöneticisi',   'Ürün yönetimi', TRUE),
  ('order_manager',   'Sipariş Yöneticisi','Sipariş yönetimi', TRUE),
  ('warehouse_staff', 'Depo Personeli',    'Stok işlemleri', TRUE),
  ('customer_service','Müşteri Hizmetleri','Müşteri işlemleri', TRUE),
  ('marketing',       'Pazarlama Uzmanı',  'Kampanya ve içerik', TRUE),
  ('accountant',      'Muhasebe',          'Finansal raporlar', TRUE),
  ('viewer',          'Görüntüleyici',     'Sadece okuma', TRUE)
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.permissions (module, action, label) VALUES
  ('products','view','Ürünleri Görüntüle'),('products','create','Ürün Oluştur'),('products','edit','Ürün Düzenle'),('products','delete','Ürün Sil'),('products','export','Ürün Dışa Aktar'),('products','import','Ürün İçe Aktar'),
  ('orders','view','Siparişleri Görüntüle'),('orders','edit','Sipariş Düzenle'),('orders','cancel','Sipariş İptal'),('orders','refund','İade İşlemi'),
  ('customers','view','Müşterileri Görüntüle'),('customers','edit','Müşteri Düzenle'),('customers','delete','Müşteri Sil'),('customers','export','Müşteri Dışa Aktar'),
  ('inventory','view','Stok Görüntüle'),('inventory','edit','Stok Düzenle'),
  ('campaigns','view','Kampanya Görüntüle'),('campaigns','create','Kampanya Oluştur'),('campaigns','edit','Kampanya Düzenle'),('campaigns','delete','Kampanya Sil'),
  ('settings','view','Ayarları Görüntüle'),('settings','edit','Ayarları Düzenle'),
  ('reports','view','Raporları Görüntüle'),('reports','finance','Finansal Raporlar'),
  ('users','view','Kullanıcıları Görüntüle'),('users','manage','Kullanıcı Yönet'),
  ('content','view','İçerik Görüntüle'),('content','edit','İçerik Düzenle'),
  ('media','view','Medya Görüntüle'),('media','upload','Medya Yükle'),('media','delete','Medya Sil')
ON CONFLICT (module, action) DO NOTHING;

-- Default warehouse
INSERT INTO public.warehouses (name, is_default, is_active) VALUES ('Ana Depo', TRUE, TRUE) ON CONFLICT DO NOTHING;

-- Default settings
INSERT INTO public.settings (key, value, group_name, label) VALUES
  ('site_name', '"Venti-Ate"', 'general', 'Site Adı'),
  ('site_email', '"info@ventiateprotein.com"', 'general', 'Site E-posta'),
  ('currency', '"TRY"', 'general', 'Para Birimi'),
  ('timezone', '"Europe/Istanbul"', 'general', 'Saat Dilimi'),
  ('free_shipping_threshold', '300', 'shipping', 'Ücretsiz Kargo Limiti'),
  ('standard_shipping_cost', '29.90', 'shipping', 'Standart Kargo Ücreti'),
  ('maintenance_mode', 'false', 'system', 'Bakım Modu')
ON CONFLICT (key) DO NOTHING;
