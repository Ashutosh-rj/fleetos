package io.fleetos.controller;

import io.fleetos.dto.request.user.*;
import io.fleetos.dto.response.ApiResponse;
import io.fleetos.dto.response.PageResponse;
import io.fleetos.dto.response.auth.UserSummaryDto;
import io.fleetos.enums.UserRole;
import io.fleetos.enums.UserStatus;
import io.fleetos.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<UserSummaryDto>>> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) UserRole role,
            @RequestParam(required = false) UserStatus status,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {

        return ResponseEntity.ok(ApiResponse.success(
            userService.searchUsers(search, role, status, page, size)));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserSummaryDto>> me() {
        return ResponseEntity.ok(ApiResponse.success(userService.getMe()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<UserSummaryDto>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(userService.getUserById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<UserSummaryDto>> create(
            @Valid @RequestBody CreateUserRequest req) {
        UserSummaryDto dto = userService.createUser(req);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("User created", dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<UserSummaryDto>> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRequest req) {
        return ResponseEntity.ok(ApiResponse.success("User updated", userService.updateUser(id, req)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success("User deleted"));
    }
}
