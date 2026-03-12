package io.fleetos.dto.request.trip;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class StartTripRequest {
    @NotNull
    private Long vehicleId;
    @NotNull
    private Long driverId;
    @NotBlank @Size(max=255)
    private String origin;
    @NotBlank @Size(max=255)
    private String destination;
    private BigDecimal originLat;
    private BigDecimal originLng;
    private BigDecimal destLat;
    private BigDecimal destLng;
    private LocalDateTime scheduledAt;
    @DecimalMin("0")
    private BigDecimal odometerStart;
    @Size(max=500)
    private String cargoDescription;
    @DecimalMin("0")
    private BigDecimal cargoWeightTons;
    @Size(max=2000)
    private String notes;
}
