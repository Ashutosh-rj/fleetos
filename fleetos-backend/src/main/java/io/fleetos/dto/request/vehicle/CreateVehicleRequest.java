package io.fleetos.dto.request.vehicle;

import io.fleetos.enums.FuelType;
import io.fleetos.enums.VehicleType;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class CreateVehicleRequest {
    @NotBlank @Size(max=20)
    private String plateNumber;
    @NotBlank @Size(max=80)
    private String make;
    @NotBlank @Size(max=80)
    private String model;
    @NotNull @Min(1900) @Max(2100)
    private Integer year;
    @Size(max=40)
    private String color;
    @Size(max=50)
    private String vin;
    @NotNull
    private FuelType fuelType;
    @NotNull
    private VehicleType vehicleType;
    @DecimalMin("0")
    private BigDecimal odometerKm;
    @DecimalMin("0")
    private BigDecimal capacityTons;
    private LocalDate registrationExpiry;
    private LocalDate insuranceExpiry;
    @Size(max=2000)
    private String notes;
}
