package com.mspportal.monitoring.repository;

import com.mspportal.monitoring.entity.Alert;
import com.mspportal.monitoring.enums.AlertStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;
import java.util.Optional;

@Repository
public interface AlertRepository extends JpaRepository<Alert, UUID> {
    List<Alert> findByDeviceId(UUID deviceId);
    List<Alert> findByDeviceIdIn(List<UUID> deviceIds);
    Optional<Alert> findByIdAndTenantId(UUID id, String tenantId);
    List<Alert> findByStatus(AlertStatus status);
    long countByDeviceIdInAndStatus(List<UUID> deviceIds, AlertStatus status);
    long countByDeviceIdInAndStatusAndSeverity(List<UUID> deviceIds, AlertStatus status, com.mspportal.monitoring.enums.AlertSeverity severity);
}
