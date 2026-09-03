package com.alumni.platform.institution.repository;

import com.alumni.platform.institution.entity.InstituteSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InstituteSettingsRepository extends JpaRepository<InstituteSettings, UUID> {
    Optional<InstituteSettings> findByInstituteIdAndKey(UUID instituteId, String key);
    List<InstituteSettings> findByInstituteId(UUID instituteId);
}