package com.nuverse_laguna.modules.messaging.domain;

import com.nuverse_laguna.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "messages")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Message extends BaseEntity {

    @Column(name = "conversation_id", nullable = false)
    private UUID conversationId;

    @Column(name = "sender_id", nullable = false)
    private UUID senderId;

    @Column(name = "body", nullable = false, columnDefinition = "TEXT")
    private String body;

    @Column(name = "is_read", nullable = false)
    private boolean read = false;

    public static Message create(UUID conversationId, UUID senderId, String body) {
        Message m = new Message();
        m.conversationId = conversationId;
        m.senderId = senderId;
        m.body = body;
        return m;
    }

    public void markRead() {
        this.read = true;
    }
}
