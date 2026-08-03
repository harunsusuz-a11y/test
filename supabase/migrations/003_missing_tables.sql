-- ============================================================
-- Venti-Ate — Missing Tables Migration (003)
-- ============================================================

-- security_events
CREATE TABLE IF NOT EXISTS public.security_events (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID REFERENCES auth.users(id),
  event_type    TEXT NOT NULL, -- login_attempt, password_change, suspicious_ip, etc.
  severity      TEXT DEFAULT 'info' CHECK (severity IN ('info','warning','critical')),
  ip_address    TEXT,
  user_agent    TEXT,
  details       JSONB DEFAULT '{}',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_security_events_user ON public.security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_type ON public.security_events(event_type);

-- product_variant_values (varyant-özellik eşleştirmesi)
CREATE TABLE IF NOT EXISTS public.product_variant_values (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  variant_id    UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
  attribute_id  UUID NOT NULL REFERENCES public.product_attributes(id),
  value         TEXT NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_pvv_variant ON public.product_variant_values(variant_id);

-- supplier_products
CREATE TABLE IF NOT EXISTS public.supplier_products (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_id     UUID NOT NULL REFERENCES public.suppliers(id) ON DELETE CASCADE,
  product_id      UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  supplier_sku    TEXT,
  cost_price      NUMERIC(10,2),
  min_order_qty   INTEGER DEFAULT 1,
  lead_time_days  INTEGER,
  is_preferred    BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(supplier_id, product_id)
);

-- customer_notes
CREATE TABLE IF NOT EXISTS public.customer_notes (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  note        TEXT NOT NULL,
  created_by  UUID REFERENCES auth.users(id),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_customer_notes_customer ON public.customer_notes(customer_id);

-- customer_groups
CREATE TABLE IF NOT EXISTS public.customer_groups (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL UNIQUE,
  description TEXT,
  discount    NUMERIC(5,2) DEFAULT 0,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES public.customer_groups(id);
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS loyalty_points INTEGER DEFAULT 0;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN DEFAULT FALSE;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS birth_date DATE;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS total_spent NUMERIC(12,2) DEFAULT 0;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS total_orders INTEGER DEFAULT 0;

-- order_notes
CREATE TABLE IF NOT EXISTS public.order_notes (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id   UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  note       TEXT NOT NULL,
  is_private BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_order_notes_order ON public.order_notes(order_id);

-- payment_transactions
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id       UUID REFERENCES public.payments(id),
  order_id         UUID REFERENCES public.orders(id),
  transaction_id   TEXT,
  provider         TEXT NOT NULL, -- paytr, iyzico, stripe, etc.
  amount           NUMERIC(10,2) NOT NULL,
  currency         TEXT DEFAULT 'TRY',
  status           TEXT DEFAULT 'pending' CHECK (status IN ('pending','success','failed','refunded')),
  type             TEXT DEFAULT 'charge' CHECK (type IN ('charge','refund','partial_refund')),
  raw_response     JSONB,
  error_code       TEXT,
  error_message    TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_payment_tx_order ON public.payment_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_tx_status ON public.payment_transactions(status);

-- return_items
CREATE TABLE IF NOT EXISTS public.return_items (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  return_request_id UUID NOT NULL REFERENCES public.return_requests(id) ON DELETE CASCADE,
  order_item_id    UUID REFERENCES public.order_items(id),
  product_id       UUID REFERENCES public.products(id),
  quantity         INTEGER NOT NULL DEFAULT 1,
  reason           TEXT,
  condition        TEXT CHECK (condition IN ('new','good','damaged','unusable')),
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- exchange_requests
CREATE TABLE IF NOT EXISTS public.exchange_requests (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id          UUID NOT NULL REFERENCES public.orders(id),
  customer_id       UUID REFERENCES public.customers(id),
  original_item_id  UUID REFERENCES public.order_items(id),
  new_product_id    UUID REFERENCES public.products(id),
  new_variant_id    UUID REFERENCES public.product_variants(id),
  quantity          INTEGER DEFAULT 1,
  reason            TEXT,
  status            TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','completed')),
  admin_note        TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- shipments
CREATE TABLE IF NOT EXISTS public.shipments (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id            UUID NOT NULL REFERENCES public.orders(id),
  shipping_company_id UUID REFERENCES public.shipping_companies(id),
  tracking_number     TEXT,
  tracking_url        TEXT,
  status              TEXT DEFAULT 'pending' CHECK (status IN ('pending','picked_up','in_transit','out_for_delivery','delivered','failed','returned')),
  shipped_at          TIMESTAMPTZ,
  delivered_at        TIMESTAMPTZ,
  estimated_delivery  TIMESTAMPTZ,
  weight              NUMERIC(8,2),
  notes               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_shipments_order ON public.shipments(order_id);
CREATE INDEX IF NOT EXISTS idx_shipments_tracking ON public.shipments(tracking_number);

-- shipping_zones
CREATE TABLE IF NOT EXISTS public.shipping_zones (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  countries   TEXT[] DEFAULT '{"TR"}',
  cities      TEXT[] DEFAULT '{}',
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.shipping_rates ADD COLUMN IF NOT EXISTS zone_id UUID REFERENCES public.shipping_zones(id);

-- campaign_rules
CREATE TABLE IF NOT EXISTS public.campaign_rules (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id   UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  rule_type     TEXT NOT NULL CHECK (rule_type IN ('min_cart','max_cart','product','category','brand','customer_group','first_order','quantity')),
  operator      TEXT DEFAULT 'gte' CHECK (operator IN ('eq','gte','lte','in','not_in')),
  value         TEXT NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_campaign_rules_campaign ON public.campaign_rules(campaign_id);

-- wishlists
CREATE TABLE IF NOT EXISTS public.wishlists (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT DEFAULT 'Favorilerim',
  is_public   BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- wishlist_items
CREATE TABLE IF NOT EXISTS public.wishlist_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wishlist_id UUID NOT NULL REFERENCES public.wishlists(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id  UUID REFERENCES public.product_variants(id),
  added_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(wishlist_id, product_id)
);

-- carts
CREATE TABLE IF NOT EXISTS public.carts (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id  TEXT,
  coupon_code TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_carts_user ON public.carts(user_id);

-- cart_items
CREATE TABLE IF NOT EXISTS public.cart_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cart_id     UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
  product_id  UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id  UUID REFERENCES public.product_variants(id),
  quantity    INTEGER NOT NULL DEFAULT 1,
  added_at    TIMESTAMPTZ DEFAULT NOW()
);

-- abandoned_carts
CREATE TABLE IF NOT EXISTS public.abandoned_carts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cart_id         UUID REFERENCES public.carts(id),
  user_id         UUID REFERENCES auth.users(id),
  email           TEXT,
  cart_value      NUMERIC(10,2),
  item_count      INTEGER,
  reminder_sent   BOOLEAN DEFAULT FALSE,
  reminder_sent_at TIMESTAMPTZ,
  recovered       BOOLEAN DEFAULT FALSE,
  recovered_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- blog_categories
CREATE TABLE IF NOT EXISTS public.blog_categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active   BOOLEAN DEFAULT TRUE,
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.blog_categories(id);
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS reading_time INTEGER;
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

-- blog_tags
CREATE TABLE IF NOT EXISTS public.blog_tags (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL UNIQUE,
  slug       TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.blog_post_tags (
  post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  tag_id  UUID NOT NULL REFERENCES public.blog_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- menus
CREATE TABLE IF NOT EXISTS public.menus (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL,
  location   TEXT NOT NULL UNIQUE, -- header, footer, mobile, etc.
  is_active  BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- menu_items
CREATE TABLE IF NOT EXISTS public.menu_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  menu_id     UUID NOT NULL REFERENCES public.menus(id) ON DELETE CASCADE,
  parent_id   UUID REFERENCES public.menu_items(id) ON DELETE CASCADE,
  label       TEXT NOT NULL,
  url         TEXT,
  target      TEXT DEFAULT '_self',
  icon        TEXT,
  sort_order  INTEGER DEFAULT 0,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_menu_items_menu ON public.menu_items(menu_id);

-- notification_templates
CREATE TABLE IF NOT EXISTS public.notification_templates (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event       TEXT NOT NULL UNIQUE, -- order_placed, order_shipped, etc.
  name        TEXT NOT NULL,
  subject     TEXT,
  body_html   TEXT,
  body_text   TEXT,
  variables   TEXT[] DEFAULT '{}',
  channels    TEXT[] DEFAULT '{"email"}',
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- email_templates
CREATE TABLE IF NOT EXISTS public.email_templates (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL UNIQUE,
  subject     TEXT NOT NULL,
  body_html   TEXT NOT NULL,
  body_text   TEXT,
  variables   TEXT[] DEFAULT '{}',
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- sms_templates
CREATE TABLE IF NOT EXISTS public.sms_templates (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL UNIQUE,
  body        TEXT NOT NULL,
  variables   TEXT[] DEFAULT '{}',
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- integrations
CREATE TABLE IF NOT EXISTS public.integrations (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL UNIQUE,
  provider    TEXT NOT NULL,
  type        TEXT NOT NULL, -- payment, shipping, email, sms, analytics, erp, marketplace
  config      JSONB DEFAULT '{}', -- encrypted keys burada tutulmaz
  is_active   BOOLEAN DEFAULT FALSE,
  last_sync   TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- webhooks
CREATE TABLE IF NOT EXISTS public.webhooks (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  url         TEXT NOT NULL,
  events      TEXT[] NOT NULL,
  secret      TEXT, -- HMAC secret
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- webhook_logs
CREATE TABLE IF NOT EXISTS public.webhook_logs (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  webhook_id   UUID REFERENCES public.webhooks(id) ON DELETE CASCADE,
  event        TEXT NOT NULL,
  payload      JSONB,
  response_status INTEGER,
  response_body TEXT,
  duration_ms  INTEGER,
  success      BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_webhook ON public.webhook_logs(webhook_id);

-- api_keys
CREATE TABLE IF NOT EXISTS public.api_keys (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  key_hash    TEXT NOT NULL UNIQUE, -- sadece hash saklanır
  key_prefix  TEXT NOT NULL, -- ilk 8 karakter gösterim için
  user_id     UUID REFERENCES auth.users(id),
  permissions TEXT[] DEFAULT '{"read"}',
  last_used   TIMESTAMPTZ,
  expires_at  TIMESTAMPTZ,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- api_logs
CREATE TABLE IF NOT EXISTS public.api_logs (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  api_key_id   UUID REFERENCES public.api_keys(id),
  method       TEXT NOT NULL,
  path         TEXT NOT NULL,
  status_code  INTEGER,
  duration_ms  INTEGER,
  ip_address   TEXT,
  user_agent   TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_api_logs_key ON public.api_logs(api_key_id);
CREATE INDEX IF NOT EXISTS idx_api_logs_created ON public.api_logs(created_at);

-- financial_transactions
CREATE TABLE IF NOT EXISTS public.financial_transactions (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type             TEXT NOT NULL CHECK (type IN ('sale','refund','commission','shipping','tax','discount','adjustment')),
  amount           NUMERIC(12,2) NOT NULL,
  currency         TEXT DEFAULT 'TRY',
  order_id         UUID REFERENCES public.orders(id),
  invoice_id       UUID REFERENCES public.invoices(id),
  description      TEXT,
  reference        TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_fin_tx_order ON public.financial_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_fin_tx_type ON public.financial_transactions(type);

-- search_history
CREATE TABLE IF NOT EXISTS public.search_history (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  query        TEXT NOT NULL,
  results_count INTEGER DEFAULT 0,
  user_id      UUID REFERENCES auth.users(id),
  session_id   TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_search_query ON public.search_history(query);

-- ============================================================
-- AUDIT LOG TRIGGERS
-- ============================================================
CREATE OR REPLACE FUNCTION public.audit_log_trigger()
RETURNS TRIGGER AS $$
DECLARE
  old_data JSONB := NULL;
  new_data JSONB := NULL;
BEGIN
  IF TG_OP = 'DELETE' THEN
    old_data := to_jsonb(OLD);
  ELSIF TG_OP = 'UPDATE' THEN
    old_data := to_jsonb(OLD);
    new_data := to_jsonb(NEW);
  ELSE
    new_data := to_jsonb(NEW);
  END IF;

  INSERT INTO public.admin_activity_logs (
    actor_user_id, action, entity_type, entity_id,
    old_values, new_values, created_at
  ) VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME,
    COALESCE((new_data->>'id')::uuid, (old_data->>'id')::uuid),
    old_data,
    new_data,
    NOW()
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Audit trigger'ları kritik tablolara bağla
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_products') THEN
    CREATE TRIGGER audit_products AFTER INSERT OR UPDATE OR DELETE ON public.products FOR EACH ROW EXECUTE FUNCTION public.audit_log_trigger();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_orders') THEN
    CREATE TRIGGER audit_orders AFTER INSERT OR UPDATE OR DELETE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.audit_log_trigger();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_inventory') THEN
    CREATE TRIGGER audit_inventory AFTER INSERT OR UPDATE OR DELETE ON public.inventory FOR EACH ROW EXECUTE FUNCTION public.audit_log_trigger();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_coupons') THEN
    CREATE TRIGGER audit_coupons AFTER INSERT OR UPDATE OR DELETE ON public.coupons FOR EACH ROW EXECUTE FUNCTION public.audit_log_trigger();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_settings') THEN
    CREATE TRIGGER audit_settings AFTER INSERT OR UPDATE OR DELETE ON public.settings FOR EACH ROW EXECUTE FUNCTION public.audit_log_trigger();
  END IF;
END $$;

-- ============================================================
-- LOGIN LOG TRIGGER (profile update on login)
-- ============================================================
CREATE OR REPLACE FUNCTION public.log_user_login()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.last_sign_in_at IS DISTINCT FROM OLD.last_sign_in_at AND NEW.last_sign_in_at IS NOT NULL THEN
    INSERT INTO public.user_login_logs (user_id, email, user_type, login_at, login_status)
    SELECT NEW.id, NEW.email, COALESCE(p.user_type,'customer'), NOW(), 'success'
    FROM public.profiles p WHERE p.id = NEW.id;
    
    UPDATE public.profiles SET last_login_at = NOW() WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_login ON auth.users;
CREATE TRIGGER on_auth_user_login
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.log_user_login();

-- ============================================================
-- RLS POLICIES — YENİ TABLOLAR
-- ============================================================
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_security_events" ON public.security_events
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_type IN ('admin','super_admin')));

ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_wishlists" ON public.wishlists FOR ALL USING (user_id = auth.uid());

ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_wishlist_items" ON public.wishlist_items
  FOR ALL USING (wishlist_id IN (SELECT id FROM public.wishlists WHERE user_id = auth.uid()));

ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_carts" ON public.carts FOR ALL USING (user_id = auth.uid() OR user_id IS NULL);

ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_cart_items" ON public.cart_items
  FOR ALL USING (cart_id IN (SELECT id FROM public.carts WHERE user_id = auth.uid()));

ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_notif_templates" ON public.notification_templates
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_type IN ('admin','super_admin')));

ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_email_templates" ON public.email_templates
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_type IN ('admin','super_admin')));

ALTER TABLE public.sms_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_sms_templates" ON public.sms_templates
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_type IN ('admin','super_admin')));

ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_integrations" ON public.integrations
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_type IN ('admin','super_admin')));

ALTER TABLE public.webhooks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_webhooks" ON public.webhooks
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_type IN ('admin','super_admin')));

ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_api_keys" ON public.api_keys
  FOR ALL USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_type = 'super_admin'));

ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_financial" ON public.financial_transactions
  FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_type IN ('admin','super_admin')));

ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_search_history" ON public.search_history
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND user_type IN ('admin','super_admin')));

-- seed notification templates
INSERT INTO public.notification_templates (event, name, subject, body_html, variables, channels) VALUES
('order_placed',   'Sipariş Alındı',         'Siparişiniz Alındı — {{order_number}}',
 '<p>Merhaba {{customer_name}},</p><p>{{order_number}} numaralı siparişiniz alındı. Toplam: {{order_total}}</p>',
 ARRAY['customer_name','order_number','order_total'], ARRAY['email']),
('order_shipped',  'Sipariş Kargoya Verildi','Siparişiniz Kargoya Verildi — {{order_number}}',
 '<p>Merhaba {{customer_name}},</p><p>Siparişiniz kargoya verildi. Takip: {{tracking_number}}</p>',
 ARRAY['customer_name','order_number','tracking_number'], ARRAY['email']),
('order_delivered','Sipariş Teslim Edildi',  'Siparişiniz Teslim Edildi',
 '<p>Merhaba {{customer_name}},</p><p>Siparişiniz teslim edildi. İyi günler!</p>',
 ARRAY['customer_name','order_number'], ARRAY['email']),
('order_cancelled','Sipariş İptal Edildi',   'Sipariş İptali — {{order_number}}',
 '<p>Merhaba {{customer_name}},</p><p>{{order_number}} numaralı siparişiniz iptal edildi.</p>',
 ARRAY['customer_name','order_number'], ARRAY['email']),
('welcome',        'Hoş Geldiniz',           'Venti Kulübüne Hoş Geldiniz!',
 '<p>Merhaba {{customer_name}},</p><p>Venti-Ate ailesine hoş geldiniz!</p>',
 ARRAY['customer_name'], ARRAY['email']),
('password_reset', 'Şifre Sıfırlama',        'Şifre Sıfırlama Talebi',
 '<p>Şifrenizi sıfırlamak için: <a href="{{reset_link}}">tıklayın</a></p>',
 ARRAY['reset_link','customer_name'], ARRAY['email'])
ON CONFLICT (event) DO NOTHING;

-- seed shipping zones
INSERT INTO public.shipping_zones (name, countries) VALUES
('Türkiye', ARRAY['TR']),
('Avrupa', ARRAY['DE','FR','NL','BE','AT','CH']),
('Dünya', ARRAY['*'])
ON CONFLICT DO NOTHING;

-- seed menus
INSERT INTO public.menus (name, location) VALUES
('Ana Menü', 'header'),
('Footer Menü', 'footer'),
('Mobil Menü', 'mobile')
ON CONFLICT (location) DO NOTHING;

-- seed customer groups
INSERT INTO public.customer_groups (name, description, discount) VALUES
('Standart', 'Normal müşteriler', 0),
('VIP', 'Yüksek harcamalı müşteriler', 5),
('Toplu Alıcı', 'B2B müşteriler', 10)
ON CONFLICT (name) DO NOTHING;
