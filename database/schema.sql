-- Oweru General Assistant — Database Schema (general mode only)
-- Postgres 14+

CREATE TABLE IF NOT EXISTS properties (
    id              SERIAL PRIMARY KEY,
    reference_code  VARCHAR(32) UNIQUE NOT NULL,
    title           VARCHAR(200) NOT NULL,
    property_type   VARCHAR(50) NOT NULL,
    listing_type    VARCHAR(20) NOT NULL CHECK (listing_type IN ('sale', 'rent')),
    region          VARCHAR(100) NOT NULL,
    neighborhood    VARCHAR(100),
    status          VARCHAR(20) NOT NULL DEFAULT 'available'
                      CHECK (status IN ('available', 'reserved', 'sold', 'rented', 'off_market')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Note: this is a minimal properties table — just enough for
-- list_service_areas to report which regions have listings. Detailed
-- property search/fields live in the full assistant's database, not here.

CREATE TABLE IF NOT EXISTS conversations (
    id              SERIAL PRIMARY KEY,
    session_id      VARCHAR(100) NOT NULL,
    channel         VARCHAR(20) NOT NULL DEFAULT 'web_widget',
    started_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    ended_at        TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_conversations_session ON conversations (session_id);

CREATE TABLE IF NOT EXISTS messages (
    id              SERIAL PRIMARY KEY,
    conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role            VARCHAR(10) NOT NULL CHECK (role IN ('user', 'agent')),
    content         TEXT NOT NULL,
    feedback        VARCHAR(10) CHECK (feedback IN ('up', 'down')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages (conversation_id, created_at);

CREATE TABLE IF NOT EXISTS faq_entries (
    id                    SERIAL PRIMARY KEY,
    normalized_question   TEXT UNIQUE NOT NULL,
    sample_question       TEXT NOT NULL,
    ask_count             INTEGER NOT NULL DEFAULT 1,
    first_asked_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_asked_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_faq_entries_count ON faq_entries (ask_count DESC);

CREATE TABLE IF NOT EXISTS company_info (
    id              SERIAL PRIMARY KEY,
    about_text      TEXT NOT NULL,
    services        TEXT[] NOT NULL DEFAULT '{}',
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_company_info_updated_at ON company_info;
CREATE TRIGGER trg_company_info_updated_at
    BEFORE UPDATE ON company_info
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS mjengo_members (
    id                      SERIAL PRIMARY KEY,
    full_name               VARCHAR(150) NOT NULL,
    phone_number            VARCHAR(30) UNIQUE NOT NULL,
    monthly_target_amount   NUMERIC(14, 2) NOT NULL DEFAULT 100000,
    total_goal_amount       NUMERIC(14, 2),
    start_date              DATE NOT NULL DEFAULT CURRENT_DATE,
    status                  VARCHAR(20) NOT NULL DEFAULT 'interested'
                              CHECK (status IN ('interested', 'active', 'completed', 'paused')),
    notes                   TEXT,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mjengo_members_phone ON mjengo_members (phone_number);
CREATE INDEX IF NOT EXISTS idx_mjengo_members_status ON mjengo_members (status);

CREATE TABLE IF NOT EXISTS mjengo_contributions (
    id                  SERIAL PRIMARY KEY,
    member_id           INTEGER NOT NULL REFERENCES mjengo_members(id) ON DELETE CASCADE,
    amount              NUMERIC(14, 2) NOT NULL,
    contribution_date   DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mjengo_contributions_member ON mjengo_contributions (member_id, contribution_date);

DROP TRIGGER IF EXISTS trg_mjengo_members_updated_at ON mjengo_members;
CREATE TRIGGER trg_mjengo_members_updated_at
    BEFORE UPDATE ON mjengo_members
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
