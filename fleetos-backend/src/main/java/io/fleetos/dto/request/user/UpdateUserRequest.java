package io.fleetos.dto.request.user;

import io.fleetos.enums.UserRole;
import io.fleetos.enums.UserStatus;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class UpdateUserRequest {
    @Size(min=2, max=100)
    private String fullName;
    @Size(max=20)
    private String phone;
    private UserRole role;
    private UserStatus status;
    @Size(max=500)
    private String profileImageUrl;
}
