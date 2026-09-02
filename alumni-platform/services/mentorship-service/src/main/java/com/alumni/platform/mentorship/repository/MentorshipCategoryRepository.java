package com.alumni.platform.mentorship.repository;

import com.alumni.platform.mentorship.entity.MentorshipCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MentorshipCategoryRepository extends JpaRepository<MentorshipCategory, UUID> {

    Optional<MentorshipCategory> findByName(String name);

    List<MentorshipCategory> findByIsActiveTrueOrderBySortOrderAsc();

    Page<MentorshipCategory> findByIsActiveTrue(Pageable pageable);
}