package com.alumni.platform.institution.service;

import com.alumni.platform.institution.dto.VerificationDecisionRequest;
import com.alumni.platform.institution.dto.VerificationResponse;
import com.alumni.platform.institution.entity.AlumniVerification;
import com.alumni.platform.institution.entity.VerificationStatus;
import com.alumni.platform.institution.repository.AlumniVerificationRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.UUID;

@Service
@Transactional
public class VerificationService {

    private final AlumniVerificationRepository verificationRepository;
    private final AuditLogService auditLogService;

    public VerificationService(AlumniVerificationRepository verificationRepository,
                               AuditLogService auditLogService) {
        this.verificationRepository = verificationRepository;
        this.auditLogService = auditLogService;
    }

    // student submits verification (called via event from identity/profile service perhaps)
    public VerificationResponse submit(UUID userId, UUID instituteId, String documentsJson) {
        AlumniVerification v = new AlumniVerification();
        v.setId(UUID.randomUUID());
        v.setUserId(userId);
        v.setInstituteId(instituteId);
        v.setSubmittedDocuments(documentsJson);
        v.setStatus(VerificationStatus.PENDING);
        v = verificationRepository.save(v);
        return toResponse(v);
    }

    @Transactional(readOnly = true)
    public Page<VerificationResponse> list(UUID instituteId, Pageable pageable) {
        return verificationRepository.findByInstituteId(instituteId, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<VerificationResponse> listPending(UUID instituteId, Pageable pageable) {
        return verificationRepository.findByInstituteIdAndStatus(instituteId, VerificationStatus.PENDING, pageable)
                .map(this::toResponse);
    }

    public VerificationResponse decide(UUID verificationId, UUID adminUserId, VerificationDecisionRequest req) {
        AlumniVerification v = verificationRepository.findById(verificationId)
                .orElseThrow(() -> new IllegalArgumentException("Verification not found"));
        if (req.getApprove()) {
            v.setStatus(VerificationStatus.APPROVED);
        } else {
            v.setStatus(VerificationStatus.REJECTED);
            v.setRejectionReason(req.getRejectionReason());
        }
        v.setReviewedBy(adminUserId);
        v.setReviewedAt(OffsetDateTime.now());
        v = verificationRepository.save(v);

        auditLogService.log(adminUserId, req.getApprove() ? "VERIFICATION_APPROVED" : "VERIFICATION_REJECTED",
                "ALUMNI_VERIFICATION", v.getId(), "{\"userId\":\"" + v.getUserId() + "\"}");

        return toResponse(v);
    }

    private VerificationResponse toResponse(AlumniVerification v) {
        return new VerificationResponse(v.getId(), v.getUserId(), v.getInstituteId(),
                v.getStatus(), v.getSubmittedDocuments(), v.getReviewedBy(),
                v.getReviewedAt(), v.getRejectionReason(), v.getCreatedAt(), v.getUpdatedAt());
    }
}