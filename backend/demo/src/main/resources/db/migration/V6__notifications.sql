CREATE TABLE notifications
(
    id             UUID         NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_id   UUID         NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    type           VARCHAR(50)  NOT NULL,
    title          VARCHAR(200) NOT NULL,
    body           VARCHAR(500) NOT NULL,
    reference_id   UUID,
    reference_type VARCHAR(50),
    is_read        BOOLEAN      NOT NULL             DEFAULT FALSE,
    created_at     TIMESTAMP    NOT NULL             DEFAULT NOW(),
    updated_at     TIMESTAMP    NOT NULL             DEFAULT NOW()
);

-- Primary read path: all notifications for a user, newest first
CREATE INDEX idx_notifications_recipient_created  ON notifications (recipient_id, created_at DESC);
-- Unread badge count query
CREATE INDEX idx_notifications_recipient_unread   ON notifications (recipient_id, is_read) WHERE is_read = FALSE;
