CREATE TABLE IF NOT EXISTS email_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  code VARCHAR(6) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  used_at TIMESTAMPTZ,
  purpose VARCHAR(32) NOT NULL DEFAULT 'signup'
);

CREATE INDEX IF NOT EXISTS email_verifications_email_created_at_idx
  ON email_verifications (email, created_at DESC);
