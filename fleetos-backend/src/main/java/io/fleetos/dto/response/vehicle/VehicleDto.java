package io.fleetos.dto.response.vehicle;

import io.fleetos.enums.FuelType;
import io.fleetos.enums.VehicleStatus;
import io.fleetos.enums.VehicleType;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data @Builder
public class VehicleDto {
    private Long          id;
    private String        uuid;
    private String        plateNumber;
    private String        make;
    private String        model;
    private Integer       year;
    private String        color;
    private String        vin;
    private FuelType      fuelType;
    private VehicleType   vehicleType;
    private VehicleStatus status;
    private BigDecimal    odometerKm;
    private BigDecimal    capacityTons;
    private LocalDate     registrationExpiry;
    private LocalDate     insuranceExpiry;
    private String        qrCodeUrl;
    private String        notes;
    private Boolean       registrationExpiringSoon;
    private Boolean       insuranceExpiringSoon;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
