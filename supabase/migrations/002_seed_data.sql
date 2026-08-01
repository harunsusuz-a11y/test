-- ============================================================
-- Venti-Ate — Seed Data
-- ============================================================

-- Categories
INSERT INTO public.categories (name, slug, description, is_active, show_in_menu, sort_order) VALUES
  ('Protein Bar', 'protein-bar', 'Fındık bazlı protein barlar', TRUE, TRUE, 1),
  ('Fındık Kreması', 'findik-kremasi', 'Doğal fındık kreması çeşitleri', TRUE, TRUE, 2),
  ('Paketler', 'paketler', 'Özel kombinasyon paketleri', TRUE, TRUE, 3)
ON CONFLICT (slug) DO NOTHING;

-- Brands
INSERT INTO public.brands (name, slug, description, is_active) VALUES
  ('Venti-Ate', 'venti-ate', 'Fındığın rafine hali', TRUE)
ON CONFLICT (slug) DO NOTHING;

-- Warehouses (if not exists)
INSERT INTO public.warehouses (name, is_default, is_active) VALUES
  ('Ana Depo', TRUE, TRUE)
ON CONFLICT DO NOTHING;

-- Shipping company
INSERT INTO public.shipping_companies (name, code, tracking_url, is_active) VALUES
  ('MNG Kargo', 'mng', 'https://www.mngkargo.com.tr/iletisim/kargo-sorgula', TRUE),
  ('Yurtiçi Kargo', 'yurtici', 'https://www.yurticikargo.com/tr/online-islemler/gonderi-sorgula', TRUE),
  ('Aras Kargo', 'aras', 'https://www.araskargo.com.tr/gonderiSorgula.aspx', TRUE)
ON CONFLICT (code) DO NOTHING;

-- Settings (upsert)
INSERT INTO public.settings (key, value, group_name, label) VALUES
  ('site_name', '"Venti-Ate"', 'general', 'Site Adı'),
  ('site_email', '"info@ventiateprotein.com"', 'general', 'E-posta'),
  ('currency', '"TRY"', 'general', 'Para Birimi'),
  ('timezone', '"Europe/Istanbul"', 'general', 'Saat Dilimi'),
  ('free_shipping_threshold', '300', 'shipping', 'Ücretsiz Kargo Limiti'),
  ('standard_shipping_cost', '29.9', 'shipping', 'Standart Kargo'),
  ('express_enabled', 'false', 'shipping', 'Ekspres Kargo'),
  ('express_cost', '59.9', 'shipping', 'Ekspres Ücret'),
  ('notif_new_order', 'true', 'notifications', 'Yeni Sipariş Bildirimi'),
  ('notif_low_stock', 'true', 'notifications', 'Düşük Stok Uyarısı'),
  ('notif_delivered', 'false', 'notifications', 'Teslim Bildirimi'),
  ('maintenance_mode', 'false', 'system', 'Bakım Modu')
ON CONFLICT (key) DO NOTHING;

-- Roles (if not exist from migration 001)
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

-- Permissions
INSERT INTO public.permissions (module, action, label) VALUES
  ('products','view','Ürünleri Görüntüle'),('products','create','Ürün Oluştur'),
  ('products','edit','Ürün Düzenle'),('products','delete','Ürün Sil'),
  ('orders','view','Siparişleri Görüntüle'),('orders','edit','Sipariş Düzenle'),
  ('orders','cancel','Sipariş İptal'),('orders','refund','İade İşlemi'),
  ('customers','view','Müşterileri Görüntüle'),('customers','edit','Müşteri Düzenle'),
  ('inventory','view','Stok Görüntüle'),('inventory','edit','Stok Düzenle'),
  ('campaigns','view','Kampanya Görüntüle'),('campaigns','create','Kampanya Oluştur'),
  ('settings','view','Ayarları Görüntüle'),('settings','edit','Ayarları Düzenle'),
  ('reports','view','Raporları Görüntüle'),('users','manage','Kullanıcı Yönet'),
  ('content','view','İçerik Görüntüle'),('content','edit','İçerik Düzenle'),
  ('media','view','Medya Görüntüle'),('media','upload','Medya Yükle')
ON CONFLICT (module, action) DO NOTHING;

-- Demo coupons
INSERT INTO public.coupons (code, type, value, min_cart, usage_limit, per_user_limit, is_active) VALUES
  ('VENTI10',  'percent', 10, 0,   100, 1, TRUE),
  ('ILK20',    'percent', 20, 150, 50,  1, TRUE),
  ('KARGO',    'free_shipping', 0, 200, 200, 1, TRUE)
ON CONFLICT (code) DO NOTHING;

-- Demo banner
INSERT INTO public.banners (title, description, position, sort_order, is_active, button_text, button_url) VALUES
  ('Yeni Ürünler Geldi', 'Fındık bazlı protein barlarımız rafta yerini aldı', 'hero', 1, TRUE, 'Keşfet', '/magaza'),
  ('İlk Siparişe %10 İndirim', 'VENTI10 kodunu kullan', 'top', 1, TRUE, 'Alışverişe Başla', '/magaza')
ON CONFLICT DO NOTHING;
