package com.alumni.platform.profile.repository;

import com.alumni.platform.profile.entity.ExpertiseArea;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ExpertiseAreaRepository extends JpaRepository<ExpertiseArea, UUID> {

    List<ExpertiseArea> findByAlumniProfileId(UUID alumniProfileId);

    List<ExpertiseArea> findByAlumniProfileIdAndIsMentoringAreaTrue(UUID alumniProfileId);

    void deleteByAlumniProfileId(UUID alumniProfileId);
}