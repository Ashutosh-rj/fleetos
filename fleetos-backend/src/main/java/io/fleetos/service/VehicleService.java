package io.fleetos.service;

import io.fleetos.dto.request.vehicle.*;
import io.fleetos.dto.response.vehicle.VehicleDto;
import io.fleetos.dto.response.PageResponse;
import io.fleetos.entity.Vehicle;
import io.fleetos.enums.NotificationType;
import io.fleetos.enums.VehicleStatus;
import io.fleetos.enums.VehicleType;
import io.fleetos.exception.*;
import io.fleetos.repository.VehicleRepository;
import io.fleetos.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class VehicleService {

    private final VehicleRepository   vehicleRepository;
    private final QrCodeService       qrCodeService;
    private final NotificationService notificationService;
    private final SecurityUtils       securityUtils;

    // ----------------------------------------------------------------
    // Create
    // ----------------------------------------------------------------
    @Transactional
    public VehicleDto createVehicle(CreateVehicleRequest req) {
        if (vehicleRepository.existsByPlateNumberAndDeletedAtIsNull(req.getPlateNumber())) {
            throw new ConflictException("Vehicle with plate " + req.getPlateNumber() + " already exists");
        }

        Vehicle vehicle = Vehicle.builder()
            .plateNumber(req.getPlateNumber().toUpperCase().trim())
            .make(req.getMake())
            .model(req.getModel())
            .year(req.getYear())
            .color(req.getColor())
            .vin(req.getVin())
            .fuelType(req.getFuelType())
            .vehicleType(req.getVehicleType())
            .odometerKm(req.getOdometerKm() != null ? req.getOdometerKm() : java.math.BigDecimal.ZERO)
            .capacityTons(req.getCapacityTons())
            .registrationExpiry(req.getRegistrationExpiry())
            .insuranceExpiry(req.getInsuranceExpiry())
            .notes(req.getNotes())
            .build();

        vehicleRepository.save(vehicle);

        // Generate QR code
        String qrUrl = qrCodeService.generateVehicleQr(vehicle);
        vehicle.setQrCodeUrl(qrUrl);
        vehicleRepository.save(vehicle);

        log.info("Vehicle created: {} ({})", vehicle.getPlateNumber(), vehicle.getId());

        notificationService.broadcastToAdmins(
            "New Vehicle Added",
            vehicle.getYear() + " " + vehicle.getMake() + " " + vehicle.getModel()
            + " (" + vehicle.getPlateNumber() + ") has been added to the fleet.",
            NotificationType.VEHICLE_ADDED, "VEHICLE", vehicle.getId());

        return toDto(vehicle);
    }

    // ----------------------------------------------------------------
    // Read
    // ----------------------------------------------------------------
    @Transactional(readOnly = true)
    public PageResponse<VehicleDto> searchVehicles(
            String search, VehicleStatus status, VehicleType vehicleType,
            int page, int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Vehicle> result = vehicleRepository.searchVehicles(search, status, vehicleType, pageable);
        return new PageResponse<>(result.map(this::toDto));
    }

    @Transactional(readOnly = true)
    public VehicleDto getVehicleById(Long id) {
        return toDto(findVehicleOrThrow(id));
    }

    @Transactional(readOnly = true)
    public VehicleDto getVehicleByUuid(String uuid) {
        Vehicle v = vehicleRepository.findByUuidAndDeletedAtIsNull(uuid)
            .orElseThrow(() -> new ResourceNotFoundException("Vehicle", 0L));
        return toDto(v);
    }

    @Transactional(readOnly = true)
    public List<VehicleDto> getAvailableVehicles() {
        return vehicleRepository.findAvailableVehicles().stream().map(this::toDto).toList();
    }

    // ----------------------------------------------------------------
    // Update
    // ----------------------------------------------------------------
    @Transactional
    public VehicleDto updateVehicle(Long id, UpdateVehicleRequest req) {
        Vehicle vehicle = findVehicleOrThrow(id);

        if (req.getMake()               != null) vehicle.setMake(req.getMake());
        if (req.getModel()              != null) vehicle.setModel(req.getModel());
        if (req.getYear()               != null) vehicle.setYear(req.getYear());
        if (req.getColor()              != null) vehicle.setColor(req.getColor());
        if (req.getVin()                != null) vehicle.setVin(req.getVin());
        if (req.getFuelType()           != null) vehicle.setFuelType(req.getFuelType());
        if (req.getVehicleType()        != null) vehicle.setVehicleType(req.getVehicleType());
        if (req.getStatus()             != null) vehicle.setStatus(req.getStatus());
        if (req.getOdometerKm()         != null) vehicle.setOdometerKm(req.getOdometerKm());
        if (req.getCapacityTons()       != null) vehicle.setCapacityTons(req.getCapacityTons());
        if (req.getRegistrationExpiry() != null) vehicle.setRegistrationExpiry(req.getRegistrationExpiry());
        if (req.getInsuranceExpiry()    != null) vehicle.setInsuranceExpiry(req.getInsuranceExpiry());
        if (req.getNotes()              != null) vehicle.setNotes(req.getNotes());

        vehicleRepository.save(vehicle);
        log.info("Vehicle updated: {}", vehicle.getId());
        return toDto(vehicle);
    }

    // ----------------------------------------------------------------
    // Soft delete
    // ----------------------------------------------------------------
    @Transactional
    public void deleteVehicle(Long id) {
        Vehicle vehicle = findVehicleOrThrow(id);
        if (vehicle.getStatus() == VehicleStatus.IN_USE) {
            throw new BadRequestException("Cannot delete a vehicle that is currently in use");
        }
        vehicle.setDeletedAt(LocalDateTime.now());
        vehicleRepository.save(vehicle);
        log.info("Vehicle soft-deleted: {}", id);
    }

    // ----------------------------------------------------------------
    // QR Code
    // ----------------------------------------------------------------
    @Transactional
    public String regenerateQrCode(Long id) {
        Vehicle vehicle = findVehicleOrThrow(id);
        String qrUrl = qrCodeService.generateVehicleQr(vehicle);
        vehicle.setQrCodeUrl(qrUrl);
        vehicleRepository.save(vehicle);
        return qrUrl;
    }

    // ----------------------------------------------------------------
    // Export (raw list for report service)
    // ----------------------------------------------------------------
    @Transactional(readOnly = true)
    public List<Vehicle> getAllActiveForExport() {
        return vehicleRepository.findAllActive();
    }

    // ----------------------------------------------------------------
    // Private helpers
    // ----------------------------------------------------------------
    private Vehicle findVehicleOrThrow(Long id) {
        return vehicleRepository.findByIdAndDeletedAtIsNull(id)
            .orElseThrow(() -> new ResourceNotFoundException("Vehicle", id));
    }

    public VehicleDto toDto(Vehicle v) {
        return VehicleDto.builder()
            .id(v.getId())
            .uuid(v.getUuid())
            .plateNumber(v.getPlateNumber())
            .make(v.getMake())
            .model(v.getModel())
            .year(v.getYear())
            .color(v.getColor())
            .vin(v.getVin())
            .fuelType(v.getFuelType())
            .vehicleType(v.getVehicleType())
            .status(v.getStatus())
            .odometerKm(v.getOdometerKm())
            .capacityTons(v.getCapacityTons())
            .registrationExpiry(v.getRegistrationExpiry())
            .insuranceExpiry(v.getInsuranceExpiry())
            .qrCodeUrl(v.getQrCodeUrl())
            .notes(v.getNotes())
            .registrationExpiringSoon(v.isRegistrationExpiringSoon())
            .insuranceExpiringSoon(v.isInsuranceExpiringSoon())
            .createdAt(v.getCreatedAt())
            .updatedAt(v.getUpdatedAt())
            .build();
    }
}
