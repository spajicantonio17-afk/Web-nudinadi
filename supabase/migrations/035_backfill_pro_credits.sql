-- Backfill: PRO und Business User die 0 promoted_credits haben bekommen ihre Credits sofort.
-- Grund: Der Stripe-Webhook setzt promoted_credits beim Plan-Kauf, aber bestehende User
-- (vor Webhook-Code, manuell auf PRO gesetzte Test-Accounts) haben 0.

UPDATE profiles
SET promoted_credits = 3
WHERE account_type = 'pro' AND promoted_credits = 0;

UPDATE profiles
SET promoted_credits = 10
WHERE account_type = 'business' AND promoted_credits = 0;
