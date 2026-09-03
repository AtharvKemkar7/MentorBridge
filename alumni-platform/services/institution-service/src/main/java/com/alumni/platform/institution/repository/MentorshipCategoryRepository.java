package com.alumni.platform.institution.repository;

import com.alumni.platform.institution.entity.MentorshipCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MentorshipCategoryRepository extends JpaRepository<MentorshipCategory, UUID> {
    List<MentorshipCategory> findByInstituteId(UUID instituteId);
    Page<MentorshipCategory> findByInstituteId(UUID instituteId, Pageable pageable);
    Optional<MentorshipCategory> findByInstituteIdAndName(UUID instituteId, String name);
}