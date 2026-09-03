package com.alumni.platform.institution.service;

import com.alumni.platform.institution.dto.SettingsRequest;
import com.alumni.platform.institution.dto.SettingsResponse;
import com.alumni.platform.institution.entity.InstituteSettings;
import com.alumni.platform.institution.repository.InstituteSettingsRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class SettingsService {

    private final InstituteSettingsRepository settingsRepository;

    public SettingsService(InstituteSettingsRepository settingsRepository) {
        this.settingsRepository = settingsRepository;
    }

    public SettingsResponse create(UUID instituteId, SettingsRequest req) {
        InstituteSettings s = new InstituteSettings();
        s.setId(UUID.randomUUID());
        s.setInstituteId(instituteId);
        s.setKey(req.getKey());
        s.setValue(req.getValue());
        s.setDescription(req.getDescription());
        s = settingsRepository.save(s);
        return toResponse(s);
    }

    @Transactional(readOnly = true)
    public List<SettingsResponse> list(UUID instituteId) {
        return settingsRepository.findByInstituteId(instituteId).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SettingsResponse get(UUID instituteId, String key) {
        InstituteSettings s = settingsRepository.findByInstituteIdAndKey(instituteId, key)
                .orElseThrow(() -> new IllegalArgumentException("Setting not found"));
        return toResponse(s);
    }

    public SettingsResponse update(UUID instituteId, String key, SettingsRequest req) {
        InstituteSettings s = settingsRepository.findByInstituteIdAndKey(instituteId, key)
                .orElseThrow(() -> new IllegalArgumentException("Setting not found"));
        s.setValue(req.getValue());
        s.setDescription(req.getDescription());
        s = settingsRepository.save(s);
        return toResponse(s);
    }

    public void delete(UUID instituteId, String key) {
        InstituteSettings s = settingsRepository.findByInstituteIdAndKey(instituteId, key)
                .orElseThrow(() -> new IllegalArgumentException("Setting not found"));
        settingsRepository.delete(s);
    }

    private SettingsResponse toResponse(InstituteSettings s) {
        return new SettingsResponse(s.getId(), s.getInstituteId(), s.getKey(),
                s.getValue(), s.getDescription(), s.getCreatedAt(), s.getUpdatedAt());
    }
}