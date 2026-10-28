-- SePay webhook metadata. Payment state changes remain transaction-controlled by the webhook service.
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS provider TEXT NOT NULL DEFAULT 'LEGACY',
  ADD COLUMN IF NOT EXISTS provider_transaction_id TEXT,
  ADD COLUMN IF NOT EXISTS provider_reference TEXT,
  ADD COLUMN IF NOT EXISTS provider_payload JSONB,
  ADD COLUMN IF NOT EXISTS webhook_received_at TIMESTAMPTZ;

CREATE UNIQUE INDEX IF NOT EXISTS payments_provider_transaction_unique
  ON payments(provider, provider_transaction_id)
  WHERE provider_transaction_id IS NOT NULL;
