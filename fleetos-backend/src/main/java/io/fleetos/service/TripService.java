package io.fleetos.service;

import io.fleetos.dto.request.trip.*;
import io.fleetos.dto.response.PageResponse;
import io.fleetos.dto.response.auth.UserSummaryDto;
import io.fleetos.dto.response.trip.TripDto;
import io.fleetos.dto.response.vehicle.VehicleDto;
import io.fleetos.entity.*;
import io.fleetos.enums.*;
import io.fleetos.exception.*;
import io.fleetos.repository.*;
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
public class TripService {

    private final TripRepository      tripRepository;
    private final VehicleRepository   vehicleRepository;
    private final UserRepository      userRepository;
    private final NotificationService notificationService;
    private final VehicleService      vehicleService;
    private final AuthService         authService;

    // ----------------------------------------------------------------
    // Start trip
    // ----------------------------------------------------------------
    @Transactional
    public TripDto startTrip(StartTripRequest req) {
        Vehicle vehicle = vehicleRepository.findByIdAndDeletedAtIsNull(req.getVehicleId())
            .orElseThrow(() -> new ResourceNotFoundException("Vehicle", req.getVehicleId()));

        if (vehicle.getStatus() != VehicleStatus.AVAILABLE) {
            throw new BadRequestException(
                "Vehicle is not available. Current status: " + vehicle.getStatus());
        }

        if (tripRepository.existsByVehicleIdAndStatus(req.getVehicleId(), TripStatus.IN_PROGRESS)) {
            throw new ConflictException("Vehicle already has an active trip");
        }

        User driver = userRepository.findById(req.getDriverId())
            .orElseThrow(() -> new ResourceNotFoundException("Driver", req.getDriverId()));

        if (tripRepository.existsByDriverIdAndStatus(req.getDriverId(), TripStatus.IN_PROGRESS)) {
            throw new ConflictException("Driver is already on an active trip");
        }

        Trip trip = Trip.builder()
            .vehicle(vehicle)
            .driver(driver)
            .status(TripStatus.IN_PROGRESS)
            .origin(req.getOrigin())
            .destination(req.getDestination())
            .originLat(req.getOriginLat())
            .originLng(req.getOriginLng())
            .destLat(req.getDestLat())
            .destLng(req.getDestLng())
            .scheduledAt(req.getScheduledAt())
            .startedAt(LocalDateTime.now())
            .odometerStart(req.getOdometerStart())
            .cargoDescription(req.getCargoDescription())
            .cargoWeightTons(req.getCargoWeightTons())
            .notes(req.getNotes())
            .build();

        tripRepository.save(trip);

        // Lock vehicle
        vehicle.setStatus(VehicleStatus.IN_USE);
        vehicleRepository.save(vehicle);

        log.info("Trip started: {} | Vehicle: {} | Driver: {}",
            trip.getUuid(), vehicle.getPlateNumber(), driver.getEmail());

        notificationService.broadcastToAdmins(
            "Trip Started",
            "Driver " + driver.getFullName() + " started a trip from "
            + req.getOrigin() + " to " + req.getDestination()
            + " in " + vehicle.getPlateNumber(),
            NotificationType.TRIP_STARTED, "TRIP", trip.getId());

        return toDto(trip);
    }

    // ----------------------------------------------------------------
    // End trip
    // ----------------------------------------------------------------
    @Transactional
    public TripDto endTrip(Long tripId, EndTripRequest req) {
        Trip trip = tripRepository.findById(tripId)
            .orElseThrow(() -> new ResourceNotFoundException("Trip", tripId));

        if (trip.getStatus() != TripStatus.IN_PROGRESS) {
            throw new BadRequestException("Trip is not in progress. Status: " + trip.getStatus());
        }

        if (req.getOdometerEnd() != null && trip.getOdometerStart() != null
                && req.getOdometerEnd().compareTo(trip.getOdometerStart()) < 0) {
            throw new BadRequestException("End odometer cannot be less than start odometer");
        }

        trip.setStatus(TripStatus.COMPLETED);
        trip.setEndedAt(LocalDateTime.now());
        trip.setOdometerEnd(req.getOdometerEnd());
        trip.setFuelUsedLiters(req.getFuelUsedLiters());
        if (req.getNotes() != null) trip.setNotes(req.getNotes());

        tripRepository.save(trip);

        // Free vehicle
        Vehicle vehicle = trip.getVehicle();
        vehicle.setStatus(VehicleStatus.AVAILABLE);
        if (req.getOdometerEnd() != null) {
            vehicle.setOdometerKm(req.getOdometerEnd());
        }
        vehicleRepository.save(vehicle);

        log.info("Trip completed: {} | Distance: {} km",
            trip.getUuid(), trip.getDistanceKm());

        notificationService.broadcastToAdmins(
            "Trip Completed",
            "Driver " + trip.getDriver().getFullName() + " completed trip from "
            + trip.getOrigin() + " to " + trip.getDestination()
            + (trip.getDistanceKm() != null ? " (" + trip.getDistanceKm() + " km)" : ""),
            NotificationType.TRIP_ENDED, "TRIP", trip.getId());

        return toDto(trip);
    }

    // ----------------------------------------------------------------
    // Read
    // ----------------------------------------------------------------
    @Transactional(readOnly = true)
    public PageResponse<TripDto> searchTrips(Long vehicleId, Long driverId, TripStatus status,
            LocalDateTime from, LocalDateTime to, int page, int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Trip> result = tripRepository.searchTrips(vehicleId, driverId, status, from, to, pageable);
        return new PageResponse<>(result.map(this::toDto));
    }

    @Transactional(readOnly = true)
    public TripDto getTripById(Long id) {
        Trip trip = tripRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Trip", id));
        return toDto(trip);
    }

    @Transactional(readOnly = true)
    public List<TripDto> getActiveTrips() {
        return tripRepository.findActiveTrips().stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public List<TripDto> getRecentTrips() {
        return tripRepository.findRecentTrips().stream().map(this::toDto).toList();
    }

    // ----------------------------------------------------------------
    // Mapper
    // ----------------------------------------------------------------
    public TripDto toDto(Trip t) {
        return TripDto.builder()
            .id(t.getId())
            .uuid(t.getUuid())
            .vehicle(vehicleService.toDto(t.getVehicle()))
            .driver(authService.mapToSummary(t.getDriver()))
            .status(t.getStatus())
            .origin(t.getOrigin())
            .destination(t.getDestination())
            .originLat(t.getOriginLat())
            .originLng(t.getOriginLng())
            .destLat(t.getDestLat())
            .destLng(t.getDestLng())
            .scheduledAt(t.getScheduledAt())
            .startedAt(t.getStartedAt())
            .endedAt(t.getEndedAt())
            .odometerStart(t.getOdometerStart())
            .odometerEnd(t.getOdometerEnd())
            .distanceKm(t.getDistanceKm())
            .fuelUsedLiters(t.getFuelUsedLiters())
            .cargoDescription(t.getCargoDescription())
            .cargoWeightTons(t.getCargoWeightTons())
            .notes(t.getNotes())
            .cancelledReason(t.getCancelledReason())
            .durationMinutes(t.getDurationMinutes())
            .createdAt(t.getCreatedAt())
            .build();
    }
}
