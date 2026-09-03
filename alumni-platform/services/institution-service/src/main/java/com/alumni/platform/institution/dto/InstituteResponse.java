package com.alumni.platform.institution.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public class InstituteResponse {
    private UUID id;
    private String name;
    private String domain;
    private String logoUrl;
    private String description;
    private Integer establishedYear;
    private String contactEmail;
    private String contactPhone;
    private String address;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    public InstituteResponse() {}

    public InstituteResponse(UUID id, String name, String domain, String logoUrl, String description,
                             Integer establishedYear, String contactEmail, String contactPhone,
                             String address, OffsetDateTime createdAt, OffsetDateTime updatedAt) {
        this.id = id;
        this.name = name;
        this.domain = domain;
        this.logoUrl = logoUrl;
        this.description = description;
        this.establishedYear = establishedYear;
        this.contactEmail = contactEmail;
        this.contactPhone = contactPhone;
        this.address = address;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // getters
    public UUID getId() { return id; }
    public String getName() { return name; }
    public String getDomain() { return domain; }
    public String getLogoUrl() { return logoUrl; }
    public String getDescription() { return description; }
    public Integer getEstablishedYear() { return establishedYear; }
    public String getContactEmail() { return contactEmail; }
    public String getContactPhone() { return contactPhone; }
    public String getAddress() { return address; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
}