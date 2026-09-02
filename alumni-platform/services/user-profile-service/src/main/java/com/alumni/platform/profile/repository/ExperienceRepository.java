package com.alumni.platform.profile.repository;

import com.alumni.platform.profile.entity.Experience;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ExperienceRepository extends JpaRepository<Experience, UUID> {

    List<Experience> findByAlumniProfileIdOrderByStartDateDesc(UUID alumniProfileId);

    void deleteByAlumniProfileId(UUID alumniProfileId);
}