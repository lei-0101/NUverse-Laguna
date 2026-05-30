package com.nuverse_laguna.modules.marketplace.repository;

import com.nuverse_laguna.modules.marketplace.domain.ListingReport;
import com.nuverse_laguna.modules.marketplace.domain.ReportStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ListingReportRepository extends JpaRepository<ListingReport, UUID> {

    Page<ListingReport> findByStatus(ReportStatus status, Pageable pageable);

    boolean existsByReporterIdAndListingId(UUID reporterId, UUID listingId);
}
