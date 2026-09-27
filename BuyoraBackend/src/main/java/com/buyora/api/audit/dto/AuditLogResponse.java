package com.buyora.api.audit.dto;

import java.time.Instant;
import java.util.UUID;

public record AuditLogResponse(
        UUID id,
        UUID actorId,
        String actorEmail,
        String action,
        String entityType,
        String entityId,
        String description,
        String metadata,
        String ipAddress,
        Instant createdAt
) {
}
