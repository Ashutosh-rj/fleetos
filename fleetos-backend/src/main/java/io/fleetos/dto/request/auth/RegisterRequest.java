package io.fleetos.dto.request.auth;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank @Size(min=2, max=100)
    private String fullName;
    @NotBlank @Email
    private String email;
    @NotBlank @Size(min=8, max=60)
    private String password;
    @Size(max=20)
    private String phone;
}
