package com.alumni.platform.institution.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public class VerificationDecisionRequest {
    @NotNull
    private Boolean approve; // true approve, false reject
    private String rejectionReason;

    public Boolean getApprove() { return approve; }
    public void setApprove(Boolean approve) { this.approve = approve; }
    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }
}