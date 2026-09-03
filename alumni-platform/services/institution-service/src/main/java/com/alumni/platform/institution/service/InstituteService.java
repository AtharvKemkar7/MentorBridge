package com.alumni.platform.institution.service;

import com.alumni.platform.institution.dto.InstituteRequest;
import com.alumni.platform.institution.dto.InstituteResponse;
import com.alumni.platform.institution.entity.Institute;
import com.alumni.platform.institution.exception.InstituteNotFoundException;
import com.alumni.platform.institution.repository.InstituteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Transactional
public class InstituteService {

    private final InstituteRepository instituteRepository;

    public InstituteService(InstituteRepository instituteRepository) {
        this.instituteRepository = instituteRepository;
    }

    public InstituteResponse create(InstituteRequest req) {
        Institute i = new Institute();
        i.setId(UUID.randomUUID());
        i.setName(req.getName());
        i.setDomain(req.getDomain());
        i.setLogoUrl(req.getLogoUrl());
        i.setDescription(req.getDescription());
        i.setEstablishedYear(req.getEstablishedYear());
        i.setContactEmail(req.getContactEmail());
        i.setContactPhone(req.getContactPhone());
        i.setAddress(req.getAddress());
        i = instituteRepository.save(i);
        return toResponse(i);
    }

    @Transactional(readOnly = true)
    public InstituteResponse getById(UUID id) {
        Institute i = instituteRepository.findById(id)
                .orElseThrow(() -> new InstituteNotFoundException("Institute not found: " + id));
        return toResponse(i);
    }

    @Transactional(readOnly = true)
    public InstituteResponse getByDomain(String domain) {
        Institute i = instituteRepository.findByDomain(domain)
                .orElseThrow(() -> new InstituteNotFoundException("Institute not found for domain: " + domain));
        return toResponse(i);
    }

    public InstituteResponse update(UUID id, InstituteRequest req) {
        Institute i = instituteRepository.findById(id)
                .orElseThrow(() -> new InstituteNotFoundException("Institute not found: " + id));
        i.setName(req.getName());
        i.setDomain(req.getDomain());
        i.setLogoUrl(req.getLogoUrl());
        i.setDescription(req.getDescription());
        i.setEstablishedYear(req.getEstablishedYear());
        i.setContactEmail(req.getContactEmail());
        i.setContactPhone(req.getContactPhone());
        i.setAddress(req.getAddress());
        i = instituteRepository.save(i);
        return toResponse(i);
    }

    private InstituteResponse toResponse(Institute i) {
        return new InstituteResponse(i.getId(), i.getName(), i.getDomain(), i.getLogoUrl(),
                i.getDescription(), i.getEstablishedYear(), i.getContactEmail(),
                i.getContactPhone(), i.getAddress(), i.getCreatedAt(), i.getUpdatedAt());
    }
}