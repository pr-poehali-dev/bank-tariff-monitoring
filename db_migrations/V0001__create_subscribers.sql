CREATE TABLE t_p35015978_bank_tariff_monitori.subscribers (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  products TEXT[] NOT NULL DEFAULT '{}',
  confirmed BOOLEAN NOT NULL DEFAULT FALSE,
  confirm_token TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);