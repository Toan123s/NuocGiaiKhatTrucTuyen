-- TV3: quên mật khẩu. Chỉ lưu mã băm SHA-256 của token (token gốc chỉ nằm trong email gửi cho người dùng).
-- Token dùng một lần (used_at) và có hạn (expires_at). Xóa tài khoản thì xóa luôn token của tài khoản đó.
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE CHECK (token_hash ~ '^[0-9a-f]{64}$'),
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Phục vụ giới hạn số yêu cầu theo tài khoản và dọn token cũ.
CREATE INDEX IF NOT EXISTS password_reset_tokens_user_created
  ON password_reset_tokens (user_id, created_at DESC);
