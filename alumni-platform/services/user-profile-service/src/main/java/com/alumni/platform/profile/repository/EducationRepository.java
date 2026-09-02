package com.alumni.platform.profile.repository;

import com.alumni.platform.profile.entity.Education;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface EducationRepository extends JpaRepository<Education, UUID> {

    List<Education> findByStudentProfileId(UUID studentProfileId);

    List<Education> findByAlumniProfileId(UUID alumniProfileId);

    void deleteByStudentProfileId(UUID studentProfileId);

    void deleteByAlumniProfileId(UUID alumniProfileId);
}