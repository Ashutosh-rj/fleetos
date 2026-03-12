package io.fleetos.dto.response.auth;

import io.fleetos.enums.UserRole;
import lombok.Builder;
import lombok.Data;

@Data @Builder
public class AuthResponse {
    private String    token;
    private String    tokenType;
    private Long      expiresIn;
    private Long      userId;
    private String    uuid;
    private String    fullName;
    private String    email;
    private UserRole  role;
    private String    profileImageUrl;
}
