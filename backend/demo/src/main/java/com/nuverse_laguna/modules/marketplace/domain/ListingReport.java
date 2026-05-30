package com.nuverse_laguna.modules.marketplace.domain;

import com.nuverse_laguna.shared.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "listing_reports")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ListingReport extends BaseEntity {

    @Column(name = "reporter_id", nullable = false)
    private UUID reporterId;

    @Column(name = "listing_id", nullable = false)
    private UUID listingId;

    @Column(name = "reason", nullable = false, length = 500)
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private ReportStatus status;

    public static ListingReport create(UUID reporterId, UUID listingId, String reason) {
        ListingReport report = new ListingReport();
        report.reporterId = reporterId;
        report.listingId = listingId;
        report.reason = reason;
        report.status = ReportStatus.PENDING;
        return report;
    }

    public void resolve() {
        this.status = ReportStatus.RESOLVED;
    }

    public void dismiss() {
        this.status = ReportStatus.DISMISSED;
    }
}
