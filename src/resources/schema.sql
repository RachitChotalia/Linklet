-- backend-api/src/main/resources/schema.sql
CREATE TABLE IF NOT EXISTS urls (
    id BIGINT PRIMARY KEY,
    short_code VARCHAR(10) NOT NULL UNIQUE,
    long_url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_short_code ON urls(short_code);