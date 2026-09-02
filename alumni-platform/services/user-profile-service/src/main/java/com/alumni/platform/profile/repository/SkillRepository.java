package com.alumni.platform.profile.repository;

import com.alumni.platform.profile.entity.Skill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SkillRepository extends JpaRepository<Skill, UUID> {

    List<Skill> findByStudentProfileId(UUID studentProfileId);

    List<Skill> findByAlumniProfileId(UUID alumniProfileId);

    List<Skill> findByNameIgnoreCase(String name);

    List<Skill> findByCategory(String category);

    void deleteByStudentProfileId(UUID studentProfileId);

    void deleteByAlumniProfileId(UUID alumniProfileId);
}