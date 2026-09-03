package com.alumni.platform.institution.service;

import com.alumni.platform.institution.dto.AuditLogResponse;
import com.alumni.platform.institution.entity.AdminAuditLog;
import com.alumni.platform.institution.repository.AdminAuditLogRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Transactional
public class AuditLogService {

    private final AdminAuditLogRepository auditLogRepository;

    public AuditLogService(AdminAuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public void log(UUID adminUserId, String action, String targetType, UUID targetId, String details) {
        AdminAuditLog log = new AdminAuditLog();
        log.setId(UUID.randomUUID());
        log.setAdminUserId(adminUserId);
        log.setAction(action);
        log.setTargetType(targetType);
        log.setTargetId(targetId);
        log.setDetails(details);
        auditLogRepository.save(log);
    }

    @Transactional(readOnly = true)
    public Page<AuditLogResponse> listByAdmin(UUID adminUserId, Pageable pageable) {
        return auditLogRepository.findByAdminUserId(adminUserId, pageable).map(this::toResponse);
    }

    private AuditLogResponse toResponse(AdminAuditLog log) {
        return new AuditLogResponse(log.getId(), log.getAdminUserId(), log.getAction(),
                log.getTargetType(), log.getTargetId(), log.getDetails(), log.getCreatedAt());
    }
}