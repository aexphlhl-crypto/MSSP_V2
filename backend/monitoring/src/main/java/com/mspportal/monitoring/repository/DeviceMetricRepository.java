package com.mspportal.monitoring.repository;

import com.mspportal.monitoring.entity.DeviceMetric;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DeviceMetricRepository extends JpaRepository<DeviceMetric, UUID> {
    Page<DeviceMetric> findByDeviceIdOrderByCollectedAtDesc(UUID deviceId, Pageable pageable);
    Optional<DeviceMetric> findFirstByDeviceIdOrderByCollectedAtDesc(UUID deviceId);
    List<DeviceMetric> findByDeviceIdAndCollectedAtAfterOrderByCollectedAtAsc(UUID deviceId, java.time.Instant since);
}
