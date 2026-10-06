package com.buyora.api.audit.service;

import com.buyora.api.audit.dto.AuditLogResponse;
import com.buyora.api.audit.entity.AuditLog;
import com.buyora.api.audit.repository.AuditLogRepository;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuditLogService {
  private final AuditLogRepository auditLogRepository;

  @Transactional
  public void logAction(
      UUID actorId,
      String actorEmail,
      String action,
      String entityType,
      String entityId,
      String description,
      String metadata,
      String ipAddress) {
    AuditLog log = new AuditLog();
    log.setActorId(actorId);
    log.setActorEmail(actorEmail);
    log.setAction(action);
    log.setEntityType(entityType);
    log.setEntityId(entityId);
    log.setDescription(description);
    log.setMetadata(metadata);
    log.setIpAddress(ipAddress);
    auditLogRepository.save(log);
  }

  @Transactional(readOnly = true)
  public Page<AuditLogResponse> getLogs(Pageable pageable) {
    return auditLogRepository
        .findAll(pageable)
        .map(
            log ->
                new AuditLogResponse(
                    log.getPublicId(),
                    log.getActorId(),
                    log.getActorEmail(),
                    log.getAction(),
                    log.getEntityType(),
                    log.getEntityId(),
                    log.getDescription(),
                    log.getMetadata(),
                    log.getIpAddress(),
                    log.getCreatedAt()));
  }
}
