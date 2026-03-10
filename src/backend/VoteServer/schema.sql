CREATE TABLE IF NOT EXISTS voters (
    voter_id TEXT PRIMARY KEY,
    has_voted BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS candidates (
    id SERIAL PRIMARY KEY,
    name TEXT,
    metadata JSONB
);

CREATE TABLE IF NOT EXISTS payloads (
    id SERIAL PRIMARY KEY,
    type TEXT NOT NULL,
    voter_id TEXT,
    vote_data TEXT,
    mask_data TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT payload_type_check CHECK (type IN ('vote', 'mask')),
    CONSTRAINT vote_payload_check CHECK (
      (type = 'vote' AND voter_id IS NOT NULL AND vote_data IS NOT NULL)
      OR
      (type = 'mask' AND mask_data IS NOT NULL)
    )
);