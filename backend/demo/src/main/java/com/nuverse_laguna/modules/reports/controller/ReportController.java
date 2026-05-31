package com.nuverse_laguna.modules.reports.controller;

import com.nuverse_laguna.modules.profile.repository.UserProfileRepository;
import com.nuverse_laguna.modules.reports.domain.Report;
import com.nuverse_laguna.modules.reports.dto.CreateReportRequest;
import com.nuverse_laguna.modules.reports.dto.ReportResponse;
import com.nuverse_laguna.modules.reports.repository.ReportRepository;
import com.nuverse_laguna.shared.exception.ResourceNotFoundException;
import com.nuverse_laguna.shared.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportRepository reportRepository;
    private final UserProfileRepository profileRepository;

    /** Any authenticated user — submit a report. */
    @PostMapping
    public ResponseEntity<ApiResponse<ReportResponse>> submit(
            Authentication auth,
            @Valid @RequestBody CreateReportRequest request
    ) {
        UUID userId = UUID.fromString((String) auth.getPrincipal());
        Report report = reportRepository.save(Report.create(
                userId,
                request.subject(),
                request.category() != null ? request.category() : "OTHER",
                request.description(),
                request.targetType(),
                request.targetId()
        ));
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Report submitted", toResponse(report, userId)));
    }

    /** Admin only — list all reports. */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<ReportResponse>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Page<ReportResponse> reports = reportRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(page, size))
                .map(r -> toResponse(r, r.getReporterId()));
        return ResponseEntity.ok(ApiResponse.ok("Reports retrieved", reports));
    }

    /** Admin only — close/dismiss a report. */
    @PatchMapping("/{id}/close")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ReportResponse>> close(@PathVariable UUID id) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Report", id));
        report.close();
        reportRepository.save(report);
        return ResponseEntity.ok(ApiResponse.ok("Report closed", toResponse(report, report.getReporterId())));
    }

    private ReportResponse toResponse(Report r, UUID reporterId) {
        String name = profileRepository.findByUserId(reporterId)
                .map(p -> p.getFullName())
                .orElse("Unknown");
        return new ReportResponse(
                r.getId(), r.getReporterId(), name,
                r.getSubject(), r.getCategory(), r.getDescription(),
                r.getTargetType(), r.getTargetId(), r.getStatus(), r.getCreatedAt()
        );
    }
}
