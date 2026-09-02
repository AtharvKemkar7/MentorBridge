package com.alumni.platform.identity.dto.request;

import com.alumni.platform.identity.entity.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Size(max = 255, message = "Email must not exceed 255 characters")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 128, message = "Password must be between 8 and 128 characters")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
            message = "Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character")
    private String password;

    @NotBlank(message = "First name is required")
    @Size(min = 1, max = 100, message = "First name must be between 1 and 100 characters")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(min = 1, max = 100, message = "Last name must be between 1 and 100 characters")
    private String lastName;

    @Size(max = 50, message = "Student ID must not exceed 50 characters")
    private String studentId;

    @Size(max = 50, message = "Employee ID must not exceed 50 characters")
    private String employeeId;

    @Size(max = 20, message = "Phone number must not exceed 20 characters")
    @Pattern(regexp = "^[+]?[(]?[0-9]{1,3}[)]?[-\\s.]?[(]?[0-9]{1,3}[)]?[-\\s.]?[0-9]{4,6}$",
            message = "Invalid phone number format")
    private String phoneNumber;

    @NotNull(message = "User type is required")
    private User.UserType userType;

    @NotBlank(message = "Role is required")
    private String roleName;
}