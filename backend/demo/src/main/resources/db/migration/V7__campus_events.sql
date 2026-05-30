CREATE TABLE campus_events
(
    id              UUID         NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id      UUID                              REFERENCES users (id) ON DELETE SET NULL,
    title           VARCHAR(200) NOT NULL,
    description     TEXT,
    category        VARCHAR(50)  NOT NULL,
    location        VARCHAR(300) NOT NULL,
    start_time      TIMESTAMP    NOT NULL,
    end_time        TIMESTAMP,
    cover_image_url VARCHAR(500),
    capacity        INT,
    status          VARCHAR(50)  NOT NULL             DEFAULT 'DRAFT',
    created_at      TIMESTAMP    NOT NULL             DEFAULT NOW(),
    updated_at      TIMESTAMP    NOT NULL             DEFAULT NOW()
);

CREATE TABLE event_rsvps
(
    id         UUID        NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id   UUID        NOT NULL REFERENCES campus_events (id) ON DELETE CASCADE,
    user_id    UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    status     VARCHAR(50) NOT NULL             DEFAULT 'ATTENDING',
    created_at TIMESTAMP   NOT NULL             DEFAULT NOW(),
    updated_at TIMESTAMP   NOT NULL             DEFAULT NOW(),
    UNIQUE (event_id, user_id)
);

-- Primary browse path: published events sorted by start time
CREATE INDEX idx_events_status_start     ON campus_events (status, start_time);
CREATE INDEX idx_events_category         ON campus_events (category);
CREATE INDEX idx_events_creator          ON campus_events (creator_id);

-- RSVP lookup and count
CREATE INDEX idx_event_rsvps_event       ON event_rsvps (event_id, status);
CREATE INDEX idx_event_rsvps_user        ON event_rsvps (user_id, status);
