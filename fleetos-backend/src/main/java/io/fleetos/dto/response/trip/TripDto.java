package io.fleetos.dto.response.trip;

import io.fleetos.dto.response.auth.UserSummaryDto;
import io.fleetos.dto.response.vehicle.VehicleDto;
import io.fleetos.enums.TripStatus;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data @Builder
public class TripDto {
    private Long           id;
    private String         uuid;
    private VehicleDto     vehicle;
    private UserSummaryDto driver;
    private TripStatus     status;
    private String         origin;
    private String         destination;
    private BigDecimal     originLat;
    private BigDecimal     originLng;
    private BigDecimal     destLat;
    private BigDecimal     destLng;
    private LocalDateTime  scheduledAt;
    private LocalDateTime  startedAt;
    private LocalDateTime  endedAt;
    private BigDecimal     odometerStart;
    private BigDecimal     odometerEnd;
    private BigDecimal     distanceKm;
    private BigDecimal     fuelUsedLiters;
    private String         cargoDescription;
    private BigDecimal     cargoWeightTons;
    private String         notes;
    private String         cancelledReason;
    private Long           durationMinutes;
    private LocalDateTime  createdAt;
}
