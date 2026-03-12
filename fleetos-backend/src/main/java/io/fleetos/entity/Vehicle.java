package io.fleetos.entity;

import io.fleetos.entity.base.BaseEntity;
import io.fleetos.enums.FuelType;
import io.fleetos.enums.VehicleStatus;
import io.fleetos.enums.VehicleType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "vehicles",
       indexes = {
           @Index(name = "idx_vehicles_status",       columnList = "status"),
           @Index(name = "idx_vehicles_vehicle_type", columnList = "vehicle_type"),
           @Index(name = "idx_vehicles_deleted_at",   columnList = "deleted_at")
       })
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vehicle extends BaseEntity {

    @Column(name = "uuid", nullable = false, unique = true, length = 36)
    private String uuid;

    @Column(name = "plate_number", nullable = false, unique = true, length = 20)
    private String plateNumber;

    @Column(name = "make", nullable = false, length = 80)
    private String make;

    @Column(name = "model", nullable = false, length = 80)
    private String model;

    @Column(name = "year", nullable = false)
    private Integer year;

    @Column(name = "color", length = 40)
    private String color;

    @Column(name = "vin", length = 50)
    private String vin;

    @Enumerated(EnumType.STRING)
    @Column(name = "fuel_type", nullable = false, length = 20)
    @Builder.Default
    private FuelType fuelType = FuelType.PETROL;

    @Enumerated(EnumType.STRING)
    @Column(name = "vehicle_type", nullable = false, length = 20)
    @Builder.Default
    private VehicleType vehicleType = VehicleType.SEDAN;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private VehicleStatus status = VehicleStatus.AVAILABLE;

    @Column(name = "odometer_km", nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal odometerKm = BigDecimal.ZERO;

    @Column(name = "capacity_tons", precision = 6, scale = 2)
    private BigDecimal capacityTons;

    @Column(name = "registration_expiry")
    private LocalDate registrationExpiry;

    @Column(name = "insurance_expiry")
    private LocalDate insuranceExpiry;

    @Column(name = "qr_code_url", length = 500)
    private String qrCodeUrl;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @OneToMany(mappedBy = "vehicle", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Trip> trips = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        if (uuid == null) {
            uuid = java.util.UUID.randomUUID().toString();
        }
    }

    public boolean isDeleted() {
        return deletedAt != null;
    }

    public boolean isRegistrationExpiringSoon() {
        return registrationExpiry != null
            && registrationExpiry.isBefore(LocalDate.now().plusDays(30));
    }

    public boolean isInsuranceExpiringSoon() {
        return insuranceExpiry != null
            && insuranceExpiry.isBefore(LocalDate.now().plusDays(30));
    }
}
