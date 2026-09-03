package com.alumni.platform.institution.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class SettingsRequest {
    @NotBlank
    @Size(max = 100)
    private String key;
    private String value;
    @Size(max = 500)
    private String description;

    public String getKey() { return key; }
    public void setKey(String key) { this.key = key; }
    public String getValue() { return value; }
    public void setValue(String value) { this.value = value; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}