package com.mspportal.backup.service;

import com.mspportal.backup.dto.BackupAlertResponse;
import com.mspportal.backup.entity.BackupAlert;
import com.mspportal.backup.enums.BackupAlertStatus;
import com.mspportal.backup.repository.BackupAlertRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class BackupAlertService {

    private final BackupAlertRepository alertRepository;
    private final BackupServiceHelper helper;

    public BackupAlertService(BackupAlertRepository alertRepository, BackupServiceHelper helper) {
        this.alertRepository = alertRepository;
        this.helper = helper;
    }

    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<BackupAlertResponse> listAlerts(
            String requestedTenantId,
            org.springframework.data.domain.Pageable pageable,
            String search,
            BackupAlertStatus status,
            com.mspportal.backup.enums.BackupAlertSeverity severity) {
        return helper.withTenantImpersonationResult(requestedTenantId, () -> {
            org.springframework.data.jpa.domain.Specification<BackupAlert> spec = (root, query, cb) -> {
                java.util.List<jakarta.persistence.criteria.Predicate> predicates = new java.util.ArrayList<>();
                if (search != null && !search.isBlank()) {
                    predicates.add(cb.like(cb.lower(root.get("title")), "%" + search.toLowerCase() + "%"));
                }
                if (status != null) {
                    predicates.add(cb.equal(root.get("status"), status));
                }
                if (severity != null) {
                    predicates.add(cb.equal(root.get("severity"), severity));
                }
                return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
            };
            return alertRepository.findAll(spec, pageable).map(this::mapToResponse);
        });
    }

    @Transactional(readOnly = true)
    public BackupAlertSummary getSummary(String requestedTenantId) {
        return helper.withTenantImpersonationResult(requestedTenantId, () -> {
            java.util.List<BackupAlert> all = alertRepository.findAll();
            BackupAlertSummary s = new BackupAlertSummary();
            s.setTotal((long) all.size());
            s.setOpen(all.stream().filter(a -> a.getStatus() == BackupAlertStatus.OPEN).count());
            s.setAcknowledged(all.stream().filter(a -> a.getStatus() == BackupAlertStatus.ACKNOWLEDGED).count());
            s.setResolved(all.stream().filter(a -> a.getStatus() == BackupAlertStatus.RESOLVED).count());
            s.setCritical(all.stream().filter(a -> a.getSeverity() == com.mspportal.backup.enums.BackupAlertSeverity.CRITICAL).count());
            return s;
        });
    }

    @Transactional(readOnly = true)
    public BackupAlertResponse getAlert(UUID id, String requestedTenantId) {
        return helper.withTenantImpersonationResult(requestedTenantId, () -> {
            BackupAlert alert = alertRepository.findById(id).orElseThrow(() -> new RuntimeException("Alert not found"));
            return mapToResponse(alert);
        });
    }

    @Transactional
    public BackupAlertResponse acknowledgeAlert(UUID id, String requestedTenantId) {
        if (!helper.isPlatformUser() && !helper.isCustomerAdmin()) {
            throw new RuntimeException("403 Forbidden: Customer User cannot acknowledge alerts");
        }

        return helper.withTenantImpersonationResult(requestedTenantId, () -> {
            BackupAlert alert = alertRepository.findById(id).orElseThrow(() -> new RuntimeException("Alert not found"));
            
            if (alert.getStatus() == BackupAlertStatus.OPEN) {
                alert.setStatus(BackupAlertStatus.ACKNOWLEDGED);
                alert = alertRepository.save(alert);
            }
            return mapToResponse(alert);
        });
    }

    @Transactional
    public BackupAlertResponse resolveAlert(UUID id, String requestedTenantId) {
        if (!helper.isPlatformUser() && !helper.isCustomerAdmin()) {
            throw new RuntimeException("403 Forbidden: Customer User cannot resolve alerts");
        }

        return helper.withTenantImpersonationResult(requestedTenantId, () -> {
            BackupAlert alert = alertRepository.findById(id).orElseThrow(() -> new RuntimeException("Alert not found"));
            
            if (alert.getStatus() == BackupAlertStatus.OPEN || alert.getStatus() == BackupAlertStatus.ACKNOWLEDGED) {
                alert.setStatus(BackupAlertStatus.RESOLVED);
                alert.setResolvedAt(Instant.now());
                alert = alertRepository.save(alert);
            }
            return mapToResponse(alert);
        });
    }

    private BackupAlertResponse mapToResponse(BackupAlert a) {
        BackupAlertResponse res = new BackupAlertResponse();
        res.setId(a.getId());
        res.setTenantId(a.getTenantId());
        res.setJobId(a.getJobId());
        res.setSeverity(a.getSeverity());
        res.setStatus(a.getStatus());
        res.setTitle(a.getTitle());
        res.setMessage(a.getMessage());
        res.setCreatedAt(a.getCreatedAt());
        res.setResolvedAt(a.getResolvedAt());
        return res;
    }
}
