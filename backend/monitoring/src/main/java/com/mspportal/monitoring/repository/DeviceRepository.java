package com.mspportal.monitoring.repository;

import com.mspportal.monitoring.entity.Device;
import com.mspportal.monitoring.enums.DeviceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DeviceRepository extends JpaRepository<Device, UUID> {
    List<Device> findBySiteId(UUID siteId);
    List<Device> findByStatus(DeviceStatus status);
    Optional<Device> findByIdAndTenantId(UUID id, String tenantId);
    
    long countBySiteId(UUID siteId);
    
    long countBySiteIdAndStatus(UUID siteId, DeviceStatus status);
    
    @org.springframework.data.jpa.repository.Query("SELECT d.id FROM Device d WHERE d.siteId = :siteId")
    List<UUID> findIdsBySiteId(@org.springframework.data.repository.query.Param("siteId") UUID siteId);
}

