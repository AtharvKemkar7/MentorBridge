package com.alumni.platform.notification.service;

import com.alumni.platform.notification.dto.EmailTemplateRequest;
import com.alumni.platform.notification.dto.EmailTemplateResponse;
import com.alumni.platform.notification.entity.EmailTemplate;
import com.alumni.platform.notification.repository.EmailTemplateRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class EmailTemplateService {

    private final EmailTemplateRepository templateRepository;

    public EmailTemplateService(EmailTemplateRepository templateRepository) {
        this.templateRepository = templateRepository;
    }

    public EmailTemplateResponse create(EmailTemplateRequest req) {
        EmailTemplate t = new EmailTemplate();
        t.setId(UUID.randomUUID());
        t.setName(req.getName());
        t.setSubject(req.getSubject());
        t.setBody(req.getBody());
        t = templateRepository.save(t);
        return toResponse(t);
    }

    @Transactional(readOnly = true)
    public List<EmailTemplateResponse> list() {
        return templateRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public EmailTemplateResponse get(String name) {
        EmailTemplate t = templateRepository.findByName(name)
                .orElseThrow(() -> new IllegalArgumentException("Template not found: " + name));
        return toResponse(t);
    }

    public EmailTemplateResponse update(String name, EmailTemplateRequest req) {
        EmailTemplate t = templateRepository.findByName(name)
                .orElseThrow(() -> new IllegalArgumentException("Template not found: " + name));
        t.setSubject(req.getSubject());
        t.setBody(req.getBody());
        t = templateRepository.save(t);
        return toResponse(t);
    }

    public void delete(String name) {
        EmailTemplate t = templateRepository.findByName(name)
                .orElseThrow(() -> new IllegalArgumentException("Template not found: " + name));
        templateRepository.delete(t);
    }

    private EmailTemplateResponse toResponse(EmailTemplate t) {
        return new EmailTemplateResponse(t.getId(), t.getName(), t.getSubject(), t.getBody(),
                t.getCreatedAt(), t.getUpdatedAt());
    }
}