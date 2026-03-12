package io.fleetos.dto.request.user;

import io.fleetos.enums.UserRole;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class CreateUserRequest {
    @NotBlank @Size(min=2, max=100)
    private String fullName;
    @NotBlank @Email
    private String email;
    @NotBlank @Size(min=8)
    private String password;
    @Size(max=20)
    private String phone;
    @NotNull
    private UserRole role;
}
