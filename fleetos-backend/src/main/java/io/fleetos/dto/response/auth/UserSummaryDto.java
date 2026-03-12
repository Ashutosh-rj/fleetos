package io.fleetos.dto.response.auth;

import io.fleetos.enums.UserRole;
import io.fleetos.enums.UserStatus;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data @Builder
public class UserSummaryDto {
    private Long          id;
    private String        uuid;
    private String        fullName;
    private String        email;
    private String        phone;
    private UserRole      role;
    private UserStatus    status;
    private Boolean       emailVerified;
    private String        profileImageUrl;
    private LocalDateTime createdAt;
}
