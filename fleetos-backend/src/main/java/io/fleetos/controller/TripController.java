package io.fleetos.controller;

import io.fleetos.dto.request.trip.*;
import io.fleetos.dto.response.ApiResponse;
import io.fleetos.dto.response.PageResponse;
import io.fleetos.dto.response.trip.TripDto;
import io.fleetos.enums.TripStatus;
import io.fleetos.service.TripService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/trips")
@RequiredArgsConstructor
public class TripController {

    private final TripService tripService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<TripDto>>> list(
            @RequestParam(required = false) Long vehicleId,
            @RequestParam(required = false) Long driverId,
            @RequestParam(required = false) TripStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {

        return ResponseEntity.ok(ApiResponse.success(
            tripService.searchTrips(vehicleId, driverId, status, from, to, page, size)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TripDto>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(tripService.getTripById(id)));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<TripDto>>> getActive() {
        return ResponseEntity.ok(ApiResponse.success(tripService.getActiveTrips()));
    }

    @PostMapping("/start")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<TripDto>> startTrip(
            @Valid @RequestBody StartTripRequest req) {
        TripDto dto = tripService.startTrip(req);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Trip started", dto));
    }

    @PostMapping("/{id}/end")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<TripDto>> endTrip(
            @PathVariable Long id,
            @Valid @RequestBody EndTripRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Trip completed", tripService.endTrip(id, req)));
    }
}
