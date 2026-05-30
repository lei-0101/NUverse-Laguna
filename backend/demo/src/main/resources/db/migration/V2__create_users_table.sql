CREATE TABLE users
(
    id                 UUID         NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    email              VARCHAR(255) NOT NULL UNIQUE,
    password           VARCHAR(255) NOT NULL,
    full_name          VARCHAR(255) NOT NULL,
    role               VARCHAR(50)  NOT NULL             DEFAULT 'ROLE_STUDENT',
    status             VARCHAR(50)  NOT NULL             DEFAULT 'PENDING_VERIFICATION',
    verification_token VARCHAR(255),
    verified_at        TIMESTAMP,
    created_at         TIMESTAMP    NOT NULL             DEFAULT NOW(),
    updated_at         TIMESTAMP    NOT NULL             DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_verification_token ON users (verification_token) WHERE verification_token IS NOT NULL;
