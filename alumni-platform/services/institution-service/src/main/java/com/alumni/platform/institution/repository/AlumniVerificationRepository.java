package com.alumni.platform.institution.repository;

import com.alumni.platform.institution.entity.AlumniVerification;
import com.alumni.platform.institution.entity.VerificationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AlumniVerificationRepository extends JpaRepository<AlumniVerification, UUID> {
    Optional<AlumniVerification> findByUserId(UUID userId);
    List<AlumniVerification> findByInstituteId(UUID instituteId);
    Page<AlumniVerification> findByInstituteId(UUID instituteId, Pageable pageable);
    Page<AlumniVerification> findByInstituteIdAndStatus(UUID instituteId, VerificationStatus status, Pageable pageable);
}