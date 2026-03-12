package io.fleetos.service;

import io.fleetos.dto.request.user.*;
import io.fleetos.dto.response.PageResponse;
import io.fleetos.dto.response.auth.UserSummaryDto;
import io.fleetos.entity.User;
import io.fleetos.enums.UserRole;
import io.fleetos.enums.UserStatus;
import io.fleetos.exception.*;
import io.fleetos.repository.UserRepository;
import io.fleetos.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository  userRepository;
    private final PasswordEncoder passwordEncoder;
    private final SecurityUtils   securityUtils;
    private final AuthService     authService;

    // ----------------------------------------------------------------
    // Create (admin-side)
    // ----------------------------------------------------------------
    @Transactional
    public UserSummaryDto createUser(CreateUserRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new ConflictException("Email already in use: " + req.getEmail());
        }

        User user = User.builder()
            .fullName(req.getFullName())
            .email(req.getEmail().toLowerCase().trim())
            .passwordHash(passwordEncoder.encode(req.getPassword()))
            .phone(req.getPhone())
            .role(req.getRole())
            .status(UserStatus.ACTIVE)
            .emailVerified(false)
            .build();

        userRepository.save(user);
        log.info("User created by admin: {} role={}", user.getEmail(), user.getRole());
        return authService.mapToSummary(user);
    }

    // ----------------------------------------------------------------
    // Read
    // ----------------------------------------------------------------
    @Transactional(readOnly = true)
    public PageResponse<UserSummaryDto> searchUsers(
            String search, UserRole role, UserStatus status, int page, int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<User> result = userRepository.searchUsers(search, role, status, pageable);
        return new PageResponse<>(result.map(authService::mapToSummary));
    }

    @Transactional(readOnly = true)
    public UserSummaryDto getUserById(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User", id));
        return authService.mapToSummary(user);
    }

    @Transactional(readOnly = true)
    public UserSummaryDto getMe() {
        return authService.mapToSummary(securityUtils.getCurrentUser());
    }

    // ----------------------------------------------------------------
    // Update
    // ----------------------------------------------------------------
    @Transactional
    public UserSummaryDto updateUser(Long id, UpdateUserRequest req) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User", id));

        // Prevent SUPER_ADMIN demotion from outside
        User actor = securityUtils.getCurrentUser();
        if (user.getRole() == UserRole.SUPER_ADMIN && actor.getRole() != UserRole.SUPER_ADMIN) {
            throw new ForbiddenException("Only SUPER_ADMIN can modify another SUPER_ADMIN");
        }

        if (req.getFullName()       != null) user.setFullName(req.getFullName());
        if (req.getPhone()          != null) user.setPhone(req.getPhone());
        if (req.getRole()           != null) user.setRole(req.getRole());
        if (req.getStatus()         != null) user.setStatus(req.getStatus());
        if (req.getProfileImageUrl()!= null) user.setProfileImageUrl(req.getProfileImageUrl());

        userRepository.save(user);
        log.info("User updated: {}", id);
        return authService.mapToSummary(user);
    }

    // ----------------------------------------------------------------
    // Delete (hard – only SUPER_ADMIN)
    // ----------------------------------------------------------------
    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("User", id));
        User actor = securityUtils.getCurrentUser();

        if (user.getId().equals(actor.getId())) {
            throw new BadRequestException("You cannot delete your own account");
        }
        if (user.getRole() == UserRole.SUPER_ADMIN) {
            throw new ForbiddenException("Cannot delete a SUPER_ADMIN account");
        }

        userRepository.delete(user);
        log.warn("User {} deleted by {}", id, actor.getEmail());
    }
}
