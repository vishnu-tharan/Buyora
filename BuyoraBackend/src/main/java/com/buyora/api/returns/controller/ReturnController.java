package com.buyora.api.returns.controller;

import com.buyora.api.returns.dto.CreateReturnRequest;
import com.buyora.api.returns.dto.ReturnResponse;
import com.buyora.api.returns.service.ReturnService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class ReturnController {

    private final ReturnService returnService;

    private final com.buyora.api.user.repository.UserRepository userRepository;

    @PostMapping("/orders/{orderNumber}/returns")
    public ResponseEntity<ReturnResponse> createReturn(
            @PathVariable String orderNumber,
            @Valid @RequestBody CreateReturnRequest request) {
        String email = com.buyora.api.auth.security.SecurityUtils.getCurrentUserEmail();
        com.buyora.api.user.entity.User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new com.buyora.api.common.exception.ResourceNotFoundException("User not found"));
        return ResponseEntity.ok(returnService.createReturn(orderNumber, user.getId(), request));
    }

    @GetMapping("/admin/returns")
    public ResponseEntity<Page<ReturnResponse>> getReturns(Pageable pageable) {
        return ResponseEntity.ok(returnService.getAllReturns(pageable));
    }

    @PatchMapping("/admin/returns/{id}/status")
    public ResponseEntity<ReturnResponse> updateReturnStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        return ResponseEntity.ok(returnService.updateReturnStatus(id, status));
    }
}
