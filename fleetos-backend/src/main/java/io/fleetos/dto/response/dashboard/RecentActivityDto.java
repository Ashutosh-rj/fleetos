package io.fleetos.dto.response.dashboard;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data @Builder
public class RecentActivityDto {
    private String        type;
    private String        description;
    private String        actor;
    private String        referenceId;
    private LocalDateTime timestamp;
}
