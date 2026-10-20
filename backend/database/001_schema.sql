-- TV1: Schema đủ chạy menu. Chạy bằng npm run db:migrate, KHÔNG xóa DB có sẵn.
CREATE TABLE IF NOT EXISTS products (
 id TEXT PRIMARY KEY, name TEXT NOT NULL, category TEXT NOT NULL,
 price INTEGER NOT NULL CHECK (price >= 0), description TEXT NOT NULL DEFAULT '',
 badge TEXT NOT NULL DEFAULT '', image_url TEXT,
 stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0), version INTEGER NOT NULL DEFAULT 0,
 sizes JSONB NOT NULL DEFAULT '[]', toppings JSONB NOT NULL DEFAULT '[]',
 position INTEGER NOT NULL DEFAULT 0
);

-- Schema chung cho 6 thành viên. Không DROP database/bảng; tương thích bảng products cũ.
CREATE TABLE IF NOT EXISTS users (
 id TEXT PRIMARY KEY,
 email TEXT NOT NULL CHECK (email = btrim(email) AND position('@' IN email) > 1),
 password_hash TEXT NOT NULL CHECK (password_hash ~ '^\$2[aby]\$[0-9]{2}\$[./A-Za-z0-9]{53}$'),
 display_name TEXT NOT NULL CHECK (length(btrim(display_name)) > 0),
 loyalty_points INTEGER NOT NULL DEFAULT 0 CHECK (loyalty_points >= 0),
 created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_unique ON users (lower(email));
CREATE TABLE IF NOT EXISTS promotions (
 id TEXT PRIMARY KEY, code TEXT NOT NULL UNIQUE CHECK (code = upper(btrim(code)) AND length(code) > 0),
 type TEXT NOT NULL CHECK (type IN ('PERCENT','FIXED')),
 value INTEGER NOT NULL CHECK (value > 0 AND (type <> 'PERCENT' OR value <= 100)),
 minimum_amount INTEGER NOT NULL DEFAULT 0 CHECK (minimum_amount >= 0),
 active BOOLEAN NOT NULL DEFAULT true,
 starts_at TIMESTAMPTZ NOT NULL, ends_at TIMESTAMPTZ NOT NULL CHECK (ends_at > starts_at)
);
CREATE TABLE IF NOT EXISTS orders (
 id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
 status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','PAYMENT_FAILED','PAID','PREPARING','READY','COMPLETED','CANCELLED')),
 subtotal INTEGER NOT NULL CHECK (subtotal >= 0),
 discount INTEGER NOT NULL DEFAULT 0 CHECK (discount >= 0 AND discount <= subtotal),
 total INTEGER NOT NULL CHECK (total >= 0 AND total = subtotal - discount),
 promotion_id TEXT REFERENCES promotions(id) ON DELETE RESTRICT,
 stock_released BOOLEAN NOT NULL DEFAULT false,
 created_txid BIGINT NOT NULL DEFAULT txid_current(), -- chỉ thêm chi tiết trong transaction tạo đơn
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '15 minutes'),
 CHECK (expires_at > created_at), CHECK (promotion_id IS NOT NULL OR discount = 0)
);
CREATE TABLE IF NOT EXISTS order_items (
 id TEXT PRIMARY KEY, order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
 product_id TEXT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
 product_name TEXT NOT NULL, size TEXT NOT NULL CHECK (size IN ('S','M','L')),
 topping_ids JSONB NOT NULL DEFAULT '[]' CHECK (jsonb_typeof(topping_ids) = 'array'),
 quantity INTEGER NOT NULL CHECK (quantity BETWEEN 1 AND 99),
 unit_price INTEGER NOT NULL CHECK (unit_price >= 0),
 line_total INTEGER NOT NULL CHECK (line_total >= 0 AND line_total::bigint = unit_price::bigint * quantity)
);
CREATE TABLE IF NOT EXISTS payments (
 id TEXT PRIMARY KEY, order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
 idempotency_key TEXT NOT NULL UNIQUE CHECK (length(btrim(idempotency_key)) > 0),
 payload_hash TEXT NOT NULL CHECK (payload_hash ~ '^[0-9a-f]{64}$'),
 amount INTEGER NOT NULL CHECK (amount >= 0),
 method TEXT NOT NULL CHECK (method IN ('WALLET','CARD')),
 status TEXT NOT NULL DEFAULT 'PROCESSING' CHECK (status IN ('PROCESSING','SUCCEEDED','FAILED')),
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(), resolved_at TIMESTAMPTZ,
 CHECK (resolved_at IS NULL OR resolved_at >= created_at),
 CHECK ((status = 'PROCESSING' AND resolved_at IS NULL) OR (status <> 'PROCESSING' AND resolved_at IS NOT NULL))
);
-- Một đơn chỉ có tối đa một attempt đang xử lý HOẶC thành công.
CREATE UNIQUE INDEX IF NOT EXISTS payments_one_live_attempt ON payments(order_id)
 WHERE status IN ('PROCESSING','SUCCEEDED');
CREATE TABLE IF NOT EXISTS loyalty_transactions (
 id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
 order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
 type TEXT NOT NULL DEFAULT 'EARN' CHECK (type = 'EARN'),
 points INTEGER NOT NULL CHECK (points >= 0), created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
 UNIQUE(order_id, type)
);
CREATE INDEX IF NOT EXISTS orders_user_history ON orders(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS orders_expiry ON orders(expires_at) WHERE status = 'PENDING';
CREATE INDEX IF NOT EXISTS order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS payments_order_history ON payments(order_id, created_at DESC);

CREATE TABLE IF NOT EXISTS seed_history (name TEXT PRIMARY KEY, seeded_at TIMESTAMPTZ NOT NULL DEFAULT now());
