package com.mspportal.backup.service;

import com.mspportal.backup.dto.BackupRepositoryResponse;
import com.mspportal.backup.dto.CreateBackupRepositoryRequest;
import com.mspportal.backup.dto.UpdateBackupRepositoryRequest;
import com.mspportal.backup.entity.BackupRepository;
import com.mspportal.backup.enums.BackupRepositoryStatus;
import com.mspportal.backup.repository.BackupRepositoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class BackupRepositoryService {

    private final BackupRepositoryRepository repositoryRepository;
    private final BackupServiceHelper helper;

    public BackupRepositoryService(BackupRepositoryRepository repositoryRepository, BackupServiceHelper helper) {
        this.repositoryRepository = repositoryRepository;
        this.helper = helper;
    }

    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<BackupRepositoryResponse> listRepositories(String requestedTenantId, org.springframework.data.domain.Pageable pageable, String search, com.mspportal.backup.enums.BackupRepositoryType type, BackupRepositoryStatus status) {
        return helper.withTenantImpersonationResult(requestedTenantId, () -> {
            org.springframework.data.jpa.domain.Specification<BackupRepository> spec = (root, query, cb) -> {
                java.util.List<jakarta.persistence.criteria.Predicate> predicates = new java.util.ArrayList<>();
                if (search != null && !search.isEmpty()) {
                    predicates.add(cb.like(cb.lower(root.get("name")), "%" + search.toLowerCase() + "%"));
                }
                if (type != null) {
                    predicates.add(cb.equal(root.get("type"), type));
                }
                if (status != null) {
                    predicates.add(cb.equal(root.get("status"), status));
                }
                return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
            };
            return repositoryRepository.findAll(spec, pageable).map(this::mapToResponse);
        });
    }

    @Transactional(readOnly = true)
    public com.mspportal.backup.dto.BackupRepositorySummary getSummary(String requestedTenantId) {
        return helper.withTenantImpersonationResult(requestedTenantId, () -> {
            java.util.List<BackupRepository> all = repositoryRepository.findAll();
            com.mspportal.backup.dto.BackupRepositorySummary summary = new com.mspportal.backup.dto.BackupRepositorySummary();
            summary.setTotalRepositories(all.size());
            summary.setTotalCapacityBytes(all.stream().filter(r -> r.getCapacityBytes() != null).mapToLong(BackupRepository::getCapacityBytes).sum());
            summary.setUsedCapacityBytes(all.stream().filter(r -> r.getUsedBytes() != null).mapToLong(BackupRepository::getUsedBytes).sum());
            return summary;
        });
    }

    @Transactional(readOnly = true)
    public BackupRepositoryResponse getRepository(UUID id, String requestedTenantId) {
        return helper.withTenantImpersonationResult(requestedTenantId, () -> {
            BackupRepository repo = repositoryRepository.findById(id).orElseThrow(() -> new RuntimeException("Repository not found"));
            return mapToResponse(repo);
        });
    }

    @Transactional
    public BackupRepositoryResponse createRepository(CreateBackupRepositoryRequest request, String requestedTenantId) {
        if (!helper.isPlatformUser() && !helper.isCustomerAdmin()) {
            throw new RuntimeException("403 Forbidden: Customer User cannot create repositories");
        }
        
        return helper.withTenantImpersonationResult(requestedTenantId, () -> {
            BackupRepository repo = new BackupRepository();
            repo.setName(request.getName());
            repo.setType(request.getType());
            repo.setEndpoint(request.getEndpoint());
            repo.setCapacityBytes(request.getCapacityBytes());
            repo.setUsedBytes(0L);
            repo.setStatus(BackupRepositoryStatus.ONLINE);
            repo.setLastCheckAt(Instant.now());
            
            return mapToResponse(repositoryRepository.save(repo));
        });
    }

    @Transactional
    public BackupRepositoryResponse updateRepository(UUID id, UpdateBackupRepositoryRequest request, String requestedTenantId) {
        if (!helper.isPlatformUser() && !helper.isCustomerAdmin()) {
            throw new RuntimeException("403 Forbidden: Customer User cannot update repositories");
        }

        return helper.withTenantImpersonationResult(requestedTenantId, () -> {
            BackupRepository repo = repositoryRepository.findById(id).orElseThrow(() -> new RuntimeException("Repository not found"));
            
            if (request.getName() != null) repo.setName(request.getName());
            if (request.getType() != null) repo.setType(request.getType());
            if (request.getEndpoint() != null) repo.setEndpoint(request.getEndpoint());
            if (request.getCapacityBytes() != null) repo.setCapacityBytes(request.getCapacityBytes());
            
            return mapToResponse(repositoryRepository.save(repo));
        });
    }

    private BackupRepositoryResponse mapToResponse(BackupRepository r) {
        BackupRepositoryResponse res = new BackupRepositoryResponse();
        res.setId(r.getId());
        res.setTenantId(r.getTenantId());
        res.setName(r.getName());
        res.setType(r.getType());
        res.setEndpoint(r.getEndpoint());
        res.setStatus(r.getStatus());
        res.setCapacityBytes(r.getCapacityBytes());
        res.setUsedBytes(r.getUsedBytes());
        res.setLastCheckAt(r.getLastCheckAt());
        return res;
    }
}
