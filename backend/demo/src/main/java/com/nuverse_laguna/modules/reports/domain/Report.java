package com.nuverse_laguna.modules.reports.domain;

import com.nuverse_laguna.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "reports")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Report extends BaseEntity {

    @Column(name = "reporter_id", nullable = false)
    private UUID reporterId;

    @Column(name = "subject", nullable = false, length = 200)
    private String subject;

    @Column(name = "category", nullable = false, length = 50)
    private String category;

    @Column(name = "description", nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "target_type", length = 50)
    private String targetType;

    @Column(name = "target_id")
    private UUID targetId;

    @Column(name = "status", nullable = false, length = 20)
    private String status = "OPEN";

    public static Report create(UUID reporterId, String subject, String category,
                                 String description, String targetType, UUID targetId) {
        Report r = new Report();
        r.reporterId = reporterId;
        r.subject = subject;
        r.category = category;
        r.description = description;
        r.targetType = targetType;
        r.targetId = targetId;
        return r;
    }

    public void close() { this.status = "CLOSED"; }
}
