package com.alumni.platform.identity.dto.request;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateProfileRequest {

    @Size(min = 1, max = 100, message = "First name must be between 1 and 100 characters")
    private String firstName;

    @Size(min = 1, max = 100, message = "Last name must be between 1 and 100 characters")
    private String lastName;

    @Size(max = 20, message = "Phone number must not exceed 20 characters")
    @Pattern(regexp = "^[+]?[(]?[0-9]{1,3}[)]?[-\\s.]?[(]?[0-9]{1,3}[)]?[-\\s.]?[0-9]{4,6}$",
            message = "Invalid phone number format")
    private String phoneNumber;

    @Size(max = 500, message = "Profile image URL must not exceed 500 characters")
    @Pattern(regexp = "^(https?://).*$", message = "Profile image must be a valid URL")
    private String profileImageUrl;
}