-- CreateEnum
CREATE TYPE "session_status" AS ENUM ('ACTIVE', 'REVOKED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "token_family_status" AS ENUM ('ACTIVE', 'REVOKED');

-- CreateEnum
CREATE TYPE "refresh_token_status" AS ENUM ('ACTIVE', 'ROTATED', 'REVOKED', 'EXPIRED');

-- AlterTable
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "auth_version" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN IF NOT EXISTS "failed_login_attempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "last_unlock_otp_sent_at" TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS "locked_until" TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS "password_changed_at" TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS "unlock_otp_attempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "unlock_otp_expires_at" TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS "unlock_otp_hash" VARCHAR(64);

-- CreateTable
CREATE TABLE IF NOT EXISTS "user_sessions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organization_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "status" "session_status" NOT NULL DEFAULT 'ACTIVE',
    "device_id" VARCHAR(128),
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "revoked_at" TIMESTAMPTZ,

    CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "token_families" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "session_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "status" "token_family_status" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" TIMESTAMPTZ,

    CONSTRAINT "token_families_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "refresh_tokens" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "session_id" UUID NOT NULL,
    "token_family_id" UUID NOT NULL,
    "token_hash" VARCHAR(64) NOT NULL,
    "sequence_number" INTEGER NOT NULL CHECK ("sequence_number" > 0),
    "status" "refresh_token_status" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "rotated_at" TIMESTAMPTZ,
    "replaced_by_token_id" UUID,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "auth_idempotency_records" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "idempotency_key" VARCHAR(128) NOT NULL,
    "session_id" UUID NOT NULL,
    "token_family_id" UUID NOT NULL,
    "request_token_hash" VARCHAR(64) NOT NULL,
    "endpoint" VARCHAR(255) NOT NULL,
    "response_status_code" INTEGER NOT NULL,
    "response_headers" JSONB NOT NULL,
    "encrypted_envelope" BYTEA NOT NULL,
    "key_id" VARCHAR(64) NOT NULL,
    "nonce" BYTEA NOT NULL,
    "auth_tag" BYTEA NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "auth_idempotency_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndexes
CREATE INDEX IF NOT EXISTS "idx_user_sessions_user_status" ON "user_sessions"("user_id", "status");
CREATE INDEX IF NOT EXISTS "idx_user_sessions_org" ON "user_sessions"("organization_id");
CREATE INDEX IF NOT EXISTS "idx_user_sessions_expires_at" ON "user_sessions"("expires_at");

CREATE UNIQUE INDEX IF NOT EXISTS "token_families_session_id_key" ON "token_families"("session_id");

CREATE UNIQUE INDEX IF NOT EXISTS "refresh_tokens_token_hash_key" ON "refresh_tokens"("token_hash");
CREATE UNIQUE INDEX IF NOT EXISTS "refresh_tokens_replaced_by_token_id_key" ON "refresh_tokens"("replaced_by_token_id");
CREATE INDEX IF NOT EXISTS "idx_refresh_tokens_family_status" ON "refresh_tokens"("token_family_id", "status");
CREATE INDEX IF NOT EXISTS "idx_refresh_tokens_session" ON "refresh_tokens"("session_id");
CREATE INDEX IF NOT EXISTS "idx_refresh_tokens_hash" ON "refresh_tokens"("token_hash");
CREATE UNIQUE INDEX IF NOT EXISTS "refresh_tokens_token_family_id_sequence_number_key" ON "refresh_tokens"("token_family_id", "sequence_number");

CREATE INDEX IF NOT EXISTS "idx_auth_idempotency_expires_at" ON "auth_idempotency_records"("expires_at");
CREATE UNIQUE INDEX IF NOT EXISTS "auth_idempotency_records_session_id_idempotency_key_key" ON "auth_idempotency_records"("session_id", "idempotency_key");

-- AddForeignKeys
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_sessions_user_id_fkey') THEN
        ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_sessions_organization_id_fkey') THEN
        ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'token_families_session_id_fkey') THEN
        ALTER TABLE "token_families" ADD CONSTRAINT "token_families_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "user_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'token_families_user_id_fkey') THEN
        ALTER TABLE "token_families" ADD CONSTRAINT "token_families_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'refresh_tokens_session_id_fkey') THEN
        ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "user_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'refresh_tokens_token_family_id_fkey') THEN
        ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_token_family_id_fkey" FOREIGN KEY ("token_family_id") REFERENCES "token_families"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'auth_idempotency_records_session_id_fkey') THEN
        ALTER TABLE "auth_idempotency_records" ADD CONSTRAINT "auth_idempotency_records_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "user_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'auth_idempotency_records_token_family_id_fkey') THEN
        ALTER TABLE "auth_idempotency_records" ADD CONSTRAINT "auth_idempotency_records_token_family_id_fkey" FOREIGN KEY ("token_family_id") REFERENCES "token_families"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- Defense-in-Depth Trigger for Monotonic Token Family Rotation (Anti-Cycle)
CREATE OR REPLACE FUNCTION trg_check_refresh_token_monotonic_seq()
RETURNS TRIGGER AS $$
DECLARE
  v_target_seq INT;
BEGIN
  IF NEW.replaced_by_token_id IS NOT NULL THEN
    SELECT sequence_number INTO v_target_seq
    FROM refresh_tokens
    WHERE id = NEW.replaced_by_token_id AND token_family_id = NEW.token_family_id;

    IF v_target_seq IS NULL OR v_target_seq <= NEW.sequence_number THEN
      RAISE EXCEPTION 'ANTI_CYCLE_VIOLATION: Token thay the co seq (%) phai lon hon token hien tai (%)',
        v_target_seq, NEW.sequence_number;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_refresh_tokens_monotonic_seq ON refresh_tokens;
CREATE TRIGGER trg_refresh_tokens_monotonic_seq
BEFORE UPDATE OF replaced_by_token_id ON refresh_tokens
FOR EACH ROW
EXECUTE FUNCTION trg_check_refresh_token_monotonic_seq();

-- Enable Row Level Security (RLS) on user_sessions
ALTER TABLE "user_sessions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "user_sessions" FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS p_user_sessions_tenant_isolation ON "user_sessions";
CREATE POLICY p_user_sessions_tenant_isolation ON "user_sessions"
FOR ALL
USING (
    organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::UUID
)
WITH CHECK (
    organization_id = NULLIF(current_setting('app.current_organization_id', true), '')::UUID
);
