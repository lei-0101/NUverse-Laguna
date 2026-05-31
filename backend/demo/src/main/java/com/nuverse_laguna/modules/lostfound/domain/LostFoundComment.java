package com.nuverse_laguna.modules.lostfound.domain;

import com.nuverse_laguna.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "lost_found_comments")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class LostFoundComment extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "item_id", nullable = false)
    private LostFoundItem item;

    @Column(name = "author_id", nullable = false)
    private UUID authorId;

    @Column(name = "author_name", nullable = false, length = 120)
    private String authorName;

    @Column(name = "body", nullable = false, columnDefinition = "TEXT")
    private String body;

    public static LostFoundComment create(LostFoundItem item, UUID authorId, String authorName, String body) {
        LostFoundComment c = new LostFoundComment();
        c.item = item;
        c.authorId = authorId;
        c.authorName = authorName;
        c.body = body;
        return c;
    }
}
