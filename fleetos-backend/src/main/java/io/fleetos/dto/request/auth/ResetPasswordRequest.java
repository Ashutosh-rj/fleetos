package io.fleetos.dto.request.auth;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class ResetPasswordRequest {
    @NotBlank @Email
    private String email;
    @NotBlank
    private String otp;
    @NotBlank @Size(min=8)
    private String newPassword;
}
